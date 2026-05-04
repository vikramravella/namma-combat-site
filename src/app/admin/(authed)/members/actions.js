'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { DESIGNATIONS, MEMBER_STATUSES, SKILL_LEVELS, PAYMENT_METHODS } from '@/lib/constants';
import { normalizePhone } from '@/lib/phone';
import { inferKidDesignation } from '@/lib/designation';
import { normalizeHealthNote } from '@/lib/health-notes';
import { reverseCalc, fiscalYearOf, formatInvoiceNumber } from '@/lib/calc';
import { rupeesInputToPaise, fullName as fullNameOf } from '@/lib/format';
import { syncMemberStatusFromPlans } from '@/lib/member-status';

const methodKeys = PAYMENT_METHODS.map((m) => m.key);

const statusKeys = MEMBER_STATUSES.map((s) => s.key);
const skillKeys = SKILL_LEVELS.map((s) => s.key);

const memberSchema = z.object({
  designation: z.enum([...DESIGNATIONS, '']).optional(),
  firstName: z.string().trim().min(1, 'First name required').max(80),
  lastName: z.string().trim().min(1, 'Last name required').max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{7,20}$/, 'Phone looks invalid'),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().trim().max(20).optional().or(z.literal('')),
  primaryDiscipline: z.string().trim().max(80).optional().or(z.literal('')),
  disciplines: z.string().trim().max(300).optional().or(z.literal('')),
  skillLevel: z.enum(skillKeys).optional(),
  status: z.enum(statusKeys).optional(),
  emergencyName: z.string().trim().max(120).optional().or(z.literal('')),
  emergencyPhone: z.string().trim().max(20).optional().or(z.literal('')),
  emergencyRelation: z.string().trim().max(60).optional().or(z.literal('')),
  medicalConditions: z.string().trim().max(2000).optional().or(z.literal('')),
  injuries: z.string().trim().max(2000).optional().or(z.literal('')),
  medications: z.string().trim().max(2000).optional().or(z.literal('')),
  medicalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  criticalHealthFlag: z.string().optional(),
  smokes: z.string().optional(),
  mediaConsent: z.enum(['true', 'false', '']).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function clean(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) out[k] = v === '' || v === undefined ? null : v;
  if (out.dob) out.dob = new Date(out.dob);
  return out;
}

export async function updateMember(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = memberSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  const normalizedPhone = normalizePhone(data.phone);
  if (!normalizedPhone) return { ok: false, error: 'Phone number looks invalid.' };
  data.phone = normalizedPhone;
  data.designation = inferKidDesignation(data.dob, data.gender, data.designation);
  try {
    const before = await db.member.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Member not found' };

    const updated = await db.$transaction(async (tx) => {
      const m = await tx.member.update({
        where: { id },
        data: {
          designation: data.designation,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dob: data.dob,
          gender: data.gender,
          primaryDiscipline: data.primaryDiscipline,
          disciplines: data.disciplines,
          skillLevel: data.skillLevel || before.skillLevel,
          status: data.status || before.status,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          emergencyRelation: data.emergencyRelation,
          medicalConditions: normalizeHealthNote(data.medicalConditions),
          injuries: normalizeHealthNote(data.injuries),
          medications: normalizeHealthNote(data.medications),
          medicalNotes: normalizeHealthNote(data.medicalNotes),
          criticalHealthFlag: data.criticalHealthFlag === 'true',
          smokes: data.smokes === 'true',
          mediaConsent: data.mediaConsent === 'true' ? true : data.mediaConsent === 'false' ? false : null,
          notes: data.notes,
        },
      });

      // Cascade snapshot updates to all this member's receipts (preserves the
      // legal "snapshot at issue" but reflects corrections — receipt gets a
      // revision marker so it's clear it was edited post-issue).
      const fullName = [data.designation ? `${data.designation}.` : '', data.firstName, data.lastName].filter(Boolean).join(' ').trim();
      const plans = await tx.plan.findMany({ where: { memberId: id }, select: { id: true } });
      if (plans.length > 0) {
        const planIds = plans.map((p) => p.id);
        const receipts = await tx.receipt.findMany({ where: { planId: { in: planIds } }, select: { id: true, customerNameSnapshot: true, customerPhoneSnapshot: true, customerGstinSnapshot: true } });
        for (const r of receipts) {
          if (r.customerNameSnapshot !== fullName || r.customerPhoneSnapshot !== data.phone) {
            await tx.receipt.update({
              where: { id: r.id },
              data: {
                customerNameSnapshot: fullName,
                customerPhoneSnapshot: data.phone,
                revisionCount: { increment: 1 },
                lastRevisedAt: new Date(),
              },
            });
          }
        }
      }
      return m;
    });

    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'Member', entityId: id, before, after: updated });
    revalidatePath('/admin');
    revalidatePath('/admin/members');
    revalidatePath(`/admin/members/${id}`);
    revalidatePath('/admin/receipts');
    revalidatePath('/admin/alerts');
    revalidatePath('/admin/alerts/health');
    revalidatePath('/admin/alerts/smokers');
    revalidatePath('/admin/alerts/media');
    return { ok: true };
  } catch (err) {
    if (err?.code === 'P2002') return { ok: false, error: 'Another member has this phone.' };
    console.error('updateMember failed', err);
    return { ok: false, error: 'Could not update.' };
  }
}

