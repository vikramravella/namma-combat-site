'use client';
import { useEffect } from 'react';
import { markAlertsSeen } from './mark-seen';

export function MarkAlertsSeenOnMount() {
  useEffect(() => {
    markAlertsSeen().catch(() => {});
  }, []);
  return null;
}
