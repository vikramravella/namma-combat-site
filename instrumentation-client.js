import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,        // off by default — turn up if we want session replay
  replaysOnErrorSampleRate: 1.0,      // record any session that errors
  enabled: process.env.NODE_ENV === 'production',
  integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: true })],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
