'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { markAlertsSeen } from './mark-seen';

export function MarkAlertsSeenOnMount() {
  useEffect(() => {
    markAlertsSeen().catch((err) => {
      Sentry.captureException(err, { tags: { source: 'mark-alerts-seen' } });
    });
  }, []);
  return null;
}
