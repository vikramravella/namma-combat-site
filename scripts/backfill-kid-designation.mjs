// Backfill: for any Member with DOB + gender showing they're under 18,
// set designation to Master (M) or Miss (F). Adults and unknown-gender
// kids are left alone.

import { PrismaClient } from '../src/generated/prisma/index.js';
import { inferKidDesignation, ageInYears } from '../src/lib/designation.js';

const db = new PrismaClient();
const members = await db.member.findMany({ select: { id: true, firstName: true, lastName: true, dob: true, gender: true, designation: true } });

let kids = 0, updated = 0, skipped = 0, adults = 0;
for (const m of members) {
  const age = ageInYears(m.dob);
  if (age == null) { skipped++; continue; }
  if (age >= 18) { adults++; continue; }
  kids++;
  const next = inferKidDesignation(m.dob, m.gender, m.designation);
  if (next !== m.designation) {
    await db.member.update({ where: { id: m.id }, data: { designation: next } });
    console.log(`  ${m.firstName} ${m.lastName} (age ${age}, gender=${m.gender || '—'}): ${m.designation || '—'} → ${next || '—'}`);
    updated++;
  }
}
console.log(`\nDone: total=${members.length} adults=${adults} no-dob=${skipped} kids=${kids} updated=${updated}`);
await db.$disconnect();
