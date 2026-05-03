import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captures errors from Next.js server components / route handlers and sends to
// Sentry with full request context (URL, params, headers).
export const onRequestError = Sentry.captureRequestError;
