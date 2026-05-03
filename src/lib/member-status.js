// Recompute Member.status from the current Plan.status. Plans are the source
// of truth for active vs frozen; member.status is a denormalized cache so the
// members list can chip/filter without joining.
//
// Rules:
//   any plan on_freeze  → member on_freeze
//   else any plan running → member active
//   else                → member lapsed
//   exception: if member.status === 'left' (manually exited), don't override.
//
// Pass a Prisma transaction handle to keep writes inside the caller's tx; if
// omitted, falls back to the global db client.

import { db as defaultDb } from './db';

export async function syncMemberStatusFromPlans(tx, memberId) {
  const dbh = tx ?? defaultDb;
  const m = await dbh.member.findUnique({
    where: { id: memberId },
    include: { plans: true },
  });
  if (!m) return;
  if (m.status === 'left') return;

  // If we have no plan records at all, we don't know enough to say "lapsed" —
  // many imported members have plans that lived only outside our NCA dataset
  // (e.g. paid via Books, never tracked in Deals). Preserve whatever status
  // they already have.
  if (m.plans.length === 0) return;

  const onFreeze = m.plans.find((p) => p.status === 'on_freeze');
  const activePlan = m.plans.find((p) => p.status === 'active');
  let next;
  if (onFreeze) next = 'on_freeze';
  else if (activePlan) next = 'active';
  else next = 'lapsed';

  if (next !== m.status) {
    await dbh.member.update({ where: { id: memberId }, data: { status: next } });
  }
}
