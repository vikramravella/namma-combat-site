import { PrismaClient } from '../src/generated/prisma/index.js';

async function counts(url, label) {
  const db = new PrismaClient({ datasourceUrl: url });
  const out = {
    label,
    inquiry: await db.inquiry.count(),
    inquiryEvent: await db.inquiryEvent.count(),
    trial: await db.trial.count(),
    trialEvent: await db.trialEvent.count(),
    member: await db.member.count(),
    plan: await db.plan.count(),
    receipt: await db.receipt.count(),
    payment: await db.payment.count(),
    healthDecl: await db.healthDeclaration.count(),
    formToken: await db.healthFormToken.count(),
    coach: await db.coach.count(),
    user: await db.user.count(),
    audit: await db.auditLog.count(),
    membershipType: await db.membershipType.count(),
    assessmentSlot: await db.assessmentSlot.count(),
    assessmentBooking: await db.assessmentBooking.count(),
    assessment: await db.assessment.count(),
  };
  await db.$disconnect();
  return out;
}

const prismaUrl = process.env.PRISMA_URL;
const supaUrl = process.env.SUPA_URL;

const a = await counts(prismaUrl, 'Prisma');
const b = await counts(supaUrl, 'Supabase');
console.log('Table                  | Prisma | Supabase | match?');
console.log('-----------------------|--------|----------|-------');
for (const k of Object.keys(a)) {
  if (k === 'label') continue;
  const match = a[k] === b[k] ? '✓' : '✗';
  console.log(`${k.padEnd(22)} | ${String(a[k]).padStart(6)} | ${String(b[k]).padStart(8)} | ${match}`);
}
