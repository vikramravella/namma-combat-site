import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatRupees, formatDate } from '@/lib/format';
import { TIERS, DISCIPLINES_COMBAT, DISCIPLINES_SANCTUARY } from '@/lib/constants';
import { DashFilters } from '../DashFilters';

export const revalidate = 30;

const ALL_DISCIPLINES = [...DISCIPLINES_COMBAT.filter((d) => d !== 'Workshop'), ...DISCIPLINES_SANCTUARY.filter((d) => d !== 'Workshop')];
const PERIOD_DAYS = { today: 1, week: 7, month: 30, quarter: 90, year: 365 };

export default async function ReportsPage({ searchParams }) {
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

  const memberFilter = {};
  if (gender) memberFilter.gender = gender;
  if (discipline) memberFilter.OR = [
    { primaryDiscipline: discipline },
    { disciplines: { contains: discipline } },
  ];

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

  const [periodPayments, todayPayments, memberCount, byStatus, byGender, bySkill,
         periodTrials, periodConversions, partialReceipts] = await Promise.all([
    db.payment.findMany({ where: paymentWhere }),
    db.payment.findMany({ where: { receivedAt: { gte: dayStart, lt: dayEnd } } }),
    db.member.count({ where: memberFilter }),
    db.member.groupBy({ by: ['status'], where: memberFilter, _count: { _all: true } }),
    db.member.groupBy({ by: ['gender'], where: memberFilter, _count: { _all: true } }),
    db.member.groupBy({ by: ['skillLevel'], where: memberFilter, _count: { _all: true } }),
    db.trial.count({ where: { scheduledDate: { gte: since } } }),
    db.trial.count({ where: { scheduledDate: { gte: since }, outcome: 'joined' } }),
    db.receipt.findMany({ where: { status: 'partial' }, include: { payments: { select: { amountPaise: true } } } }),
  ]);

  const periodRevenuePaise = periodPayments.reduce((s, p) => s + p.amountPaise, 0);
  const todayRevenuePaise = todayPayments.reduce((s, p) => s + p.amountPaise, 0);
  const conversionRate = periodTrials > 0 ? Math.round((periodConversions / periodTrials) * 100) : 0;
  const outstandingTotalPaise = partialReceipts.reduce((s, r) => {
    const paid = r.payments.reduce((x, p) => x + p.amountPaise, 0);
    return s + (r.totalPaise - paid);
  }, 0);

  const counts = { active: 0, on_freeze: 0, lapsed: 0, left: 0 };
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <div className="ed">
      <header className="ed-masthead">
        <div className="ed-mast-left">
          <p className="ed-eyebrow">
            <Link href="/admin" className="prv-back">← Dashboard</Link>
          </p>
          <h1 className="ed-date" style={{ fontSize: 36 }}>Reports</h1>
          <p className="ed-sub">Money + members. Filter by period, sport, gender, tier.</p>
        </div>
        <div className="ed-mast-right">
          <DashFilters period={period} discipline={discipline} gender={gender} tier={tier} disciplines={ALL_DISCIPLINES} tiers={TIERS} />
        </div>
      </header>

      <div className="ed-rule" />

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

      <section className="ed-section">
        <h2 className="ed-section-head">The membership</h2>
        <p className="ed-paragraph">
          Currently <strong>{counts.active}</strong> active member{counts.active === 1 ? '' : 's'}
          {discipline && <> training <strong>{discipline}</strong></>}
          {gender && <> ({gender === 'M' ? 'male' : gender === 'F' ? 'female' : gender})</>},
          <strong> {counts.on_freeze}</strong> on freeze, <strong>{counts.lapsed}</strong> lapsed.
          Total on file: <strong>{memberCount}</strong>.
        </p>
      </section>

      <div className="ed-rule" />

      <section className="ed-section">
        <h2 className="ed-section-head">Outstanding</h2>
        <p className="ed-paragraph">
          <strong>{formatRupees(outstandingTotalPaise)}</strong> owed across <strong>{partialReceipts.length}</strong> receipt{partialReceipts.length === 1 ? '' : 's'}.
        </p>
        <p style={{ marginTop: 8 }}>
          <Link href="/admin/receipts?status=partial" className="adm-btn adm-btn-secondary">See all outstanding →</Link>
        </p>
      </section>

      <div className="ed-rule" />

      <section className="ed-section">
        <h2 className="ed-section-head">Breakdown</h2>
        <div className="dash-breakdown">
          <BreakdownGroup label="Status" rows={byStatus.map((r) => [r.status, r._count._all])} />
          <BreakdownGroup label="Gender" rows={byGender.map((r) => [r.gender || '—', r._count._all])} />
          <BreakdownGroup label="Skill level" rows={bySkill.map((r) => [r.skillLevel, r._count._all])} />
        </div>
      </section>
    </div>
  );
}

function labelFor(period) {
  return { today: 'today', week: 'last 7 days', month: 'last 30 days', quarter: 'last 90 days', year: 'last 365 days' }[period];
}

function BreakdownGroup({ label, rows }) {
  return (
    <div className="dash-breakdown-group">
      <div className="dash-breakdown-label">{label}</div>
      {rows.length === 0 ? <p className="adm-muted" style={{ fontSize: 12 }}>—</p> : (
        <table className="dash-breakdown-table">
          <tbody>
            {rows.map(([k, v]) => (<tr key={k}><td>{k}</td><td>{v}</td></tr>))}
          </tbody>
        </table>
      )}
    </div>
  );
}
