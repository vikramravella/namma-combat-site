'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const schema = z.object({
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  timeOfDay: z.string().regex(/^[0-2]\d:[0-5]\d$/, 'Time must be HH:mm (24h)'),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(30),
  capacity: z.coerce.number().int().min(1).max(100).default(10),
  notes: z.string().trim().max(200).optional().or(z.literal('')),
  active: z.string().optional(),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function clean(p) {
  return {
    dayOfWeek: p.dayOfWeek,
    timeOfDay: p.timeOfDay,
    durationMinutes: p.durationMinutes,
    capacity: p.capacity,
    notes: p.notes || null,
    active: p.active === 'on' || p.active === 'true',
  };
}

export async function createAssessmentSlot(formData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const created = await db.assessmentSlot.create({ data: clean(parsed.data) });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'AssessmentSlot', entityId: created.id, after: created });
    revalidatePath('/admin/settings/assessment-slots');
    redirect('/admin/settings/assessment-slots');
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('createAssessmentSlot', err);
    return { ok: false, error: 'Could not create.' };
  }
}

export async function updateAssessmentSlot(id, formData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const before = await db.assessmentSlot.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Not found' };
    const updated = await db.assessmentSlot.update({ where: { id }, data: clean(parsed.data) });
    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'AssessmentSlot', entityId: id, before, after: updated });
    revalidatePath('/admin/settings/assessment-slots');
    revalidatePath(`/admin/settings/assessment-slots/${id}`);
    return { ok: true };
  } catch (err) {
    console.error('updateAssessmentSlot', err);
    return { ok: false, error: 'Could not save.' };
  }
}

export async function deleteAssessmentSlot(id) {
  const session = await requireSession();
  try {
    const before = await db.assessmentSlot.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Not found' };
    await db.assessmentSlot.delete({ where: { id } });
    await logAudit({ actorUserId: session.user.id, action: 'delete', entity: 'AssessmentSlot', entityId: id, before });
    revalidatePath('/admin/settings/assessment-slots');
    redirect('/admin/settings/assessment-slots');
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('deleteAssessmentSlot', err);
    return { ok: false, error: 'Could not delete.' };
  }
}
