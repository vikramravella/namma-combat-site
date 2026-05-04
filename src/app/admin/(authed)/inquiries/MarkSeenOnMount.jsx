'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { markInquiriesSeen } from './mark-seen';

// Fires once when the inquiries list mounts so the dashboard badge clears.
// Reports failures to Sentry instead of swallowing — silent failure here
// would mean the badge stays stuck and we'd never know.
export function MarkSeenOnMount() {
  useEffect(() => {
    markInquiriesSeen().catch((err) => {
      Sentry.captureException(err, { tags: { source: 'mark-inquiries-seen' } });
    });
  }, []);
  return null;
}
