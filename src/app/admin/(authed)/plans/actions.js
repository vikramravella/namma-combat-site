'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { FREEZE_POLICY, PLAN_STATUSES } from '@/lib/constants';
import { reverseCalc, fiscalYearOf, formatInvoiceNumber } from '@/lib/calc';
import { rupeesInputToPaise, fullName } from '@/lib/format';
import { syncMemberStatusFromPlans } from '@/lib/member-status';

const planSchema = z.object({
  memberId: z.string().min(1),
  membershipTypeId: z.string().min(1, 'Membership type required'),
  startDate: z.string().min(1, 'Start date required'),
  bonusDays: z.coerce.number().int().min(0).max(180).default(0),
  agreedFinal: z.string().optional().or(z.literal('')),
  customerGstin: z.string().trim().regex(/^[0-9A-Z]{15}$/, 'GSTIN must be 15 chars').optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  floorChoice: z.enum(['Arena', 'Sanctuary']).optional(),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

async function nextSequenceForFY(tx, fiscalYear) {
  const max = await tx.receipt.aggregate({
    where: { fiscalYear },
    _max: { sequence: true },
  });
  return (max._max.sequence ?? 0) + 1;
}

export async function createPlan(formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = planSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { memberId, membershipTypeId, startDate, bonusDays, agreedFinal, customerGstin, notes, floorChoice } = parsed.data;

  const [member, type] = await Promise.all([
    db.member.findUnique({ where: { id: memberId } }),
    db.membershipType.findUnique({ where: { id: membershipTypeId } }),
  ]);
  if (!member) return { ok: false, error: 'Member not found' };
  if (!type) return { ok: false, error: 'Membership type not found' };
  if (!type.active) return { ok: false, error: 'That membership type is no longer active. Pick another.' };
  // Single-floor tiers (e.g. Silver) require an explicit floor pick.
  const requiresFloorChoice = type.tier === 'Silver' || /\bOR\b/.test(type.floorAccess || '');
  if (requiresFloorChoice && !floorChoice) return { ok: false, error: 'Pick which floor: Arena or Sanctuary.' };

  const tier = type.tier;
  const cycle = type.cycle;
  const basePaise = type.basePriceRupees * 100;
  const agreedPaise = rupeesInputToPaise(agreedFinal); // null if blank → full price
  const calc = reverseCalc(basePaise, agreedPaise);
  if (calc.discountFinalPaise < 0) {
    return { ok: false, error: 'Agreed amount cannot exceed full price.' };
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + type.durationDays + bonusDays);
  const fiscalYear = fiscalYearOf(new Date());

  // Prevent overlapping memberships. A renewal is fine — its start date must
  // sit strictly AFTER the current active/on_freeze plan's end date. Without
  // this guard the system was happily creating two simultaneous active plans
  // for the same member.
  const liveOverlap = await db.plan.findFirst({
    where: {
      memberId,
      status: { in: ['active', 'on_freeze'] },
      endDate: { gte: start },
    },
    orderBy: { endDate: 'desc' },
  });
  if (liveOverlap) {
    const existingEnd = new Date(liveOverlap.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return {
      ok: false,
      error: `Member already has an active membership running until ${existingEnd}. Set the new start date to after that.`,
    };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const seq = await nextSequenceForFY(tx, fiscalYear);
      const invoiceNumber = formatInvoiceNumber(fiscalYear, seq);

      const finalFloorAccess = requiresFloorChoice
        ? `${floorChoice} only`
        : (type.floorAccess || '');
      const plan = await tx.plan.create({
        data: {
          memberId,
          tier,
          cycle,
          floorAccess: finalFloorAccess,
          startDate: start,
          endDate: end,
          durationDays: type.durationDays + bonusDays,
          bonusDays,
          freezeDaysAllowed: type.freezeDaysAllowed,
          basePricePaise: basePaise,
          agreedFinalPaise: calc.totalPaise,
          customerGstin: customerGstin || null,
          notes: notes || null,
          status: 'active',
        },
      });

      const receipt = await tx.receipt.create({
        data: {
          planId: plan.id,
          invoiceNumber,
          fiscalYear,
          sequence: seq,
          customerNameSnapshot: fullName(member),
          customerPhoneSnapshot: member.phone,
          customerGstinSnapshot: customerGstin || null,
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

      await syncMemberStatusFromPlans(tx, memberId);
      return { plan, receipt };
    });

    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Plan', entityId: result.plan.id, after: result.plan });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Receipt', entityId: result.receipt.id, after: result.receipt });

    revalidatePath('/admin');
    revalidatePath('/admin/plans');
    revalidatePath('/admin/receipts');
    revalidatePath(`/admin/members/${memberId}`);
    redirect(`/admin/receipts/${result.receipt.id}?created=1`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('createPlan failed', err);
    return { ok: false, error: 'Could not create plan.' };
  }
}

const freezeSchema = z.object({
  freezeStart: z.string().min(1, 'Start date required'),
  freezeEnd: z.string().min(1, 'End date required'),
  freezeReason: z.string().trim().max(500).optional().or(z.literal('')),
  medicalException: z.coerce.boolean().optional(),
});

export async function freezePlan(planId, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = freezeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { freezeStart, freezeEnd, freezeReason, medicalException } = parsed.data;

  const start = new Date(freezeStart);
  const end = new Date(freezeEnd);
  if (end <= start) return { ok: false, error: 'End date must be after start date.' };

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (!medicalException && days < FREEZE_POLICY.minDaysPerFreeze) {
    return { ok: false, error: `Minimum freeze is ${FREEZE_POLICY.minDaysPerFreeze} days (or use medical exception).` };
  }

  // Advance notice check
  const noticeMs = (start - new Date()) / (1000 * 60 * 60 * 24);
  if (!medicalException && noticeMs < FREEZE_POLICY.advanceNoticeDays) {
    return { ok: false, error: `Freezes need ${FREEZE_POLICY.advanceNoticeDays} days advance notice (or use medical exception).` };
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) return { ok: false, error: 'Plan not found' };
    const newUsed = (plan.freezeDaysUsed || 0) + days;
    if (!medicalException && newUsed > plan.freezeDaysAllowed) {
      return { ok: false, error: `Freeze would exceed allowance (${plan.freezeDaysAllowed} days). Used so far: ${plan.freezeDaysUsed}; this freeze: ${days}.` };
    }
    // Extend end date by freeze days
    const newEndDate = new Date(plan.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);

    const updated = await db.plan.update({
      where: { id: planId },
      data: {
        freezeStart: start,
        freezeEnd: end,
        freezeReason: freezeReason || null,
        freezeDaysUsed: newUsed,
        endDate: newEndDate,
        status: 'on_freeze',
      },
    });
    await syncMemberStatusFromPlans(null, plan.memberId);

    await logAudit({ actorUserId: session.user.id, action: 'freeze', entity: 'Plan', entityId: planId, before: { endDate: plan.endDate, freezeDaysUsed: plan.freezeDaysUsed }, after: { freezeStart: start, freezeEnd: end, days, newEndDate, medicalException } });
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/members/${plan.memberId}`);
    return { ok: true };
  } catch (err) {
    console.error('freezePlan failed', err);
    return { ok: false, error: 'Could not freeze plan.' };
  }
}

export async function endFreeze(planId) {
  const session = await requireSession();
  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'on_freeze') return { ok: false, error: 'Plan is not on freeze' };
    await db.plan.update({
      where: { id: planId },
      data: { status: 'active', freezeStart: null, freezeEnd: null, freezeReason: null },
    });
    await syncMemberStatusFromPlans(null, plan.memberId);
    await logAudit({ actorUserId: session.user.id, action: 'end_freeze', entity: 'Plan', entityId: planId });
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/members/${plan.memberId}`);
    return { ok: true };
  } catch (err) {
    console.error('endFreeze failed', err);
    return { ok: false, error: 'Could not end freeze.' };
  }
}

export async function cancelPlan(planId, reason) {
  const session = await requireSession();
  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) return { ok: false, error: 'Plan not found' };
    await db.plan.update({
      where: { id: planId },
      data: { status: 'cancelled', notes: [plan.notes, `Cancelled: ${reason || 'no reason given'}`].filter(Boolean).join('\n\n') },
    });
    await syncMemberStatusFromPlans(null, plan.memberId);
    await logAudit({ actorUserId: session.user.id, action: 'cancel', entity: 'Plan', entityId: planId, before: { status: plan.status }, after: { status: 'cancelled', reason } });
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/members/${plan.memberId}`);
    return { ok: true };
  } catch (err) {
    console.error('cancelPlan failed', err);
    return { ok: false, error: 'Could not cancel.' };
  }
}
