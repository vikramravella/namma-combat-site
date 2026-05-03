'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Recent activity across inquiries + trials, merged and time-sorted.
// Used by the header HeaderHistory icon → modal.
export async function fetchHistory() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const [inq, tr] = await Promise.all([
    db.inquiryEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { inquiry: { select: { id: true, firstName: true, lastName: true } } },
    }),
    db.trialEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { trial: { select: { id: true, inquiry: { select: { firstName: true, lastName: true } } } } },
    }),
  ]);

  const all = [
    ...inq.map((e) => ({
      id: 'i' + e.id,
      when: e.createdAt.toISOString(),
      label: e.label,
      detail: e.detail,
      who: `${e.inquiry.firstName} ${e.inquiry.lastName}`,
      href: `/admin/inquiries/${e.inquiryId}`,
      kind: 'inquiry',
    })),
    ...tr.map((e) => ({
      id: 't' + e.id,
      when: e.createdAt.toISOString(),
      label: e.label,
      detail: e.detail,
      who: `${e.trial.inquiry.firstName} ${e.trial.inquiry.lastName}`,
      href: `/admin/trials/${e.trialId}`,
      kind: 'trial',
    })),
  ];

  all.sort((a, b) => new Date(b.when) - new Date(a.when));
  return all.slice(0, 25);
}
