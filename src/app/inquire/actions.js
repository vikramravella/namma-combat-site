'use server';

import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/lib/db';
import { DESIGNATIONS, OFFERINGS, PRIMARY_GOALS, EXPERIENCE_LEVELS } from '@/lib/constants';
import { normalizePhone } from '@/lib/phone';

const offeringSet = new Set(OFFERINGS);

const schema = z.object({
  designation: z.string().trim().max(20).optional().or(z.literal('')),
  firstName: z.string().trim().min(1, 'First name required').max(80),
  lastName: z.string().trim().min(1, 'Last name required').max(80),
  phone: z.string().trim().min(1, 'Phone required').max(40),
  primaryGoal: z.string().trim().max(120).optional().or(z.literal('')),
  experience: z.string().trim().max(60).optional().or(z.literal('')),
});

export async function submitInquiry(formData) {
  const raw = Object.fromEntries(formData);
  console.log('[submitInquiry] received', { firstName: raw.firstName, lastName: raw.lastName, phoneLen: (raw.phone || '').length });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    Sentry.captureMessage(`submitInquiry validation failed: ${parsed.error.issues[0].message}`, {
      level: 'warning',
      tags: { source: 'submitInquiry', stage: 'validation' },
      extra: { raw, issue: parsed.error.issues[0] },
    });
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const data = parsed.data;
  const phone = normalizePhone(data.phone);
  if (!phone) {
    Sentry.captureMessage(`submitInquiry phone invalid: "${data.phone}"`, {
      level: 'warning',
      tags: { source: 'submitInquiry', stage: 'phone' },
      extra: { raw },
    });
    return { ok: false, error: 'Phone number looks invalid.' };
  }
  const interestedIn = formData.getAll('interestedIn').filter((v) => offeringSet.has(v));

  try {
    const existing = await db.inquiry.findUnique({ where: { phone } });
    if (existing) {
      await db.inquiry.update({
        where: { id: existing.id },
        data: {
          events: {
            create: {
              type: 'note',
              label: 'Re-inquired via website',
              detail: `Goal: ${data.primaryGoal || '—'} · Interested: ${interestedIn.join(', ') || '—'}`,
            },
          },
        },
      });
      console.log('[submitInquiry] dedup hit', { id: existing.id, phone });
      return { ok: true, dedup: true };
    }
    const created = await db.inquiry.create({
      data: {
        designation: data.designation || null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone,
        interestedIn,
        primaryGoal: data.primaryGoal || null,
        experience: data.experience || null,
        source: 'website',
        stage: 'new',
        events: {
          create: { type: 'created', label: 'Inquiry submitted via website form' },
        },
      },
    });
    console.log('[submitInquiry] created', { id: created.id, phone });
    return { ok: true };
  } catch (err) {
    console.error('submitInquiry failed', err);
    Sentry.captureException(err, { tags: { source: 'submitInquiry', stage: 'db' }, extra: { raw } });
    try { await Sentry.flush(2000); } catch {}
    const msg = (err?.message || String(err)).split('\n').filter(Boolean).slice(0, 4).join(' | ').slice(0, 500);
    return { ok: false, error: `[${err?.code || 'unknown'}] ${msg}` };
  }
}
