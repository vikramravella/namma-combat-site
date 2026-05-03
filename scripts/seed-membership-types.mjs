// Seed the MembershipType table from the legacy TIERS × CYCLES × PRICE_TABLE
// constants. Idempotent (upsert by unique name).

import { PrismaClient } from '@prisma/client';

const PRICE_TABLE = {
  Silver:   { Monthly: 5500,  Quarterly: 15000, 'Semi-Annual': 28000, Annual: 45000  },
  Student:  { Monthly: 5500,  Quarterly: 15000, 'Semi-Annual': 28000, Annual: 45000  },
  Gold:     { Monthly: 7500,  Quarterly: 20500, 'Semi-Annual': 38000, Annual: 60000  },
  Platinum: { Monthly: 12000, Quarterly: 33000, 'Semi-Annual': 60000, Annual: 100000 },
};

const TIERS = [
  { key: 'Silver',   floor: '1 floor (Arena OR Sanctuary)' },
  { key: 'Student',  floor: 'Both floors (valid student ID required)' },
  { key: 'Gold',     floor: 'Both floors (Arena + Sanctuary)' },
  { key: 'Platinum', floor: 'Both floors + Personal Training included' },
];

const CYCLES = [
  { key: 'Monthly',     days: 30,  freezeDays: 7,  sortBucket: 1 },
  { key: 'Quarterly',   days: 90,  freezeDays: 18, sortBucket: 2 },
  { key: 'Semi-Annual', days: 180, freezeDays: 30, sortBucket: 3 },
  { key: 'Annual',      days: 365, freezeDays: 54, sortBucket: 4 },
];

const TIER_ORDER = { Silver: 1, Student: 2, Gold: 3, Platinum: 4 };

const db = new PrismaClient();
let upserted = 0;
for (const t of TIERS) {
  for (const c of CYCLES) {
    const name = `${t.key} ${c.key}`;
    const sort = TIER_ORDER[t.key] * 10 + c.sortBucket;
    await db.membershipType.upsert({
      where: { name },
      update: {
        tier: t.key,
        cycle: c.key,
        durationDays: c.days,
        freezeDaysAllowed: c.freezeDays,
        basePriceRupees: PRICE_TABLE[t.key][c.key],
        floorAccess: t.floor,
        sortOrder: sort,
        active: true,
      },
      create: {
        name,
        tier: t.key,
        cycle: c.key,
        durationDays: c.days,
        freezeDaysAllowed: c.freezeDays,
        basePriceRupees: PRICE_TABLE[t.key][c.key],
        floorAccess: t.floor,
        sortOrder: sort,
        active: true,
      },
    });
    upserted++;
  }
}
console.log(`Seeded/updated ${upserted} membership types.`);
await db.$disconnect();
