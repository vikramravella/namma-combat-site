import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // sample 10% of traces; bump if we want more
  enabled: process.env.NODE_ENV === 'production',
  // Don't report Next.js redirect "errors" — they're control flow, not bugs.
  beforeSend(event, hint) {
    const err = hint?.originalException;
    if (err?.digest && typeof err.digest === 'string' && err.digest.startsWith('NEXT_')) {
      return null;
    }
    return event;
  },
});
