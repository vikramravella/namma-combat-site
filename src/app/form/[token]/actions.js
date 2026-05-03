'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

const formSchema = z.object({
  dob: z.string().min(1, 'Date of birth required'),
  gender: z.string().trim().min(1, 'Gender required').max(20),
  emergencyName: z.string().trim().min(1, 'Emergency contact name required').max(120),
  emergencyPhone: z.string().trim().min(1, 'Emergency contact phone required').max(20),
  emergencyRelation: z.string().trim().min(1, 'Emergency contact relation required').max(60),
  // Health fields stay optional — leave blank if none
  medicalConditions: z.string().trim().max(1000).optional().or(z.literal('')),
  injuries: z.string().trim().max(1000).optional().or(z.literal('')),
  medications: z.string().trim().max(1000).optional().or(z.literal('')),
  smoking: z.enum(['no', 'occasionally', 'yes']),
  alcohol: z.enum(['no', 'socially', 'regularly']),
  mediaConsent: z.enum(['yes', 'no']),
  consentSignedName: z.string().trim().min(1, 'Please type your full name to sign').max(120),
});

export async function submitHealthForm(token, formData) {
  const raw = Object.fromEntries(formData);
  const parsed = formSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const tokenRow = await db.healthFormToken.findUnique({
    where: { token },
    include: { trial: { include: { healthDecl: true } } },
  });
  if (!tokenRow) return { ok: false, error: 'Invalid link' };
  if (tokenRow.expiresAt < new Date()) return { ok: false, error: 'Link expired' };
  if (tokenRow.usedAt || tokenRow.trial.healthDecl) return { ok: false, error: 'Already submitted' };

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || null;

  const data = parsed.data;
  try {
    await db.$transaction(async (tx) => {
      await tx.healthDeclaration.create({
        data: {
          trialId: tokenRow.trialId,
          dob: data.dob ? new Date(data.dob) : null,
          gender: data.gender || null,
          emergencyName: data.emergencyName || null,
          emergencyPhone: data.emergencyPhone || null,
          emergencyRelation: data.emergencyRelation || null,
          medicalConditions: data.medicalConditions || null,
          injuries: data.injuries || null,
          medications: data.medications || null,
          smoking: data.smoking || null,
          alcohol: data.alcohol || null,
          mediaConsent: data.mediaConsent === 'yes' ? true : data.mediaConsent === 'no' ? false : null,
          consentSignedName: data.consentSignedName,
          consentSignedAt: new Date(),
          submittedFromIp: ip,
        },
      });
      await tx.healthFormToken.update({
        where: { id: tokenRow.id },
        data: { usedAt: new Date() },
      });
    });
    return { ok: true };
  } catch (err) {
    console.error('submitHealthForm failed', err);
    return { ok: false, error: 'Could not submit. Try again or WhatsApp us.' };
  }
}
