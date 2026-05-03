'use server';

import { z } from 'zod';
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
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;
  const phone = normalizePhone(data.phone);
  if (!phone) return { ok: false, error: 'Phone number looks invalid.' };
  const interestedIn = formData.getAll('interestedIn').filter((v) => offeringSet.has(v));

  try {
    const existing = await db.inquiry.findUnique({ where: { phone } });
    if (existing) {
      // Don't create a duplicate — but log as a re-inquiry event
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
      return { ok: true, dedup: true };
    }
    await db.inquiry.create({
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
    return { ok: true };
  } catch (err) {
    console.error('submitInquiry failed', err);
    return { ok: false, error: 'Something went wrong — please WhatsApp us.' };
  }
}
