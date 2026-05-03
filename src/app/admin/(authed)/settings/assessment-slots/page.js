import Link from 'next/link';
import { db } from '@/lib/db';

export const revalidate = 10;

const DAY_LABELS = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };

export default async function AssessmentSlotsPage() {
  const rows = await db.assessmentSlot.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { timeOfDay: 'asc' }] });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Assessment slots</h1>
          <p className="adm-page-subtitle">{rows.length} weekly slot{rows.length === 1 ? '' : 's'}. Members book against these for posture assessments.</p>
        </div>
        <Link href="/admin/settings/assessment-slots/new" className="adm-btn">+ New slot</Link>
      </div>

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty"><p>No slots yet. Add the first.</p></div>
        ) : (
          <table className="prv-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Capacity</th>
                <th>Notes</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{DAY_LABELS[r.dayOfWeek] || `Day ${r.dayOfWeek}`}</strong></td>
                  <td className="adm-mono">{r.timeOfDay}</td>
                  <td className="prv-muted">{r.durationMinutes} min</td>
                  <td className="prv-muted">{r.capacity}</td>
                  <td className="prv-muted">{r.notes || '—'}</td>
                  <td>{r.active ? <span className="prv-stage prv-stage-green"><span className="prv-stage-dot" />Active</span> : <span className="prv-stage prv-stage-gray"><span className="prv-stage-dot" />Off</span>}</td>
                  <td><Link href={`/admin/settings/assessment-slots/${r.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
