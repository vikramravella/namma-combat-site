import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatRupees, formatDate } from '@/lib/format';
import { TIERS, DISCIPLINES_COMBAT, DISCIPLINES_SANCTUARY } from '@/lib/constants';
import { DashFilters } from './DashFilters';

// Cache the dashboard for 10 seconds — subsequent visits within window are instant.
// Fresh enough for admin use; cuts perceived latency dramatically.
export const revalidate = 10;

const ALL_DISCIPLINES = [...DISCIPLINES_COMBAT.filter((d) => d !== 'Workshop'), ...DISCIPLINES_SANCTUARY.filter((d) => d !== 'Workshop')];
const PERIOD_DAYS = { today: 1, week: 7, month: 30, quarter: 90, year: 365 };

export default async function DashboardPage({ searchParams }) {
  const sp = await searchParams;
  const period = sp?.period && PERIOD_DAYS[sp.period] ? sp.period : 'month';
  const discipline = sp?.discipline || '';
  const gender = sp?.gender || '';
  const tier = sp?.tier && TIERS.find((t) => t.key === sp.tier) ? sp.tier : '';

  const days = PERIOD_DAYS[period];
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days + 1);

  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
  const fourteenFromNow = new Date(); fourteenFromNow.setDate(fourteenFromNow.getDate() + 14);
  const ninetyAgo = new Date(); ninetyAgo.setDate(ninetyAgo.getDate() - 90);
  const now = new Date();

  // Member filters apply only where it makes sense
  const memberFilter = {};
  if (gender) memberFilter.gender = gender;
  if (discipline) memberFilter.OR = [
    { primaryDiscipline: discipline },
    { disciplines: { contains: discipline } },
  ];

  // Money payments — apply gender + discipline + tier through receipt → plan → member
  const paymentWhere = { receivedAt: { gte: since } };
  if (tier || gender || discipline) {
    paymentWhere.receipt = { plan: {} };
    if (tier) paymentWhere.receipt.plan.tier = tier;
    if (gender || discipline) {
      paymentWhere.receipt.plan.member = {};
      if (gender) paymentWhere.receipt.plan.member.gender = gender;
      if (discipline) paymentWhere.receipt.plan.member.OR = [
        { primaryDiscipline: discipline },
        { disciplines: { contains: discipline } },
      ];
    }
  }

  // Single payments query, derive everything from it
  const [periodPayments, todayPayments, allMembers, trialsTodayList,
         followUpsDue, trialsWeek, newInquiries, partialReceipts,
         considering, noShowsToReschedule, trialFollowUps,
         renewalsDue, assessPending, criticalHealth, mediaUnknown, smokers,
         memberStatusGroup, periodTrials, periodConversions] = await Promise.all([
    db.payment.findMany({ where: paymentWhere }),
    db.payment.findMany({ where: { receivedAt: { gte: dayStart, lt: dayEnd } } }),
    db.member.count({ where: memberFilter }),
    db.trial.findMany({ where: { status: { in: ['booked', 'confirmed'] }, scheduledDate: { gte: dayStart, lt: dayEnd } }, include: { inquiry: true } }),

    db.inquiry.count({ where: { nextFollowUpAt: { lte: now }, stage: { in: ['new', 'following_up'] } } }),
    db.trial.count({ where: { status: { in: ['booked', 'confirmed'] }, scheduledDate: { gte: dayStart, lt: new Date(dayStart.getTime() + 7 * 86400000) } } }),
    db.inquiry.count({ where: { stage: 'new' } }),
    db.receipt.count({ where: { status: 'partial' } }),
    db.trial.count({ where: { outcome: 'considering' } }),
    db.trial.count({ where: { status: 'no_show', convertedMemberId: null } }),
    db.trial.count({ where: { nextFollowUpAt: { lte: now }, outcome: { in: ['considering', 'lost_touch'] } } }),

    db.plan.findMany({ where: { status: 'running', endDate: { lte: fourteenFromNow, gte: now } }, include: { member: true }, orderBy: { endDate: 'asc' }, take: 8 }),
    db.member.findMany({
      where: { status: 'active', OR: [{ assessments: { none: {} } }, { assessments: { every: { assessedAt: { lt: ninetyAgo } } } }] },
      take: 8, orderBy: { joinedAt: 'asc' },
    }),
    db.member.findMany({ where: { criticalHealthFlag: true, status: 'active' }, take: 5 }),
    db.member.count({ where: { mediaConsent: null, status: 'active' } }),
    db.member.count({ where: { smokes: true, status: 'active' } }),

    db.member.groupBy({ by: ['status'], where: memberFilter, _count: { _all: true } }),
    db.trial.count({ where: { scheduledDate: { gte: since } } }),
    db.trial.count({ where: { scheduledDate: { gte: since }, outcome: 'joined' } }),
  ]);

  const periodRevenuePaise = periodPayments.reduce((s, p) => s + p.amountPaise, 0);
  const todayRevenuePaise = todayPayments.reduce((s, p) => s + p.amountPaise, 0);
  const conversionRate = periodTrials > 0 ? Math.round((periodConversions / periodTrials) * 100) : 0;

  const counts = { active: 0, on_freeze: 0, lapsed: 0, left: 0 };
  for (const r of memberStatusGroup) counts[r.status] = r._count._all;

  const today = new Date();
  const weekday = today.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateLine = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="ed">
      {/* Masthead */}
      <header className="ed-masthead">
        <div className="ed-mast-left">
          <p className="ed-eyebrow">The Daily — for Vinod</p>
          <h1 className="ed-date">{weekday}</h1>
          <p className="ed-sub">{dateLine}</p>
        </div>
        <div className="ed-mast-right">
          <DashFilters period={period} discipline={discipline} gender={gender} tier={tier} disciplines={ALL_DISCIPLINES} tiers={TIERS} />
        </div>
      </header>

      <div className="ed-rule" />

      {/* Hero — money in selected period */}
      <section className="ed-hero">
        <p className="ed-hero-label">Money received · {labelFor(period)}</p>
        <p className="ed-hero-number">{formatRupees(periodRevenuePaise)}</p>
        <p className="ed-hero-context">
          {periodPayments.length === 0 ? (
            <em>No payments in this period.</em>
          ) : (
            <>From <strong>{periodPayments.length}</strong> payment{periodPayments.length === 1 ? '' : 's'}. Today · <strong>{formatRupees(todayRevenuePaise)}</strong>. Trial conversion · <strong>{conversionRate}%</strong> ({periodConversions} of {periodTrials}).</>
          )}
        </p>
      </section>

      <div className="ed-rule ed-rule-gold" />

      {/* What needs you */}
      <section className="ed-section">
        <h2 className="ed-section-head">What needs you</h2>
        <div className="ed-needs">
          <NeedLine href="/admin/inquiries?queue=due" count={followUpsDue} singular="inquiry follow-up due" plural="inquiry follow-ups due" />
          <NeedLine href="/admin/trials?when=today" count={trialsTodayList.length} singular="trial today" plural="trials today" />
          <NeedLine href="/admin/trials" count={trialFollowUps} singular="trial follow-up due" plural="trial follow-ups due" />
          <NeedLine href="/admin/trials?status=no_show" count={noShowsToReschedule} singular="no-show to reschedule" plural="no-shows to reschedule" />
          <NeedLine href="/admin/trials" count={considering} singular="trial considering — needs nudge" plural="trials considering — need nudge" />
          <NeedLine href="/admin/inquiries?stage=new" count={newInquiries} singular="new inquiry" plural="new inquiries" />
          <NeedLine href="/admin/receipts?status=partial" count={partialReceipts} singular="outstanding receipt" plural="outstanding receipts" />
        </div>
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
                    <span className="ed-trial-meta"> · {t.discipline} · {t.area}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Watch list — only show alerts that have items */}
      {(renewalsDue.length > 0 || assessPending.length > 0 || criticalHealth.length > 0) && (
        <>
          <div className="ed-rule" />
          <section className="ed-section">
            <h2 className="ed-section-head">Watch list</h2>

            {renewalsDue.length > 0 && (
              <BannerAlert tone="rust" title="Renewals coming up" detail={`${renewalsDue.length} plan${renewalsDue.length === 1 ? '' : 's'} ending in the next 14 days`}>
                {renewalsDue.slice(0, 6).map((p) => (
                  <span key={p.id} className="ed-alert-pill">
                    <Link href={`/admin/members/${p.memberId}`}>{fullName(p.member)}</Link>
                    <em> · {formatDate(p.endDate)}</em>
                  </span>
                ))}
              </BannerAlert>
            )}

            {assessPending.length > 0 && (
              <BannerAlert tone="gold" title="Assessments overdue" detail={`${assessPending.length} active member${assessPending.length === 1 ? '' : 's'} not assessed in 90+ days`}>
                {assessPending.slice(0, 6).map((m) => (
                  <span key={m.id} className="ed-alert-pill">
                    <Link href={`/admin/members/${m.id}`}>{fullName(m)}</Link>
                  </span>
                ))}
              </BannerAlert>
            )}

            {criticalHealth.length > 0 && (
              <BannerAlert tone="red" title="Critical health flagged" detail={`${criticalHealth.length} member${criticalHealth.length === 1 ? '' : 's'} need coach attention`}>
                {criticalHealth.map((m) => (
                  <span key={m.id} className="ed-alert-pill">
                    <Link href={`/admin/members/${m.id}`}>{fullName(m)}</Link>
                  </span>
                ))}
              </BannerAlert>
            )}

            {(mediaUnknown > 0 || smokers > 0) && (
              <p className="ed-mini-line">
                {mediaUnknown > 0 && <><strong>{mediaUnknown}</strong> active member{mediaUnknown === 1 ? '' : 's'} haven't been asked about media consent. </>}
                {smokers > 0 && <><strong>{smokers}</strong> active smoker{smokers === 1 ? '' : 's'} on file.</>}
              </p>
            )}
          </section>
        </>
      )}

      <div className="ed-rule" />

      {/* The membership — paragraph form */}
      <section className="ed-section">
        <h2 className="ed-section-head">The membership</h2>
        <p className="ed-paragraph">
          You currently have <strong>{counts.active}</strong> active member{counts.active === 1 ? '' : 's'}
          {discipline && <> training <strong>{discipline}</strong></>}
          {gender && <> ({gender === 'M' ? 'male' : gender === 'F' ? 'female' : gender})</>},
          <strong> {counts.on_freeze}</strong> on freeze, and
          <strong> {counts.lapsed}</strong> lapsed. This week brings <strong>{trialsWeek}</strong> trial{trialsWeek === 1 ? '' : 's'} on the calendar.
        </p>
      </section>

      <div className="ed-rule ed-rule-gold" />

      <footer className="ed-foot">
        <Link href="/admin/inquiries/new" className="adm-btn">+ New inquiry</Link>
        <Link href="/admin/plans/new" className="adm-btn adm-btn-secondary" style={{ marginLeft: 8 }}>+ New plan</Link>
      </footer>
    </div>
  );
}

function labelFor(period) {
  return { today: 'today', week: 'last 7 days', month: 'last 30 days', quarter: 'last 90 days', year: 'last 365 days' }[period];
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

function BannerAlert({ tone, title, detail, children }) {
  return (
    <div className={`ed-alert ed-alert-${tone}`}>
      <div className="ed-alert-head">
        <h3 className="ed-alert-title">{title}</h3>
        <p className="ed-alert-detail">{detail}</p>
      </div>
      {children && <div className="ed-alert-pills">{children}</div>}
    </div>
  );
}
