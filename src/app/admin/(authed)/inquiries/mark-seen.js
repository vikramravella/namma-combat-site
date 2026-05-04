'use server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Stamp the signed-in user's lastSeenInquiriesAt so the dashboard
// "new from website" badge clears once they actually open the inquiry
// list. Persists across devices/sessions; survives cookie clears.
export async function markInquiriesSeen() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { lastSeenInquiriesAt: new Date() },
  });
}
