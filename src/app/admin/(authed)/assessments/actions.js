'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function clean(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) {
    if (v === '' || v === undefined || v === null) out[k] = null;
    else out[k] = v;
  }
  return out;
}

function csv(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean).join(',') : (arr || null);
}

// All fields are optional except memberId — coaches save partials and complete later.
export async function saveAssessment(formData, { id } = {}) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);

  // Multi-selects come in as comma-separated strings (form serialization)
  const data = clean({
    memberId: raw.memberId,
    coachId: raw.coachId || null,
    assessedAt: raw.assessedAt ? new Date(raw.assessedAt) : new Date(),
    ageAtTime: raw.ageAtTime ? parseInt(raw.ageAtTime, 10) : null,
    genderAtTime: raw.genderAtTime || null,
    hasMedicalCondition: raw.hasMedicalCondition === 'true' || raw.hasMedicalCondition === 'on',
    medicalConditionList: raw.medicalConditionList || null,

    ankleDorsiflexionCm: raw.ankleDorsiflexionCm ? parseFloat(raw.ankleDorsiflexionCm) : null,
    ankleArch: raw.ankleArch || null,
    ankleStability: raw.ankleStability || null,
    ankleNotes: raw.ankleNotes || null,

    kneeAlignment: raw.kneeAlignment || null,
    kneeNotes: raw.kneeNotes || null,

    pelvisTilt: raw.pelvisTilt || null,
    pelvisAsisPsis: raw.pelvisAsisPsis || null,
    pelvisNotes: raw.pelvisNotes || null,

    hipPosture: raw.hipPosture || null,
    hipRotation: raw.hipRotation || null,
    hipNotes: raw.hipNotes || null,

    spinePosture: raw.spinePosture || null,        // already comma-list from client
    spineRibFlare: raw.spineRibFlare === 'true' || raw.spineRibFlare === 'on',
    spineNotes: raw.spineNotes || null,

    scapulaPosition: raw.scapulaPosition || null,  // comma-list
    scapulaSymmetryLR: raw.scapulaSymmetryLR || null,
    scapulaNotes: raw.scapulaNotes || null,

    shouldersRotation: raw.shouldersRotation || null,
    shouldersHeightSymmetry: raw.shouldersHeightSymmetry || null,
    shouldersNotes: raw.shouldersNotes || null,

    headNeckPosition: raw.headNeckPosition || null, // comma-list
    headNeckNotes: raw.headNeckNotes || null,

    keyFindings: raw.keyFindings || null,
    priorityFocus: raw.priorityFocus || null,
    exercisesAdvised: raw.exercisesAdvised || null,
    coachSignedName: raw.coachSignedName || null,
  });

  // Sign-off timestamp when name is filled and not already signed
  let coachSignedAt;
  if (data.coachSignedName) coachSignedAt = new Date();

  if (!data.memberId) return { ok: false, error: 'Member required' };

  try {
    let saved;
    if (id) {
      const before = await db.assessment.findUnique({ where: { id } });
      saved = await db.assessment.update({
        where: { id },
        data: {
          ...data,
          coachSignedAt: coachSignedAt ?? before.coachSignedAt,
        },
      });
      await logAudit({ actorUserId: session.user.id, action: 'update', entity: 'Assessment', entityId: id, before, after: saved });
    } else {
      saved = await db.assessment.create({
        data: {
          ...data,
          coachSignedAt: coachSignedAt ?? null,
        },
      });
      await logAudit({ actorUserId: session.user.id, action: 'create', entity: 'Assessment', entityId: saved.id, after: saved });

      // If this assessment fulfilled a booking, mark it completed and link.
      const bookingId = raw.bookingId || null;
      if (bookingId) {
        await db.assessmentBooking.update({
          where: { id: bookingId },
          data: { status: 'completed', assessmentId: saved.id },
        });
        revalidatePath('/admin/assessments');
      }
    }
    revalidatePath('/admin/assessments');
    revalidatePath(`/admin/members/${data.memberId}`);
    if (id) revalidatePath(`/admin/assessments/${id}`);
    return { ok: true, id: saved.id };
  } catch (err) {
    console.error('saveAssessment failed', err);
    return { ok: false, error: 'Could not save assessment.' };
  }
}

export async function deleteAssessment(id) {
  const session = await requireSession();
  try {
    const before = await db.assessment.findUnique({ where: { id } });
    if (!before) return { ok: false, error: 'Not found' };
    await db.assessment.delete({ where: { id } });
    await logAudit({ actorUserId: session.user.id, action: 'delete', entity: 'Assessment', entityId: id, before });
    revalidatePath('/admin/assessments');
    revalidatePath(`/admin/members/${before.memberId}`);
    redirect(`/admin/members/${before.memberId}`);
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('deleteAssessment failed', err);
    return { ok: false, error: 'Could not delete.' };
  }
}
