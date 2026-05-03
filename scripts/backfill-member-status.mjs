// One-time backfill: recompute every Member.status from current Plan.status.
// Fixes the drift where plan freezes weren't propagating to member.status.
//
// Run:
//   DATABASE_URL=$(grep '^DATABASE_URL=' .env.production | sed 's/^DATABASE_URL=//; s/^"//; s/"$//') \
//     node scripts/backfill-member-status.mjs

import { PrismaClient } from '../src/generated/prisma/index.js';

const db = new PrismaClient();
const members = await db.member.findMany({ include: { plans: true } });

let changed = 0, kept = 0, skippedLeft = 0;
for (const m of members) {
  if (m.status === 'left') { skippedLeft++; continue; }
  const onFreeze = m.plans.find((p) => p.status === 'on_freeze');
  const running = m.plans.find((p) => p.status === 'running');
  let next;
  if (onFreeze) next = 'on_freeze';
  else if (running) next = 'active';
  else next = 'lapsed';
  if (next !== m.status) {
    await db.member.update({ where: { id: m.id }, data: { status: next } });
    console.log(`  ${m.firstName} ${m.lastName}: ${m.status} → ${next}`);
    changed++;
  } else {
    kept++;
  }
}
console.log(`\nBackfill complete: ${changed} updated, ${kept} unchanged, ${skippedLeft} preserved (left).`);
await db.$disconnect();
