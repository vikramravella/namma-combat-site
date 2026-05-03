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

  const onFreeze = m.plans.find((p) => p.status === 'on_freeze');
  const running = m.plans.find((p) => p.status === 'running');
  let next;
  if (onFreeze) next = 'on_freeze';
  else if (running) next = 'active';
  else next = 'lapsed';

  if (next !== m.status) {
    await dbh.member.update({ where: { id: memberId }, data: { status: next } });
  }
}
