import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName } from '@/lib/format';
import { AssessmentForm } from '../AssessmentForm';

export default async function NewAssessmentPage({ searchParams }) {
  const sp = await searchParams;
  const memberId = sp?.memberId;

  if (!memberId) {
    const recent = await db.member.findMany({ where: { status: { in: ['active', 'on_freeze'] } }, orderBy: { joinedAt: 'desc' }, take: 50 });
    return (
      <>
        <div className="adm-page-header">
          <div>
            <p className="prv-eyebrow"><Link href="/admin/assessments" className="prv-back">← Assessments</Link></p>
            <h1 className="adm-page-title">New assessment</h1>
            <p className="adm-page-subtitle">Pick the member to assess.</p>
          </div>
        </div>
        <div className="prv-table-wrap">
          {recent.length === 0 ? (
            <div className="prv-empty"><p>No members yet.</p></div>
          ) : (
            <table className="prv-table">
              <thead><tr><th>Member</th><th>Phone</th><th></th></tr></thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id}>
                    <td>{fullName(m)}</td>
                    <td className="adm-mono">{m.phone}</td>
                    <td><Link href={`/admin/assessments/new?memberId=${m.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Pick →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) return <p>Member not found.</p>;
  const coaches = await db.coach.findMany({ where: { active: true }, orderBy: { name: 'asc' } });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href={`/admin/members/${member.id}`} className="prv-back">← {fullName(member)}</Link></p>
          <h1 className="adm-page-title">New posture assessment</h1>
        </div>
      </div>
      <AssessmentForm member={member} coaches={coaches} mode="create" />
    </>
  );
}
