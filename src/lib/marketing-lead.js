'use client';
import { submitInquiry } from '@/app/inquire/actions';
import { mapLegacyInterest } from './legacy-interest-map';

// Shared lead-submit helper for the marketing landing pages.
// All public landing pages (trial, kickboxing, mma, …) call this with their
// inline form's { name, phone, interest } and create an Inquiry record in
// the NCA database — no more Zoho. Phone-dedupe is handled server-side.
export async function submitMarketingLead({ name, phone, interest }) {
  if (!name || !phone) return { ok: false };
  const parts = String(name).trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '-';
  const fd = new FormData();
  fd.set('firstName', firstName);
  fd.set('lastName', lastName);
  fd.set('phone', phone);
  for (const i of mapLegacyInterest(interest)) fd.append('interestedIn', i);
  try {
    return await submitInquiry(fd);
  } catch (e) {
    console.error('submitMarketingLead failed', e);
    return { ok: false, error: 'submit failed' };
  }
}
