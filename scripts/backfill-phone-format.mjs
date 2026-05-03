// One-time backfill: re-normalize all phone numbers on Inquiry + Member rows
// to the canonical '+91 XXXXX XXXXX' (or other country code) format.
//
// Run:
//   DATABASE_URL=$(grep '^DATABASE_URL=' .env.production | sed 's/^DATABASE_URL=//; s/^"//; s/"$//') \
//     node scripts/backfill-phone-format.mjs

import { PrismaClient } from '../src/generated/prisma/index.js';
import { normalizePhone } from '../src/lib/phone.js';

const db = new PrismaClient();

async function backfill(model) {
  const rows = await db[model].findMany({ select: { id: true, phone: true } });
  let updated = 0, unchanged = 0, conflicts = 0, invalid = 0;
  for (const r of rows) {
    const next = normalizePhone(r.phone);
    if (!next) { invalid++; console.warn(`[${model}] invalid phone, skipped: id=${r.id} value=${JSON.stringify(r.phone)}`); continue; }
    if (next === r.phone) { unchanged++; continue; }
    try {
      await db[model].update({ where: { id: r.id }, data: { phone: next } });
      updated++;
    } catch (err) {
      if (err?.code === 'P2002') {
        conflicts++;
        console.warn(`[${model}] phone collision after normalize: id=${r.id} ${r.phone} -> ${next}`);
      } else { throw err; }
    }
  }
  console.log(`[${model}] updated=${updated} unchanged=${unchanged} conflicts=${conflicts} invalid=${invalid} total=${rows.length}`);
}

await backfill('inquiry');
await backfill('member');
await db.$disconnect();
