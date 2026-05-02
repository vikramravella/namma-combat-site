'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { DESIGNATIONS, MEMBER_STATUSES, SKILL_LEVELS } from '@/lib/constants';

const statusKeys = MEMBER_STATUSES.map((s) => s.key);
const skillKeys = SKILL_LEVELS.map((s) => s.key);

const memberSchema = z.object({
  designation: z.enum([...DESIGNATIONS, '']).optional(),
  firstName: z.string().trim().min(1, 'First name required').max(80),
  lastName: z.string().trim().min(1, 'Last name required').max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{7,20}$/, 'Phone looks invalid'),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().trim().max(20).optional().or(z.literal('')),
  primaryDiscipline: z.string().trim().max(80).optional().or(z.literal('')),
  disciplines: z.string().trim().max(300).optional().or(z.literal('')),
  skillLevel: z.enum(skillKeys).optional(),
  status: z.enum(statusKeys).optional(),
  emergencyName: z.string().trim().max(120).optional().or(z.literal('')),
  emergencyPhone: z.string().trim().max(20).optional().or(z.literal('')),
  emergencyRelation: z.string().trim().max(60).optional().or(z.literal('')),
  medicalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  criticalHealthFlag: z.string().optional(),
  smokes: z.string().optional(),
  mediaConsent: z.enum(['true', 'false', '']).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function clean(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) out[k] = v === '' || v === undefined ? null : v;
  if (out.phone) out.phone = String(out.phone).replace(/\s|-/g, '');
  if (out.dob) out.dob = new Date(out.dob);
  return out;
}

export async function updateMember(id, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = memberSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = clean(parsed.data);
  try {
    const before = await db.member.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Member not found' };

    const updated = await db.$transaction(async (tx) => {
      const m = await tx.member.update({
        where: { id },
        data: {
          designation: data.designation,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dob: data.dob,
          gender: data.gender,
          primaryDiscipline: data.primaryDiscipline,
          disciplines: data.disciplines,
          skillLevel: data.skillLevel || before.skillLevel,
          status: data.status || before.status,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          emergencyRelation: data.emergencyRelation,
          medicalNotes: data.medicalNotes,
          criticalHealthFlag: data.criticalHealthFlag === 'true',
          smokes: data.smokes === 'true',
          mediaConsent: data.mediaConsent === 'true' ? true : data.mediaConsent === 'false' ? false : null,
          notes: data.notes,
        },
      });

      // Cascade snapshot updates to all this member's receipts (preserves the
      // legal "snapshot at issue" but reflects corrections — receipt gets a
      // revision marker so it's clear it was edited post-issue).
      const fullName = [data.designation ? `${data.designation}.` : '', data.firstName, data.lastName].filter(Boolean).join(' ').trim();
      const plans = await tx.plan.findMany({ where: { memberId: id }, select: { id: true } });
      if (plans.length > 0) {
        const planIds = plans.map((p) => p.id);
        const receipts = await tx.receipt.findMany({ where: { planId: { in: planIds } }, select: { id: true, customerNameSnapshot: true, customerPhoneSnapshot: true, customerGstinSnapshot: true } });
        for (const r of receipts) {
          if (r.customerNameSnapshot !== fullName || r.customerPhoneSnapshot !== data.phone) {
            await tx.receipt.update({
              where: { id: r.id },
              data: {
                customerNameSnapshot: fullName,
                customerPhoneSnapshot: data.phone,
                revisionCount: { increment: 1 },
                lastRevisedAt: new Date(),
              },
            });
          }
        }
      }
      return m;
    });

    await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'Member', entityId: id, before, after: updated });
    revalidatePath('/admin/members');
    revalidatePath(`/admin/members/${id}`);
    revalidatePath('/admin/receipts');
    return { ok: true };
  } catch (err) {
    if (err?.code === 'P2002') return { ok: false, error: 'Another member has this phone.' };
    console.error('updateMember failed', err);
    return { ok: false, error: 'Could not update.' };
  }
}

export async function deleteMember(id) {
  const session = await requireSession();
  try {
    const before = await db.member.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Member not found' };
    await db.member.delete({ where: { id } });
    await logAudit({ actorUserId: session.user.id, action: 'delete', entity: 'Member', entityId: id, before });
    revalidatePath('/admin/members');
    redirect('/admin/members');
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('deleteMember failed', err);
    return { ok: false, error: 'Could not delete.' };
  }
}
