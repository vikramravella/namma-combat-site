// Subdomain router:
//   database.nammacombat.com  →  serves only /admin and /form (everything else 404)
//   nammacombat.com           →  serves marketing site, hides /admin and /form
//
// This lets one Vercel deployment serve both surfaces from one codebase.

import { NextResponse } from 'next/server';

const ADMIN_HOSTS = ['academy.nammacombat.com', 'database.nammacombat.com', 'academy.localhost', 'database.localhost', 'academy.localhost:3000', 'database.localhost:3000'];

export function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  const url = request.nextUrl;
  const path = url.pathname;

  const isAdminHost = ADMIN_HOSTS.includes(host);

  // On the admin host: silently rewrite root → /admin so the user lands on login
  if (isAdminHost) {
    if (path === '/' || path === '') {
      const rewritten = url.clone();
      rewritten.pathname = '/admin';
      return NextResponse.rewrite(rewritten);
    }
    // Block marketing pages on the admin host (any non /admin, /form, /api, /_next path → 404)
    const allowed = path.startsWith('/admin') || path.startsWith('/form') || path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/favicon') || /\.(svg|png|jpg|jpeg|webp|woff2?|otf|ico|css|js)$/.test(path);
    if (!allowed) {
      return new NextResponse(null, { status: 404 });
    }
  } else {
    // On the marketing host: hide /admin entirely (404 — security through obscurity, not access control)
    if (path.startsWith('/admin') || path.startsWith('/form')) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every path EXCEPT Next.js internals (already exempted in code above too)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
