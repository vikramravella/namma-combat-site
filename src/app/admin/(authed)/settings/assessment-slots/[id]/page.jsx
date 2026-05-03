import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { AssessmentSlotForm } from '../AssessmentSlotForm';
import { updateAssessmentSlot, deleteAssessmentSlot } from '../actions';

const DAY_LABELS = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };

export default async function EditAssessmentSlotPage({ params }) {
  const { id } = await params;
  const row = await db.assessmentSlot.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/settings/assessment-slots" className="prv-back">← Assessment slots</Link></p>
          <h1 className="adm-page-title">{DAY_LABELS[row.dayOfWeek]} · {row.timeOfDay}</h1>
        </div>
      </div>
      <AssessmentSlotForm row={row} action={updateAssessmentSlot} deleteAction={deleteAssessmentSlot} mode="edit" />
    </>
  );
}
