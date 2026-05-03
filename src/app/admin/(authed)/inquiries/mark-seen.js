'use server';
import { cookies } from 'next/headers';

// Stamp the last-seen-inquiries cookie so the dashboard's "new from website"
// badge clears once Vinod has actually opened the inquiries list. Cookie
// lives 90 days — anything earlier than that is stale anyway.
export async function markInquiriesSeen() {
  const jar = await cookies();
  jar.set('last-seen-inq', String(Date.now()), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
}
