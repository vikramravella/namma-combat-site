'use server';
import { cookies } from 'next/headers';

export async function markAlertsSeen() {
  const jar = await cookies();
  jar.set('last-seen-alerts', String(Date.now()), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
}
