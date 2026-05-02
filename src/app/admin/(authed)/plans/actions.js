'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { TIERS, CYCLES, FREEZE_POLICY, PLAN_STATUSES } from '@/lib/constants';
import { reverseCalc, basePricePaise, cycleMeta, computeEndDate, fiscalYearOf, formatInvoiceNumber } from '@/lib/calc';
import { rupeesInputToPaise, fullName } from '@/lib/format';

const tierKeys = TIERS.map((t) => t.key);
const cycleKeys = CYCLES.map((c) => c.key);

const planSchema = z.object({
  memberId: z.string().min(1),
  tier: z.enum(tierKeys),
  cycle: z.enum(cycleKeys),
  startDate: z.string().min(1, 'Start date required'),
  bonusDays: z.coerce.number().int().min(0).max(180).default(0),
  agreedFinal: z.string().optional().or(z.literal('')),
  customerGstin: z.string().trim().regex(/^[0-9A-Z]{15}$/, 'GSTIN must be 15 chars').optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
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
  const { memberId, tier, cycle, startDate, bonusDays, agreedFinal, customerGstin, notes } = parsed.data;

  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) return { ok: false, error: 'Member not found' };

  const meta = cycleMeta(cycle);
  if (!meta) return { ok: false, error: 'Invalid cycle' };

  const basePaise = basePricePaise(tier, cycle);
  const agreedPaise = rupeesInputToPaise(agreedFinal); // null if blank → full price
  const calc = reverseCalc(basePaise, agreedPaise);
  if (calc.discountFinalPaise < 0) {
    return { ok: false, error: 'Agreed amount cannot exceed full price.' };
  }

  const start = new Date(startDate);
  const end = computeEndDate(start, cycle, bonusDays);
  const fiscalYear = fiscalYearOf(new Date());

  try {
    const result = await db.$transaction(async (tx) => {
      const seq = await nextSequenceForFY(tx, fiscalYear);
      const invoiceNumber = formatInvoiceNumber(fiscalYear, seq);

      const plan = await tx.plan.create({
        data: {
          memberId,
          tier,
          cycle,
          floorAccess: TIERS.find((t) => t.key === tier).floor,
          startDate: start,
          endDate: end,
          durationDays: meta.days + bonusDays,
          bonusDays,
          freezeDaysAllowed: meta.freezeDays,
          basePricePaise: basePaise,
          agreedFinalPaise: calc.totalPaise,
          customerGstin: customerGstin || null,
          notes: notes || null,
          status: 'running',
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
      data: { status: 'running', freezeStart: null, freezeEnd: null, freezeReason: null },
    });
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
    await logAudit({ actorUserId: session.user.id, action: 'cancel', entity: 'Plan', entityId: planId, before: { status: plan.status }, after: { status: 'cancelled', reason } });
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/members/${plan.memberId}`);
    return { ok: true };
  } catch (err) {
    console.error('cancelPlan failed', err);
    return { ok: false, error: 'Could not cancel.' };
  }
}
