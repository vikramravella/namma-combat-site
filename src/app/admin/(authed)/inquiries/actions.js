'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { DESIGNATIONS, INQUIRY_STAGES, SOURCES, PRIMARY_GOALS, EXPERIENCE_LEVELS, OFFERINGS } from '@/lib/constants';
import { normalizePhone } from '@/lib/phone';

const stageKeys = INQUIRY_STAGES.map((s) => s.key);
const sourceKeys = SOURCES.map((s) => s.key);
const offeringSet = new Set(OFFERINGS);

const inquirySchema = z.object({
  designation: z.enum([...DESIGNATIONS, '']).optional(),
  firstName: z.string().trim().min(1, 'First name required').max(80),
  lastName: z.string().trim().min(1, 'Last name required').max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{7,20}$/, 'Phone looks invalid'),
  primaryGoal: z.string().trim().max(120).optional().or(z.literal('')),
  experience: z.string().trim().max(40).optional().or(z.literal('')),
  source: z.enum([...sourceKeys, '']).optional(),
  sourceDetails: z.string().trim().max(200).optional().or(z.literal('')),
  stage: z.enum(stageKeys).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not authenticated');
  return session;
}

function clean(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v === '' || v === undefined ? null : v;
  }
  return out;
}

export async function createInquiry(formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  const normalizedPhone = normalizePhone(data.phone);
  if (!normalizedPhone) return { ok: false, error: 'Phone number looks invalid.' };
  data.phone = normalizedPhone;
  const interestedIn = formData.getAll('interestedIn').filter((v) => offeringSet.has(v));
  try {
    const created = await db.inquiry.create({
      data: {
        designation: data.designation,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        interestedIn,
        primaryGoal: data.primaryGoal,
        experience: data.experience,
        source: data.source,
        sourceDetails: data.sourceDetails,
        stage: data.stage || 'new',
        notes: data.notes,
        events: {
          create: {
            type: 'created',
            label: 'Inquiry created',
            detail: data.source ? `Source: ${data.source}${data.sourceDetails ? ' — ' + data.sourceDetails : ''}` : null,
            actorUserId: session.user.id,
          },
        },
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Inquiry', entityId: created.id, after: created });
    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');
    redirect(`/admin/inquiries/${created.id}?created=1`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    if (err?.code === 'P2002') return { ok: false, error: 'An inquiry with this phone already exists.' };
    console.error('createInquiry failed', err);
    return { ok: false, error: 'Could not create inquiry.' };
  }
}

export async function updateInquiry(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  const normalizedPhone = normalizePhone(data.phone);
  if (!normalizedPhone) return { ok: false, error: 'Phone number looks invalid.' };
  data.phone = normalizedPhone;
  const interestedIn = formData.getAll('interestedIn').filter((v) => offeringSet.has(v));
  try {
    const before = await db.inquiry.findUnique({ where: { id }, include: { trials: { select: { id: true } } } });

    // Detect what actually changed so we can write a journey event for
    // each — name corrections, phone updates, stage moves all belong on
    // the timeline so history is fully traceable.
    const diffs = [];
    if (data.firstName !== before.firstName || data.lastName !== before.lastName) {
      diffs.push({ label: 'Name updated', detail: `${before.firstName} ${before.lastName} → ${data.firstName} ${data.lastName}` });
    }
    if (data.phone !== before.phone) {
      diffs.push({ label: 'Phone updated', detail: `${before.phone} → ${data.phone}` });
    }
    if (data.primaryGoal !== before.primaryGoal && (data.primaryGoal || before.primaryGoal)) {
      diffs.push({ label: 'Primary goal updated', detail: `${before.primaryGoal || '—'} → ${data.primaryGoal || '—'}` });
    }
    if (data.source !== before.source && (data.source || before.source)) {
      diffs.push({ label: 'Source updated', detail: `${before.source || '—'} → ${data.source || '—'}` });
    }
    const stageChanged = data.stage && data.stage !== before.stage;

    const updated = await db.inquiry.update({
      where: { id },
      data: {
        designation: data.designation,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        interestedIn,
        primaryGoal: data.primaryGoal,
        experience: data.experience,
        source: data.source,
        sourceDetails: data.sourceDetails,
        stage: data.stage || before.stage,
        notes: data.notes,
        // Stage change clears the pending follow-up — same logic as changeStage.
        ...(stageChanged ? { nextFollowUpAt: null } : {}),
        events: diffs.length || stageChanged ? {
          create: [
            ...diffs.map((d) => ({ type: 'detail', label: d.label, detail: d.detail, actorUserId: session.user.id })),
            ...(stageChanged ? [{
              type: 'stage',
              label: `Stage → ${INQUIRY_STAGES.find((s) => s.key === data.stage)?.label || data.stage}`,
              actorUserId: session.user.id,
            }] : []),
          ],
        } : undefined,
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'Inquiry', entityId: id, before, after: updated });
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${id}`);
    // If the user moved this inquiry to "trial_booked" and there's no trial
    // yet, hand back a redirect target — the client will router.push so the
    // navigation works reliably from inside startTransition (where a thrown
    // server-side redirect() doesn't always propagate cleanly).
    const justMovedToTrial = data.stage === 'trial_booked' && before.stage !== 'trial_booked';
    if (justMovedToTrial && before.trials.length === 0) {
      return { ok: true, redirectTo: `/admin/trials/new?inquiryId=${id}` };
    }
    return { ok: true };
  } catch (err) {
    if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err;
    if (err?.code === 'P2002') return { ok: false, error: 'Another inquiry has this phone.' };
    console.error('updateInquiry failed', err);
    return { ok: false, error: 'Could not update.' };
  }
}

export async function deleteInquiry(id) {
  const session = await requireSession();
  try {
    const before = await db.inquiry.findUnique({ where: { id } });
    await db.inquiry.delete({ where: { id } });
    await logAudit({ actorUserId: session.user.id, action: 'delete', entity: 'Inquiry', entityId: id, before });
    revalidatePath('/admin/inquiries');
    redirect('/admin/inquiries');
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('deleteInquiry failed', err);
    return { ok: false, error: 'Could not delete.' };
  }
}

export async function changeStage(id, newStage, reason) {
  const session = await requireSession();
  if (!stageKeys.includes(newStage)) return { ok: false, error: 'Invalid stage' };
  try {
    const before = await db.inquiry.findUnique({ where: { id }, include: { trials: { select: { id: true } } } });
    if (!before) return { ok: false, error: 'Inquiry not found' };
    if (before.stage === newStage) return { ok: true };
    const stageLabel = INQUIRY_STAGES.find((s) => s.key === newStage)?.label || newStage;
    // Stage change supersedes any pending follow-up — the act of changing
    // stage IS the follow-up resolution. Clear nextFollowUpAt so this
    // person drops out of the calls-due queue automatically.
    await db.inquiry.update({
      where: { id },
      data: {
        stage: newStage,
        nextFollowUpAt: null,
        events: {
          create: {
            type: 'stage',
            label: `Stage → ${stageLabel}`,
            detail: reason || null,
            actorUserId: session.user.id,
          },
        },
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'stage_change', entity: 'Inquiry', entityId: id, before: { stage: before.stage }, after: { stage: newStage, reason } });
    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${id}`);
    if (newStage === 'trial_booked' && before.trials.length === 0) {
      return { ok: true, redirectTo: `/admin/trials/new?inquiryId=${id}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('changeStage failed', err);
    return { ok: false, error: 'Could not change stage.' };
  }
}

// Tick-mark "follow-up done" — clears the pending nextFollowUpAt and
// drops the inquiry out of the calls-due queue, leaving a journey
// event behind so the action is traceable.
export async function markFollowUpDone(id) {
  const session = await requireSession();
  try {
    const before = await db.inquiry.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Inquiry not found' };
    await db.inquiry.update({
      where: { id },
      data: {
        nextFollowUpAt: null,
        lastContactedAt: new Date(),
        followUpAttempts: { increment: 1 },
        events: {
          create: {
            type: 'note',
            label: 'Follow-up marked done',
            detail: before.nextFollowUpAt
              ? `Was due ${new Date(before.nextFollowUpAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : null,
            actorUserId: session.user.id,
          },
        },
      },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('markFollowUpDone failed', err);
    return { ok: false, error: 'Could not mark done.' };
  }
}

const eventSchema = z.object({
  type: z.enum(['called', 'whatsapp', 'in_person', 'note']),
  outcome: z.enum(['got_through', 'no_answer', 'busy', 'wrong_number', 'responded', '']).optional(),
  detail: z.string().trim().max(2000).optional().or(z.literal('')),
  nextFollowUpAt: z.string().optional().or(z.literal('')),
});

export async function logEvent(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { type, outcome, detail, nextFollowUpAt } = parsed.data;

  const labels = { called: 'Called', whatsapp: 'WhatsApp', in_person: 'Met in person', note: 'Note' };
  const next = nextFollowUpAt ? new Date(nextFollowUpAt) : null;

  try {
    const updates = { lastContactedAt: new Date() };
    // Bump attempts only for outreach (not for plain notes)
    if (['called', 'whatsapp', 'in_person'].includes(type)) {
      updates.followUpAttempts = { increment: 1 };
    }
    if (next) updates.nextFollowUpAt = next;

    await db.inquiry.update({
      where: { id },
      data: {
        ...updates,
        events: {
          create: {
            type,
            label: labels[type] || type,
            detail: detail || null,
            outcome: outcome || null,
            scheduledFor: next,
            actorUserId: session.user.id,
          },
        },
      },
    });

    // If they "responded", suggest moving stage forward (don't auto-do it)
    await logAudit({ actorUserId: session.user.id, action: 'log_event', entity: 'Inquiry', entityId: id, after: { type, outcome, detail, nextFollowUpAt: next } });
    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('logEvent failed', err);
    return { ok: false, error: 'Could not log event.' };
  }
}
