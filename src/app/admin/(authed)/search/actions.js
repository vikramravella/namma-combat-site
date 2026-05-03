'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Quick-lookup search across all three modules. A person only lives in one
// module at a time per the lifecycle rule, so we resolve to the latest one
// (Member > Trial > Inquiry) and return the right link.
export async function searchPeople(q) {
  const session = await getServerSession(authOptions);
  if (!session) return [];
  const term = (q || '').trim();
  if (term.length < 2) return [];

  // Substring match on name pieces and on the digits-only phone (so people
  // can type "98876" and hit "+91 98876 12345").
  const nameWhere = {
    OR: [
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
      { phone: { contains: term } },
    ],
  };

  const [members, trials, inquiries] = await Promise.all([
    db.member.findMany({
      where: nameWhere,
      select: { id: true, firstName: true, lastName: true, phone: true, status: true },
      take: 6,
    }),
    db.trial.findMany({
      where: {
        convertedMemberId: null,
        inquiry: nameWhere,
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
      },
      take: 6,
    }),
    db.inquiry.findMany({
      where: {
        ...nameWhere,
        convertedMemberId: null,
        trials: { none: {} },
      },
      select: { id: true, firstName: true, lastName: true, phone: true, stage: true },
      take: 6,
    }),
  ]);

  // Build a per-phone canonical entry (Member wins, then Trial, then Inquiry)
  const byPhone = new Map();
  for (const m of members) {
    byPhone.set(m.phone, {
      kind: 'member',
      id: m.id,
      name: `${m.firstName} ${m.lastName}`.trim(),
      phone: m.phone,
      sub: `Member · ${m.status}`,
      href: `/admin/members/${m.id}`,
    });
  }
  for (const t of trials) {
    const phone = t.inquiry.phone;
    if (byPhone.has(phone)) continue;
    byPhone.set(phone, {
      kind: 'trial',
      id: t.id,
      name: `${t.inquiry.firstName} ${t.inquiry.lastName}`.trim(),
      phone,
      sub: `Trial · ${t.status}`,
      href: `/admin/trials/${t.id}`,
    });
  }
  for (const i of inquiries) {
    if (byPhone.has(i.phone)) continue;
    byPhone.set(i.phone, {
      kind: 'inquiry',
      id: i.id,
      name: `${i.firstName} ${i.lastName}`.trim(),
      phone: i.phone,
      sub: `Inquiry · ${i.stage}`,
      href: `/admin/inquiries/${i.id}`,
    });
  }
  return Array.from(byPhone.values()).slice(0, 8);
}
