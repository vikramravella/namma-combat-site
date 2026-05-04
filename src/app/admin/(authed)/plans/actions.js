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

  // Prevent overlapping memberships using proper interval intersection:
  // two ranges [s1,e1] and [s2,e2] overlap iff s1 <= e2 AND s2 <= e1.
  // Earlier version only checked existing.endDate >= new.startDate, which
  // wrongly blocked backdated entries that ended before any existing
  // membership began.
  const liveOverlap = await db.plan.findFirst({
    where: {
      memberId,
      status: { in: ['active', 'on_freeze'] },
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } },
      ],
    },
    orderBy: { startDate: 'asc' },
  });
  if (liveOverlap) {
    const existingStart = new Date(liveOverlap.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const existingEnd = new Date(liveOverlap.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return {
      ok: false,
      error: `Membership overlaps with an existing one (${existingStart} → ${existingEnd}). Pick start + end dates that don't intersect that range.`,
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
          // Backdated entries (whose end date is already in the past) are
          // created in 'ended' status directly so they don't pollute the
          // active-membership counts or the calls/expiring queues.
          status: end < new Date() ? 'ended' : 'active',
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
    return { ok: false, error: 'Could not create membership.' };
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

  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) return { ok: false, error: 'Membership not found' };
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
    return { ok: false, error: 'Could not freeze membership.' };
  }
}

export async function endFreeze(planId) {
  const session = await requireSession();
  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'on_freeze') return { ok: false, error: 'Membership is not on freeze' };
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

// Edits the dates / bonusDays / notes on an existing plan. Money fields stay
// locked because they're snapshotted on the receipt. End date is always
// recomputed from start + base duration + bonus days, so we don't drift.
const editPlanDatesSchema = z.object({
  startDate: z.string().min(1, 'Start date required'),
  bonusDays: z.coerce.number().int().min(0).max(180).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export async function editPlanDates(planId, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = editPlanDatesSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { startDate, bonusDays, notes } = parsed.data;

  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) return { ok: false, error: 'Membership not found' };

  // Recompute end from the original cycle's base duration. We stored the
  // *effective* durationDays (including any prior bonus + any freeze
  // extensions) on the plan, so back-derive baseDays first.
  const priorBonus = plan.bonusDays || 0;
  // Note: freezes also extend endDate by freezeDaysUsed, but that's
  // bookkeeping on top of the base term — for "edit dates" on a backdated
  // entry, freezes haven't happened yet (freezeDaysUsed is 0 for paper
  // imports). If a plan has freezes, we refuse to recompute; staff should
  // unfreeze first.
  if ((plan.freezeDaysUsed || 0) > 0) {
    return { ok: false, error: 'Membership has freeze days applied. End the freeze first, then edit dates.' };
  }
  const baseDays = (plan.durationDays || 0) - priorBonus;
  if (baseDays <= 0) return { ok: false, error: 'Base duration looks corrupted; edit blocked.' };

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + baseDays + bonusDays);

  // Overlap guard, excluding this plan itself.
  const liveOverlap = await db.plan.findFirst({
    where: {
      id: { not: planId },
      memberId: plan.memberId,
      status: { in: ['active', 'on_freeze'] },
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } },
      ],
    },
    orderBy: { startDate: 'asc' },
  });
  if (liveOverlap) {
    const existingStart = new Date(liveOverlap.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const existingEnd = new Date(liveOverlap.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return { ok: false, error: `New dates overlap an existing membership (${existingStart} → ${existingEnd}).` };
  }

  try {
    const before = { startDate: plan.startDate, endDate: plan.endDate, bonusDays: plan.bonusDays, durationDays: plan.durationDays, notes: plan.notes, status: plan.status };
    const newDuration = baseDays + bonusDays;
    const newStatus = end < new Date()
      ? (plan.status === 'cancelled' || plan.status === 'on_freeze' ? plan.status : 'ended')
      : (plan.status === 'ended' ? 'active' : plan.status);

    const updated = await db.plan.update({
      where: { id: planId },
      data: {
        startDate: start,
        endDate: end,
        bonusDays,
        durationDays: newDuration,
        notes: notes || null,
        status: newStatus,
      },
    });
    await syncMemberStatusFromPlans(null, plan.memberId);
    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'Plan', entityId: planId, before, after: { startDate: start, endDate: end, bonusDays, durationDays: newDuration, notes, status: newStatus } });

    revalidatePath('/admin');
    revalidatePath('/admin/plans');
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/members/${plan.memberId}`);
    return { ok: true };
  } catch (err) {
    console.error('editPlanDates failed', err);
    return { ok: false, error: 'Could not save changes.' };
  }
}

export async function cancelPlan(planId, reason) {
  const session = await requireSession();
  try {
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) return { ok: false, error: 'Membership not found' };
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
