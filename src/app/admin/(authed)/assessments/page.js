import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';

export const revalidate = 10;

const DAY_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };

export default async function AssessmentsPage() {
  const now = new Date();
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);

  const [todayBookings, upcomingBookings, rows] = await Promise.all([
    db.assessmentBooking.findMany({
      where: { scheduledDate: { gte: startOfToday, lt: endOfToday }, status: 'booked' },
      include: { member: true, slot: true },
      orderBy: [{ slot: { timeOfDay: 'asc' } }, { createdAt: 'asc' }],
    }),
    db.assessmentBooking.findMany({
      where: { scheduledDate: { gte: endOfToday }, status: 'booked' },
      include: { member: true, slot: true },
      orderBy: [{ scheduledDate: 'asc' }],
      take: 50,
    }),
    db.assessment.findMany({
      orderBy: { assessedAt: 'desc' },
      take: 100,
      include: { member: true, coach: true },
    }),
  ]);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Assessments</h1>
          <p className="adm-page-subtitle">{rows.length} on file · {todayBookings.length} booked today · {upcomingBookings.length} upcoming</p>
        </div>
        <Link href="/admin/assessments/new" className="adm-btn">+ New assessment</Link>
      </div>

      {todayBookings.length > 0 && (
        <div className="adm-card" style={{ borderLeft: '4px solid var(--rust, #9A3520)', marginBottom: 16 }}>
          <h2 className="adm-card-title">Today&rsquo;s queue ({todayBookings.length})</h2>
          <table className="prv-table">
            <thead><tr><th>Time</th><th>Member</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {todayBookings.map((b) => (
                <tr key={b.id}>
                  <td className="adm-mono"><strong>{b.slot.timeOfDay}</strong></td>
                  <td><Link href={`/admin/members/${b.memberId}`} className="prv-name"><strong>{fullName(b.member)}</strong></Link></td>
                  <td className="adm-mono">{b.member.phone}</td>
                  <td><Link href={`/admin/assessments/new?bookingId=${b.id}`} className="adm-btn">Start →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <h2 className="adm-card-title">Upcoming bookings</h2>
          <table className="prv-table">
            <thead><tr><th>Date</th><th>Time</th><th>Member</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {upcomingBookings.map((b) => (
                <tr key={b.id}>
                  <td>{DAY_LABELS[b.slot.dayOfWeek]} {formatDate(b.scheduledDate)}</td>
                  <td className="adm-mono">{b.slot.timeOfDay}</td>
                  <td><Link href={`/admin/members/${b.memberId}`} className="prv-name">{fullName(b.member)}</Link></td>
                  <td className="adm-mono">{b.member.phone}</td>
                  <td><Link href={`/admin/members/${b.memberId}`} className="adm-btn adm-btn-secondary adm-btn-sm">Member →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="prv-table-wrap">
        <h2 className="adm-card-title" style={{ marginTop: 24 }}>Past assessments</h2>
        {rows.length === 0 ? (
          <div className="prv-empty"><p>No assessments yet.</p></div>
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
