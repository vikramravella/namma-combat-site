'use server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function markAlertsSeen() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { lastSeenAlertsAt: new Date() },
  });
}
