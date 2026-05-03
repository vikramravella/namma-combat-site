'use client';
import { useEffect } from 'react';
import { markInquiriesSeen } from './mark-seen';

// Fires once when the inquiries list mounts so the dashboard badge clears.
// Server action sets a cookie; no UI of its own.
export function MarkSeenOnMount() {
  useEffect(() => {
    markInquiriesSeen().catch(() => {});
  }, []);
  return null;
}
