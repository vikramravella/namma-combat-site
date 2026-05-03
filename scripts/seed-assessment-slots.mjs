// Seed default assessment slots: Wednesday 18:00 and Saturday 07:00.
// Idempotent — only inserts if no rows exist.
import { PrismaClient } from '../src/generated/prisma/index.js';
const db = new PrismaClient();
const count = await db.assessmentSlot.count();
if (count > 0) {
  console.log(`Already ${count} slots; skipping seed.`);
} else {
  await db.assessmentSlot.createMany({
    data: [
      { dayOfWeek: 3, timeOfDay: '18:00', durationMinutes: 30, capacity: 10, active: true, notes: 'Evening (Naeem)' },
      { dayOfWeek: 6, timeOfDay: '07:00', durationMinutes: 30, capacity: 10, active: true, notes: 'Morning (Naeem)' },
    ],
  });
  console.log('Seeded 2 default assessment slots.');
}
await db.$disconnect();
