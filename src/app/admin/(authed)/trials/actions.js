'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { TRIAL_STATUSES, TRIAL_OUTCOMES, INQUIRY_STAGES } from '@/lib/constants';
import { inferKidDesignation } from '@/lib/designation';
import { coachFor, nextOccurrence, DAY_LABELS } from '@/lib/schedule';
import { randomToken } from '@/lib/format';

const statusKeys = TRIAL_STATUSES.map((s) => s.key);
const outcomeKeys = TRIAL_OUTCOMES.map((s) => s.key);

const scheduleSchema = z.object({
  inquiryId: z.string().min(1),
  area: z.enum(['Arena', 'Sanctuary']),
  discipline: z.string().min(1),
  dayIndex: z.coerce.number().int().min(0).max(6),
  time: z.string().min(1),
  scheduledDate: z.string().optional(), // ISO; if blank, use next occurrence
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not authenticated');
  return session;
}

export async function scheduleTrial(formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = scheduleSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { inquiryId, area, discipline, dayIndex, time } = parsed.data;
  const day = DAY_LABELS[dayIndex];
  const scheduledDate = parsed.data.scheduledDate
    ? new Date(parsed.data.scheduledDate)
    : nextOccurrence(dayIndex);

  const coachName = coachFor(area, discipline, time);
  let coachId = null;
  if (coachName) {
    // Try to match a single coach by exact name; multi-coach strings (e.g. "Naeem, Spoorthi or Manoj") stay null
    const single = await db.coach.findFirst({ where: { name: coachName.split(',')[0].trim() } });
    if (single && !coachName.includes(',') && !coachName.includes(' or ')) coachId = single.id;
  }

  try {
    const trial = await db.trial.create({
      data: {
        inquiryId,
        scheduledDate,
        scheduledTime: time,
        day,
        area,
        discipline,
        coachId,
        status: 'booked',
        events: {
          create: {
            type: 'scheduled',
            label: 'Trial scheduled',
            detail: `${discipline} · ${day} ${time}${coachName ? ' · ' + coachName : ''} — registration form pending`,
            actorUserId: session.user.id,
            scheduledFor: scheduledDate,
          },
        },
      },
    });

    // Generate a unique health-form token (14-day expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    await db.healthFormToken.create({
      data: {
        trialId: trial.id,
        token: randomToken(20),
        expiresAt,
      },
    });

    // Move inquiry to "trial_booked" stage + log event
    const inquiryBefore = await db.inquiry.findUnique({ where: { id: inquiryId } });
    await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        stage: 'trial_booked',
        nextFollowUpAt: scheduledDate, // remind on trial day
        events: {
          create: {
            type: 'stage',
            label: 'Stage → Interested in trial',
            detail: `${discipline} · ${day} ${time} (${formatDate(scheduledDate)})${coachName ? ' · ' + coachName : ''}`,
            actorUserId: session.user.id,
          },
        },
      },
    });

    await logAudit({ actorUserId: session.user.id, action: 'schedule_trial', entity: 'Trial', entityId: trial.id, after: trial });
    await logAudit({ actorUserId: session.user.id, action: 'stage_change', entity: 'Inquiry', entityId: inquiryId, before: { stage: inquiryBefore?.stage }, after: { stage: 'trial_booked' } });

    revalidatePath('/admin');
    revalidatePath('/admin/trials');
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${inquiryId}`);
    redirect(`/admin/trials/${trial.id}?scheduled=1`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('scheduleTrial failed', err);
    return { ok: false, error: 'Could not schedule trial.' };
  }
}

const updateStatusSchema = z.object({
  status: z.enum(statusKeys),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export async function updateTrialStatus(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = updateStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { status, notes } = parsed.data;

  try {
    const before = await db.trial.findUnique({ where: { id } });
    // Status change clears any pending follow-up — the act of moving the
    // trial forward IS the follow-up resolution. Override below for
    // statuses that need a fresh follow-up (no_show needs a callback).
    const updates = { status, notes: notes || before.notes, nextFollowUpAt: null };
    if (status === 'no_show') {
      // Reach out next day to reschedule
      const next = new Date(); next.setDate(next.getDate() + 1);
      updates.nextFollowUpAt = next;
    } else if (status === 'rescheduled') {
      updates.rescheduleCount = before.rescheduleCount + 1;
    }
    const statusLabel = (TRIAL_STATUSES.find((s) => s.key === status) || {}).label || status;
    const updated = await db.trial.update({
      where: { id },
      data: {
        ...updates,
        events: {
          create: {
            type: 'status_changed',
            label: `Status → ${statusLabel}`,
            detail: notes || null,
            actorUserId: session.user.id,
            scheduledFor: updates.nextFollowUpAt || null,
          },
        },
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'update_status', entity: 'Trial', entityId: id, before: { status: before.status }, after: { status } });
    revalidatePath('/admin');
    revalidatePath('/admin/trials');
    revalidatePath(`/admin/trials/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('updateTrialStatus failed', err);
    return { ok: false, error: 'Could not update trial.' };
  }
}

