'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const schema = z.object({
  name: z.string().trim().min(2, 'Name required').max(80),
  tier: z.string().trim().min(1, 'Tier required').max(40),
  cycle: z.string().trim().min(1, 'Cycle required').max(40),
  durationDays: z.coerce.number().int().min(1).max(3650),
  freezeDaysAllowed: z.coerce.number().int().min(0).max(365),
  basePriceRupees: z.coerce.number().int().min(0).max(10_000_000),
  floorAccess: z.string().trim().max(120).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  active: z.string().optional(),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function clean(p) {
  return {
    name: p.name,
    tier: p.tier,
    cycle: p.cycle,
    durationDays: p.durationDays,
    freezeDaysAllowed: p.freezeDaysAllowed,
    basePriceRupees: p.basePriceRupees,
    floorAccess: p.floorAccess || null,
    notes: p.notes || null,
    sortOrder: p.sortOrder,
    active: p.active === 'on' || p.active === 'true',
  };
}

export async function createMembershipType(formData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  try {
    const created = await db.membershipType.create({ data });
    await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'MembershipType', entityId: created.id, after: created });
    revalidatePath('/admin/settings/memberships');
    redirect(`/admin/settings/memberships?created=${encodeURIComponent(created.name)}`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    if (err?.code === 'P2002') return { ok: false, error: 'A membership type with this name already exists.' };
    console.error('createMembershipType', err);
    return { ok: false, error: 'Could not create.' };
  }
}

export async function updateMembershipType(id, formData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  try {
    const before = await db.membershipType.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Not found' };
    const updated = await db.membershipType.update({ where: { id }, data });
    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'MembershipType', entityId: id, before, after: updated });
    revalidatePath('/admin/settings/memberships');
    revalidatePath(`/admin/settings/memberships/${id}`);
    return { ok: true };
  } catch (err) {
    if (err?.code === 'P2002') return { ok: false, error: 'Another type already has this name.' };
    console.error('updateMembershipType', err);
    return { ok: false, error: 'Could not save.' };
  }
}

export async function toggleMembershipTypeActive(id) {
  const session = await requireSession();
  const before = await db.membershipType.findUnique({ where: { id } });
  if (!before) return { ok: false, error: 'Not found' };
  const updated = await db.membershipType.update({ where: { id }, data: { active: !before.active } });
  await logAudit({ actorUserId: session.user.id, action: 'toggle_active', entity: 'MembershipType', entityId: id, before: { active: before.active }, after: { active: updated.active } });
  revalidatePath('/admin/settings/memberships');
  return { ok: true, active: updated.active };
}
