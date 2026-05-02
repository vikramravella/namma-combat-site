import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatRelative, formatDate } from '@/lib/format';

export const revalidate = 10;

export default async function DashboardPage() {
  const now = new Date();
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  // Fetch only what's needed for the action queue + on-the-floor list.
  // No money. No member counts. No revenue. Those live on /admin/reports.
  const [followUpsDue, trialsTodayList, considering, noShowsToReschedule, partialReceipts] = await Promise.all([
    db.inquiry.count({ where: { nextFollowUpAt: { lte: now }, stage: { in: ['new', 'following_up'] } } }),
    db.trial.findMany({
      where: { status: { in: ['booked', 'confirmed'] }, scheduledDate: { gte: dayStart, lt: dayEnd } },
      include: { inquiry: true },
      orderBy: { scheduledTime: 'asc' },
    }),
    db.trial.count({ where: { outcome: 'considering' } }),
    db.trial.count({ where: { status: 'no_show', convertedMemberId: null } }),
    db.receipt.count({ where: { status: 'partial' } }),
  ]);

  const today = new Date();
  const weekday = today.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateLine = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="ed">
      <header className="ed-masthead">
        <div className="ed-mast-left">
          <p className="ed-eyebrow">The Daily — for Vinod</p>
          <h1 className="ed-date">{weekday}</h1>
          <p className="ed-sub">{dateLine}</p>
        </div>
        <div className="ed-mast-right">
          <Link href="/admin/reports" className="adm-btn adm-btn-secondary">📊 Reports & numbers →</Link>
        </div>
      </header>

      <div className="ed-rule" />

      {/* What needs you — task counts, no money */}
      <section className="ed-section">
        <h2 className="ed-section-head">What needs you</h2>
        <div className="ed-needs">
          <NeedLine href="/admin/inquiries?queue=due" count={followUpsDue} singular="inquiry follow-up due" plural="inquiry follow-ups due" />
          <NeedLine href="/admin/trials?when=today" count={trialsTodayList.length} singular="trial today" plural="trials today" />
          <NeedLine href="/admin/trials?status=no_show" count={noShowsToReschedule} singular="no-show to reschedule" plural="no-shows to reschedule" />
          <NeedLine href="/admin/trials" count={considering} singular="trial considering — needs nudge" plural="trials considering — need nudge" />
          <NeedLine href="/admin/receipts?status=partial" count={partialReceipts} singular="receipt with balance pending" plural="receipts with balance pending" />
        </div>
        {followUpsDue + trialsTodayList.length + noShowsToReschedule + considering + partialReceipts === 0 && (
          <p className="ed-paragraph"><em>Nothing on the queue. The day is yours.</em></p>
        )}
      </section>

      {trialsTodayList.length > 0 && (
        <>
          <div className="ed-rule" />
          <section className="ed-section">
            <h2 className="ed-section-head">On the floor today</h2>
            <ul className="ed-trial-list">
              {trialsTodayList.map((t) => (
                <li key={t.id} className="ed-trial">
                  <span className="ed-trial-time">{t.scheduledTime}</span>
                  <span className="ed-trial-body">
                    <Link href={`/admin/trials/${t.id}`} className="ed-trial-name">{fullName(t.inquiry)}</Link>
                    <span className="ed-trial-meta"> · {t.discipline}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className="ed-rule ed-rule-gold" />

      <section className="ed-section">
        <h2 className="ed-section-head">Quick actions</h2>
        <div className="dash-actions">
          <Link href="/admin/inquiries/new" className="adm-btn">+ New inquiry</Link>
          <Link href="/admin/plans/new" className="adm-btn adm-btn-secondary">+ New plan</Link>
          <Link href="/admin/assessments/new" className="adm-btn adm-btn-secondary">+ New assessment</Link>
          <Link href="/admin/trials/new" className="adm-btn adm-btn-secondary">+ Schedule trial</Link>
        </div>
      </section>
    </div>
  );
}

function NeedLine({ href, count, singular, plural }) {
  if (count === 0) return null;
  return (
    <Link href={href} className="ed-need">
      <span className="ed-need-num">{count}</span>
      <span className="ed-need-text">{count === 1 ? singular : plural}</span>
    </Link>
  );
}
