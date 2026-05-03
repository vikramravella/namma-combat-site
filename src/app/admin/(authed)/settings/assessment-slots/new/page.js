import Link from 'next/link';
import { AssessmentSlotForm } from '../AssessmentSlotForm';
import { createAssessmentSlot } from '../actions';

export default function NewAssessmentSlotPage() {
  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/settings/assessment-slots" className="prv-back">← Assessment slots</Link></p>
          <h1 className="adm-page-title">New assessment slot</h1>
        </div>
      </div>
      <AssessmentSlotForm action={createAssessmentSlot} mode="create" />
    </>
  );
}
