'use client';
import * as Sentry from '@sentry/nextjs';
import { submitInquiry } from '@/app/inquire/actions';
import { mapLegacyInterest } from './legacy-interest-map';

// Shared lead-submit helper for the marketing landing pages.
// All public landing pages (trial, kickboxing, mma, …) call this with their
// inline form's { name, phone, interest } and create an Inquiry record in
// the NCA database. Phone-dedupe is handled server-side.
export async function submitMarketingLead({ name, phone, interest }) {
  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!phone) return { ok: false, error: 'Please enter your phone number.' };
  const parts = String(name).trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '-';
  const fd = new FormData();
  fd.set('firstName', firstName);
  fd.set('lastName', lastName);
  fd.set('phone', phone);
  for (const i of mapLegacyInterest(interest)) fd.append('interestedIn', i);
  try {
    const result = await submitInquiry(fd);
    if (result?.ok === false) {
      Sentry.captureMessage(`Marketing lead rejected: ${result.error}`, {
        level: 'warning',
        tags: { source: 'marketing-lead' },
        extra: { name, phone, interest, error: result.error },
      });
    }
    return result;
  } catch (e) {
    console.error('submitMarketingLead failed', e);
    Sentry.captureException(e, { tags: { source: 'marketing-lead' }, extra: { name, phone, interest } });
    return { ok: false, error: 'Network error — please try again or WhatsApp us.' };
  }
}
