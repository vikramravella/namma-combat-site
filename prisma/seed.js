// Seed Vinod's admin user + coaches.
// Run with: node --env-file=.env prisma/seed.js
// Re-runnable: upserts everywhere, won't duplicate.

import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vi@nammacombat.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Vinod';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

const COACHES = [
  { name: 'Bhagyarajan', primaryArea: 'Combat', disciplines: 'Boxing' },
  { name: 'Rajan',       primaryArea: 'Combat', disciplines: 'Boxing' },
  { name: 'Kantharaj',   primaryArea: 'Combat', disciplines: 'Kickboxing, Jiu-Jitsu, Judo, MMA' },
  { name: 'Venkatesh',   primaryArea: 'Combat', disciplines: 'Wrestling' },
  { name: 'Spoorthi',    primaryArea: 'Sanctuary', disciplines: 'S&C, Animal Flow' },
  { name: 'Manoj',       primaryArea: 'Sanctuary', disciplines: 'S&C, Animal Flow' },
  { name: 'Naeem',       primaryArea: 'Sanctuary', disciplines: 'Elite S&C' },
];

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, passwordHash, role: 'admin' },
    create: { email: ADMIN_EMAIL, name: ADMIN_NAME, passwordHash, role: 'admin' },
  });
  console.log(`✔ Admin: ${user.email}`);

  // Coaches — upsert by name (no natural-key constraint, manual idempotency)
  for (const c of COACHES) {
    const existing = await prisma.coach.findFirst({ where: { name: c.name } });
    if (existing) {
      await prisma.coach.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.coach.create({ data: c });
    }
  }
  console.log(`✔ Coaches: ${COACHES.length} seeded`);

  console.log(`\nLogin: http://localhost:3000/admin/login`);
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