export async function setSkillLevel(id, newLevel) {
  const session = await requireSession();
  if (!skillKeys.includes(newLevel)) return { ok: false, error: 'Invalid skill level' };
  try {
    const before = await db.member.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Member not found' };
    if (before.skillLevel === newLevel) return { ok: true };
    await db.member.update({ where: { id }, data: { skillLevel: newLevel } });
    await logAudit({ actorUserId: session.user.id, action: 'skill_change', entity: 'Member', entityId: id, before: { skillLevel: before.skillLevel }, after: { skillLevel: newLevel } });
    revalidatePath('/admin/members');
    revalidatePath(`/admin/members/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('setSkillLevel failed', err);
    return { ok: false, error: 'Could not update skill level.' };
  }
}

export async function deleteMember(id) {
  const session = await requireSession();
  try {
    const before = await db.member.findUnique({
      where: { id },
      include: {
        plans: { select: { id: true, receipt: { select: { id: true, status: true, invoiceNumber: true } } } },
        fromTrial: { select: { id: true, inquiryId: true } },
        fromInquiry: { select: { id: true } },
      },
    });
    if (!before) return { ok: false, error: 'Member not found' };

    // Refuse only if the member still has a NON-VOID receipt. Voided
    // receipts are no longer legal records — they're already retired
    // from the books and can be cleaned up alongside the member. Plans
    // attached to non-void receipts stay protected.
    const liveReceipts = before.plans
      .map((p) => p.receipt)
      .filter((r) => r && r.status !== 'void');
    if (liveReceipts.length > 0) {
      const nums = liveReceipts.map((r) => r.invoiceNumber).join(', ');
      return { ok: false, error: `This member has live receipts (${nums}). Void those first, then delete.` };
    }

    // Cascade the lifecycle chain so the deleted member doesn't leave behind
    // an orphan inquiry or trial. Plans + (void) receipts + payments cascade
    // automatically via the schema's onDelete:Cascade FKs.
    const trialId = before.fromTrial?.id || null;
    const trialInquiryId = before.fromTrial?.inquiryId || null;
    const inquiryId = before.fromInquiry?.id || trialInquiryId || null;

    await db.$transaction(async (tx) => {
      await tx.member.delete({ where: { id } });
      if (trialId) await tx.trial.delete({ where: { id: trialId } }).catch(() => {});
      if (inquiryId) await tx.inquiry.delete({ where: { id: inquiryId } }).catch(() => {});
    });
    await logAudit({ actorUserId: session.user.id, action: 'delete', entity: 'Member', entityId: id, before });
    revalidatePath('/admin');
    revalidatePath('/admin/members');
    revalidatePath('/admin/trials');
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin/alerts');
    revalidatePath('/admin/alerts/health');
    revalidatePath('/admin/alerts/smokers');
    revalidatePath('/admin/alerts/media');
    revalidatePath('/admin/alerts/calls');
    revalidatePath('/admin/alerts/trials');
    revalidatePath('/admin/alerts/convert');
    redirect('/admin/members');
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('deleteMember failed', err);
    return { ok: false, error: 'Could not delete.' };
  }
}

// Bulk-import path for backdated paper entries: creates Member +
// first Plan + Receipt (+ Payment if recorded) in one transaction.
// Skips the inquiry → trial → convert lifecycle which is built for
// fresh leads, not historical data.
const quickAddSchema = z.object({
  designation: z.enum([...DESIGNATIONS, '']).optional(),
  firstName: z.string().trim().min(1, 'First name required').max(80),
  lastName: z.string().trim().min(1, 'Last name required').max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{7,20}$/, 'Phone looks invalid'),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().trim().max(20).optional().or(z.literal('')),
  primaryDiscipline: z.string().trim().max(80).optional().or(z.literal('')),

  membershipTypeId: z.string().min(1, 'Membership type required'),
  startDate: z.string().min(1, 'Start date required'),
  bonusDays: z.coerce.number().int().min(0).max(180).default(0),
  agreedFinal: z.string().optional().or(z.literal('')),
  customerGstin: z.string().trim().regex(/^[0-9A-Z]{15}$/, 'GSTIN must be 15 chars').optional().or(z.literal('')),
  floorChoice: z.enum(['Arena', 'Sanctuary']).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),

  // Payment is optional — leave blank to leave the receipt as "issued"
  paymentAmount: z.string().optional().or(z.literal('')),
  paymentMethod: z.enum([...methodKeys, '']).optional(),
  paymentReceivedAt: z.string().optional().or(z.literal('')),
  paymentReference: z.string().trim().max(120).optional().or(z.literal('')),
});

export async function quickAddMember(formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = quickAddSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const normalizedPhone = normalizePhone(d.phone);
  if (!normalizedPhone) return { ok: false, error: 'Phone number looks invalid.' };

  const existingMember = await db.member.findUnique({ where: { phone: normalizedPhone } });
  if (existingMember) {
    return { ok: false, error: `A member with phone ${normalizedPhone} already exists. Add a membership to them via their member page.` };
  }

  const type = await db.membershipType.findUnique({ where: { id: d.membershipTypeId } });
  if (!type) return { ok: false, error: 'Membership type not found' };
  if (!type.active) return { ok: false, error: 'That membership type is no longer active.' };

  const requiresFloorChoice = type.tier === 'Silver' || /\bOR\b/.test(type.floorAccess || '');
  if (requiresFloorChoice && !d.floorChoice) return { ok: false, error: 'Pick which floor: Arena or Sanctuary.' };

  const basePaise = type.basePriceRupees * 100;
  const agreedPaise = rupeesInputToPaise(d.agreedFinal);
  const calc = reverseCalc(basePaise, agreedPaise);
  if (calc.discountFinalPaise < 0) return { ok: false, error: 'Agreed amount cannot exceed full price.' };

  const start = new Date(d.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + type.durationDays + d.bonusDays);

  // Receipt's fiscal year + invoice number are derived from issueDate,
  // which for backdated entries we anchor to the START date (so old
  // receipts file under the right FY).
  const fiscalYear = fiscalYearOf(start);

  const designation = inferKidDesignation(d.dob || null, d.gender || null, d.designation || '');

  // Payment side
  let paymentAmountPaise = 0;
  if (d.paymentAmount && Number(d.paymentAmount) > 0) {
    paymentAmountPaise = rupeesInputToPaise(d.paymentAmount) || 0;
  }
  const paymentReceivedAt = d.paymentReceivedAt ? new Date(d.paymentReceivedAt) : start;

  try {
    const result = await db.$transaction(async (tx) => {
      // 1) Member
      const member = await tx.member.create({
        data: {
          designation: designation || null,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: normalizedPhone,
          dob: d.dob ? new Date(d.dob) : null,
          gender: d.gender || null,
          primaryDiscipline: d.primaryDiscipline || null,
          skillLevel: 'Beginner',
          status: 'active',
          joinedAt: start, // backdate to membership start
        },
      });

      // 2) Plan
      const finalFloorAccess = requiresFloorChoice ? `${d.floorChoice} only` : (type.floorAccess || '');
      const plan = await tx.plan.create({
        data: {
          memberId: member.id,
          tier: type.tier,
          cycle: type.cycle,
          floorAccess: finalFloorAccess,
          startDate: start,
          endDate: end,
          durationDays: type.durationDays + d.bonusDays,
          bonusDays: d.bonusDays,
          freezeDaysAllowed: type.freezeDaysAllowed,
          basePricePaise: basePaise,
          agreedFinalPaise: calc.totalPaise,
          customerGstin: d.customerGstin || null,
          notes: d.notes || null,
          status: end < new Date() ? 'ended' : 'active',
        },
      });

      // 3) Receipt (next sequence in the chosen FY)
      const max = await tx.receipt.aggregate({
        where: { fiscalYear },
        _max: { sequence: true },
      });
      const seq = (max._max.sequence ?? 0) + 1;
      const receipt = await tx.receipt.create({
        data: {
          planId: plan.id,
          invoiceNumber: formatInvoiceNumber(fiscalYear, seq),
          fiscalYear,
          sequence: seq,
          issueDate: start,
          customerNameSnapshot: fullNameOf({ designation: designation || null, firstName: d.firstName, lastName: d.lastName }),
          customerPhoneSnapshot: normalizedPhone,
          customerGstinSnapshot: d.customerGstin || null,
          grossTaxablePaise: calc.grossTaxablePaise,
          discountFinalPaise: calc.discountFinalPaise,
          discountPreTaxPaise: calc.discountPreTaxPaise,
          netTaxablePaise: calc.netTaxablePaise,
          cgstPaise: calc.cgstPaise,
          sgstPaise: calc.sgstPaise,
          totalPaise: calc.totalPaise,
          status: 'issued',
        },
      });

      // 4) Payment (optional)
      if (paymentAmountPaise > 0 && d.paymentMethod) {
        await tx.payment.create({
          data: {
            receiptId: receipt.id,
            method: d.paymentMethod,
            reference: d.paymentReference || null,
            amountPaise: paymentAmountPaise,
            receivedAt: paymentReceivedAt,
          },
        });
        // Recompute receipt status after payment
        const tolerance = 99;
        const newStatus = paymentAmountPaise + tolerance >= calc.totalPaise ? 'paid' : 'partial';
        await tx.receipt.update({ where: { id: receipt.id }, data: { status: newStatus } });
      }

      await syncMemberStatusFromPlans(tx, member.id);
      return { member, plan, receipt };
    });

    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Member', entityId: result.member.id, after: result.member });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Plan', entityId: result.plan.id, after: result.plan });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Receipt', entityId: result.receipt.id, after: result.receipt });

    revalidatePath('/admin');
    revalidatePath('/admin/members');
    revalidatePath('/admin/plans');
    revalidatePath('/admin/receipts');
    redirect(`/admin/receipts/${result.receipt.id}?created=1`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    if (err?.code === 'P2002') return { ok: false, error: 'A member with this phone already exists.' };
    console.error('quickAddMember failed', err);
    return { ok: false, error: 'Could not save. Check the values and try again.' };
  }
}
