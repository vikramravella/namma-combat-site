'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const schema = z.object({
  memberId: z.string().min(1),
  slotId: z.string().min(1, 'Slot required'),
  scheduledDate: z.string().min(1, 'Date required'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

export async function createBooking(formData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { memberId, slotId, scheduledDate, notes } = parsed.data;

  // Validate slot day matches the picked date's day of week
  const slot = await db.assessmentSlot.findUnique({ where: { id: slotId } });
  if (!slot || !slot.active) return { ok: false, error: 'Slot not available.' };
  const date = new Date(scheduledDate);
  const isoDow = date.getDay() === 0 ? 7 : date.getDay(); // JS Sun=0 → ISO 7
  if (isoDow !== slot.dayOfWeek) {
    return { ok: false, error: `Slot is on ${dayName(slot.dayOfWeek)}; pick a matching date.` };
  }

  // Capacity check
  const taken = await db.assessmentBooking.count({ where: { slotId, scheduledDate: date, status: { in: ['booked', 'completed'] } } });
  if (taken >= slot.capacity) return { ok: false, error: 'That slot is full for this date.' };

  // Avoid double-booking same member same date
  const dup = await db.assessmentBooking.findFirst({ where: { memberId, scheduledDate: date, status: { in: ['booked', 'completed'] } } });
  if (dup) return { ok: false, error: 'Member already has a booking that day.' };

  try {
    const created = await db.assessmentBooking.create({
      data: { memberId, slotId, scheduledDate: date, notes: notes || null, status: 'booked' },
    });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'AssessmentBooking', entityId: created.id, after: created });
    revalidatePath('/admin/assessments');
    revalidatePath(`/admin/members/${memberId}`);
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('createBooking', err);
    return { ok: false, error: 'Could not create booking.' };
  }
}

export async function cancelBooking(id) {
  const session = await requireSession();
  const before = await db.assessmentBooking.findUnique({ where: { id } });
  if (!before) return { ok: false, error: 'Not found' };
  await db.assessmentBooking.update({ where: { id }, data: { status: 'cancelled' } });
  await logAudit({ actorUserId: session.user.id, action: 'cancel', entity: 'AssessmentBooking', entityId: id, before });
  revalidatePath('/admin/assessments');
  revalidatePath(`/admin/members/${before.memberId}`);
  return { ok: true };
}

export async function markNoShow(id) {
  const session = await requireSession();
  const before = await db.assessmentBooking.findUnique({ where: { id } });
  if (!before) return { ok: false, error: 'Not found' };
  await db.assessmentBooking.update({ where: { id }, data: { status: 'no_show' } });
  await logAudit({ actorUserId: session.user.id, action: 'no_show', entity: 'AssessmentBooking', entityId: id, before });
  revalidatePath('/admin/assessments');
  return { ok: true };
}

function dayName(n) {
  return ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][n] || `Day ${n}`;
}
