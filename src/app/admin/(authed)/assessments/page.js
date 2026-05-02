import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';

export const revalidate = 10;
export default async function AssessmentsPage() {
  const rows = await db.assessment.findMany({
    orderBy: { assessedAt: 'desc' },
    take: 200,
    include: { member: true, coach: true },
  });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Assessments</h1>
          <p className="adm-page-subtitle">{rows.length} {rows.length === 1 ? 'assessment' : 'assessments'} on file</p>
        </div>
        <Link href="/admin/assessments/new" className="adm-btn">+ New assessment</Link>
      </div>

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty">
            <p>No assessments yet.</p>
            <Link href="/admin/assessments/new" className="adm-btn">Add the first one</Link>
          </div>
        ) : (
          <table className="prv-table">
            <thead><tr><th>Member</th><th>Date</th><th>Coach</th><th>Priority focus</th><th>Signed</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/admin/members/${a.memberId}`} className="prv-name">{fullName(a.member)}</Link></td>
                  <td><Link href={`/admin/assessments/${a.id}`}>{formatDate(a.assessedAt)}</Link><div className="prv-sub">{formatRelative(a.assessedAt)}</div></td>
                  <td className="prv-muted">{a.coach?.name || '—'}</td>
                  <td>{a.priorityFocus || <span className="adm-muted">—</span>}</td>
                  <td className="prv-muted">{a.coachSignedAt ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