const setOutcomeSchema = z.object({
  outcome: z.enum(outcomeKeys),
  attendanceNotes: z.string().trim().max(5000).optional().or(z.literal('')),
});

export async function setTrialOutcome(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = setOutcomeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { outcome, attendanceNotes } = parsed.data;

  try {
    const before = await db.trial.findUnique({ where: { id } });
    const updates = { outcome, attendanceNotes: attendanceNotes || null };
    // Auto-set follow-up based on outcome
    if (outcome === 'considering') {
      const next = new Date(); next.setDate(next.getDate() + 3); // nudge in 3 days
      updates.nextFollowUpAt = next;
    } else if (outcome === 'lost_touch') {
      const next = new Date(); next.setDate(next.getDate() + 7);
      updates.nextFollowUpAt = next;
    } else if (outcome === 'joined' || outcome === 'didnt_join') {
      updates.nextFollowUpAt = null;
    }
    const outcomeLabel = (TRIAL_OUTCOMES.find((o) => o.key === outcome) || {}).label || outcome;
    await db.trial.update({
      where: { id },
      data: {
        ...updates,
        events: {
          create: {
            type: 'outcome_set',
            label: `Outcome → ${outcomeLabel}`,
            detail: attendanceNotes || null,
            actorUserId: session.user.id,
            scheduledFor: updates.nextFollowUpAt || null,
          },
        },
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'set_outcome', entity: 'Trial', entityId: id, before: { outcome: before.outcome }, after: { outcome, attendanceNotes } });
    revalidatePath('/admin');
    revalidatePath('/admin/trials');
    revalidatePath(`/admin/trials/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('setTrialOutcome failed', err);
    return { ok: false, error: 'Could not save outcome.' };
  }
}

const convertSchema = z.object({
  primaryDiscipline: z.string().trim().max(120).optional().or(z.literal('')),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Professional']).optional(),
});

export async function convertTrialToMember(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = convertSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const trial = await db.trial.findUnique({
      where: { id },
      include: { inquiry: true, healthDecl: true, convertedMember: true },
    });
    if (!trial) return { ok: false, error: 'Trial not found.' };
    if (trial.convertedMember) return { ok: false, error: 'Already converted.' };

    const inquiry = trial.inquiry;
    const hd = trial.healthDecl;

    // Phone-based dedupe — if a member already exists with this phone, reuse it
    let member = await db.member.findUnique({ where: { phone: inquiry.phone } });
    if (!member) {
      const dob = hd?.dob ?? null;
      const gender = hd?.gender ?? null;
      const designation = inferKidDesignation(dob, gender, inquiry.designation);
      member = await db.member.create({
        data: {
          designation,
          firstName: inquiry.firstName,
          lastName: inquiry.lastName,
          phone: inquiry.phone,
          dob,
          gender,
          primaryDiscipline: parsed.data.primaryDiscipline || trial.discipline,
          skillLevel: parsed.data.skillLevel || 'Beginner',
          emergencyName: hd?.emergencyName ?? null,
          emergencyPhone: hd?.emergencyPhone ?? null,
          emergencyRelation: hd?.emergencyRelation ?? null,
          medicalNotes: hd?.medicalConditions || hd?.injuries || null,
          smokes: hd?.smoking === 'yes' || hd?.smoking === 'occasionally',
          mediaConsent: hd?.mediaConsent ?? null,
          // criticalHealthFlag remains false until set by staff
          status: 'active',
          joinedAt: new Date(),
        },
      });
    }

    // Link Trial → Member, mark outcome=joined
    await db.trial.update({
      where: { id: trial.id },
      data: {
        convertedMemberId: member.id,
        outcome: 'joined',
        events: {
          create: {
            type: 'outcome_set',
            label: 'Converted to member',
            detail: `Member: ${member.firstName} ${member.lastName}`,
            actorUserId: session.user.id,
          },
        },
      },
    });
    // Link Inquiry → Member (if not already linked from a prior trial)
    if (!inquiry.convertedMemberId) {
      await db.inquiry.update({
        where: { id: inquiry.id },
        data: {
          convertedMemberId: member.id,
          // Inquiry no longer needs follow-up
          nextFollowUpAt: null,
          events: {
            create: {
              type: 'stage',
              label: 'Converted to member',
              detail: `Trial on ${formatDate(trial.scheduledDate)} → Member`,
              actorUserId: session.user.id,
            },
          },
        },
      });
    }

    await logAudit({ actorUserId: session.user.id, action: 'convert', entity: 'Member', entityId: member.id, after: { fromTrialId: trial.id, fromInquiryId: inquiry.id } });

    revalidatePath('/admin');
    revalidatePath('/admin/trials');
    revalidatePath('/admin/members');
    revalidatePath('/admin/inquiries');
    redirect(`/admin/plans/new?memberId=${member.id}&fromTrialId=${trial.id}`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('convertTrialToMember failed', err);
    return { ok: false, error: 'Could not convert.' };
  }
}

// helper (used here, kept inline to avoid client import of db helpers)
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Reschedule / follow-up / note actions on a trial ─────────────────

const rescheduleSchema = z.object({
  area: z.enum(['Arena', 'Sanctuary']),
  discipline: z.string().min(1),
  dayIndex: z.coerce.number().int().min(0).max(6),
  time: z.string().min(1),
  scheduledDate: z.string().optional(),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});

export async function rescheduleTrial(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = rescheduleSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { area, discipline, dayIndex, time, reason } = parsed.data;
  const day = DAY_LABELS[dayIndex];
  const newDate = parsed.data.scheduledDate
    ? new Date(parsed.data.scheduledDate)
    : nextOccurrence(dayIndex);

  try {
    const before = await db.trial.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Trial not found.' };

    const coachName = coachFor(area, discipline, time);
    let coachId = null;
    if (coachName) {
      const single = await db.coach.findFirst({ where: { name: coachName.split(',')[0].trim() } });
      if (single && !coachName.includes(',') && !coachName.includes(' or ')) coachId = single.id;
    }

    await db.trial.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        scheduledTime: time,
        day,
        area,
        discipline,
        coachId,
        // Re-booking puts the trial back in 'booked' state. rescheduleCount
        // is the durable record of how many times this happened — we don't
        // need a 'rescheduled' status because that's not a real lifecycle
        // step (the trial is once again upcoming-and-booked).
        status: 'booked',
        nextFollowUpAt: newDate,
        rescheduleCount: (before.rescheduleCount || 0) + 1,
        events: {
          create: {
            type: 'rescheduled',
            label: 'Rescheduled',
            detail: `${discipline} · ${day} ${time}${coachName ? ' · ' + coachName : ''}${reason ? ' — ' + reason : ''}`,
            actorUserId: session.user.id,
            scheduledFor: newDate,
          },
        },
      },
    });
    await logAudit({ actorUserId: session.user.id, action: 'reschedule', entity: 'Trial', entityId: id, before: { date: before.scheduledDate, time: before.scheduledTime }, after: { date: newDate, time } });
    revalidatePath('/admin');
    revalidatePath('/admin/trials');
    revalidatePath(`/admin/trials/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('rescheduleTrial failed', err);
    return { ok: false, error: 'Could not reschedule.' };
  }
}

const followUpSchema = z.object({
  type: z.enum(['called', 'whatsapp', 'in_person', 'note']),
  detail: z.string().trim().max(2000).optional().or(z.literal('')),
  nextFollowUpAt: z.string().optional().or(z.literal('')),
});

export async function logTrialFollowUp(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = followUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { type, detail, nextFollowUpAt } = parsed.data;
  const labels = { called: 'Called', whatsapp: 'WhatsApp', in_person: 'Met in person', note: 'Note' };
  const next = nextFollowUpAt ? new Date(nextFollowUpAt) : null;

  try {
    await db.trial.update({
      where: { id },
      data: {
        lastContactedAt: new Date(),
        followUpAttempts: { increment: type === 'note' ? 0 : 1 },
        nextFollowUpAt: next ?? undefined,
        events: {
          create: {
            type: 'follow_up',
            label: labels[type] || type,
            detail: detail || null,
            actorUserId: session.user.id,
            scheduledFor: next,
          },
        },
      },
    });
    revalidatePath(`/admin/trials/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('logTrialFollowUp failed', err);
    return { ok: false, error: 'Could not log.' };
  }
}
