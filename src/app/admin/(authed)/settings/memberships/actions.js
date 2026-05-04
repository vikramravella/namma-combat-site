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

// Idempotent seed for the Day Pass catalog entries. Pricing source:
// nammacombat.com FAQ ("Single class passes: ₹788 regular / ₹1,050 elite
// 90-minute"). Pre-GST base = incl-GST / 1.05, rounded to a clean number.
// Safe to call repeatedly: existing rows get upserted in place.
const DAY_PASS_SEEDS = [
  {
    name: 'Day Pass — Regular',
    tier: 'Day Pass',
    cycle: 'Single Day',
    durationDays: 1,
    freezeDaysAllowed: 0,
    basePriceRupees: 750,
    floorAccess: 'Both floors',
    notes: 'Single class drop-in. ₹788 incl GST. For travelers or members from other academies trying us out.',
    sortOrder: 900,
    active: true,
  },
  {
    name: 'Day Pass — Elite 90-min',
    tier: 'Day Pass',
    cycle: 'Elite 90min',
    durationDays: 1,
    freezeDaysAllowed: 0,
    basePriceRupees: 1000,
    floorAccess: 'Both floors',
    notes: 'Single 90-minute elite class drop-in. ₹1,050 incl GST.',
    sortOrder: 901,
    active: true,
  },
];

export async function seedDayPassTypes() {
  const session = await requireSession();
  const created = [];
  const updated = [];
  for (const seed of DAY_PASS_SEEDS) {
    const existing = await db.membershipType.findUnique({ where: { name: seed.name } });
    if (existing) {
      await db.membershipType.update({ where: { name: seed.name }, data: seed });
      updated.push(seed.name);
    } else {
      await db.membershipType.create({ data: seed });
      created.push(seed.name);
    }
  }
  await logAudit({
    actorUserId: session.user.id,
    action: 'seed_day_pass',
    entity: 'MembershipType',
    entityId: 'day-pass-batch',
    after: { created, updated },
  });
  revalidatePath('/admin/settings/memberships');
  return { ok: true, created: created.length, updated: updated.length };
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
