import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate } from '@/lib/format';
import { AssessmentForm } from '../AssessmentForm';

export default async function AssessmentDetailPage({ params }) {
  const { id } = await params;
  const a = await db.assessment.findUnique({
    where: { id },
    include: { member: true, coach: true },
  });
  if (!a) notFound();

  const coaches = await db.coach.findMany({ where: { active: true }, orderBy: { name: 'asc' } });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href={`/admin/members/${a.memberId}`} className="prv-back">← {fullName(a.member)}</Link></p>
          <h1 className="adm-page-title">Assessment · {formatDate(a.assessedAt)}</h1>
          <p className="adm-page-subtitle">{a.coach?.name ? `Coach ${a.coach.name}` : 'No coach assigned'}{a.coachSignedAt ? ` · Signed ${formatDate(a.coachSignedAt)}` : ' · Not yet signed'}</p>
        </div>
      </div>

      <AssessmentForm member={a.member} coaches={coaches} assessment={a} mode="edit" />
    </>
  );
}
