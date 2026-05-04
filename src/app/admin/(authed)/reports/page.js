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
  const drillMonth = sp?.month || ''; // 'YYYY-MM'

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

  // Voided receipts have their payments excluded everywhere — voiding
  // cancels the transaction, so it must not show up in revenue counts.
  const paymentWhere = {
    receivedAt: { gte: since },
    receipt: { status: { not: 'void' } },
  };
  if (tier || gender || discipline) {
    paymentWhere.receipt = { ...paymentWhere.receipt, plan: {} };
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

  // 12-month revenue series. We pull all payments since the start of
  // the 12-month window via Prisma (typed) and bucket by month in JS.
  // Keeps us inside Prisma's query type-safety; the bucket count stays
  // small enough that the in-memory aggregate is cheap.
  const seriesStart = new Date(); seriesStart.setHours(0, 0, 0, 0); seriesStart.setMonth(seriesStart.getMonth() - 11); seriesStart.setDate(1);
  const monthlyRowsP = db.payment.findMany({
    where: {
      receivedAt: { gte: seriesStart },
      receipt: { status: { not: 'void' } },
    },
    select: { receivedAt: true, amountPaise: true },
  });

  // Drilldown: payments for the specific month
  let drillStart, drillEnd;
  if (drillMonth && /^\d{4}-\d{2}$/.test(drillMonth)) {
    const [yy, mm] = drillMonth.split('-').map(Number);
    drillStart = new Date(yy, mm - 1, 1);
    drillEnd = new Date(yy, mm, 1);
  }
  const drillPaymentsP = drillStart
    ? db.payment.findMany({
        where: {
          receivedAt: { gte: drillStart, lt: drillEnd },
          receipt: { status: { not: 'void' } },
        },
        orderBy: { receivedAt: 'desc' },
        include: {
          receipt: {
            include: {
              plan: { include: { member: { select: { id: true, firstName: true, lastName: true, phone: true } } } },
            },
          },
        },
      })
    : Promise.resolve([]);

  const [periodPayments, todayPayments, memberCount, byStatus, byGender, bySkill,
         periodTrials, periodConversions, partialReceipts, monthlyRows, drillPayments] = await Promise.all([
    db.payment.findMany({ where: paymentWhere }),
    db.payment.findMany({ where: { receivedAt: { gte: dayStart, lt: dayEnd }, receipt: { status: { not: 'void' } } } }),
    db.member.count({ where: memberFilter }),
    db.member.groupBy({ by: ['status'], where: memberFilter, _count: { _all: true } }),
    db.member.groupBy({ by: ['gender'], where: memberFilter, _count: { _all: true } }),
    db.member.groupBy({ by: ['skillLevel'], where: memberFilter, _count: { _all: true } }),
    db.trial.count({ where: { scheduledDate: { gte: since } } }),
    db.trial.count({ where: { scheduledDate: { gte: since }, outcome: 'joined' } }),
    db.receipt.findMany({
      where: { status: 'partial' },
      orderBy: [{ nextAgreedDate: 'asc' }, { issueDate: 'asc' }],
      include: {
        payments: { orderBy: { receivedAt: 'desc' } },
        plan: { select: { memberId: true } },
      },
    }),
    monthlyRowsP,
    drillPaymentsP,
  ]);

  const monthlyMap = new Map();
  for (const r of monthlyRows) {
    const d = new Date(r.receivedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const prev = monthlyMap.get(key) || { paise: 0, count: 0 };
    monthlyMap.set(key, { paise: prev.paise + r.amountPaise, count: prev.count + 1 });
  }
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(1); d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthlyMap.get(key) || { paise: 0, count: 0 };
    monthly.push({
      key,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      paise: entry.paise,
      count: entry.count,
      isCurrent: i === 0,
      isDrill: key === drillMonth,
    });
  }
  const peakPaise = monthly.reduce((m, x) => Math.max(m, x.paise), 0) || 1;

  const periodRevenuePaise = periodPayments.reduce((s, p) => s + p.amountPaise, 0);
  const todayRevenuePaise = todayPayments.reduce((s, p) => s + p.amountPaise, 0);
  const conversionRate = periodTrials > 0 ? Math.round((periodConversions / periodTrials) * 100) : 0;
  const outstandingTotalPaise = partialReceipts.reduce((s, r) => {
    const paid = r.payments.reduce((x, p) => x + p.amountPaise, 0);
    return s + (r.totalPaise - paid);
  }, 0);

  const counts = { active: 0, on_freeze: 0, lapsed: 0, left: 0 };
  for (const r of byStatus) counts[r.status] = r._count._all;

  // Bucket each partial receipt: overdue / due-this-week / open. The
  // "due date" is whatever staff agreed with the member as the next
  // payment day. If no date was set, the receipt sits in "open" with
  // an age computed from the original issue date.
  const partialNow = new Date(); partialNow.setHours(0, 0, 0, 0);
  const partialWeek = new Date(partialNow); partialWeek.setDate(partialWeek.getDate() + 7);
  const partialEnriched = partialReceipts.map((r) => {
    const paid = r.payments.reduce((s, p) => s + p.amountPaise, 0);
    const balance = r.totalPaise - paid;
    const lastPmt = r.payments[0]?.receivedAt || null; // ordered desc
    const nextAgreed = r.nextAgreedDate ? new Date(r.nextAgreedDate) : null;
    let bucket = 'open';
    let daysFromDue = null;
    if (nextAgreed) {
      daysFromDue = Math.ceil((nextAgreed - partialNow) / (1000 * 60 * 60 * 24));
      if (nextAgreed < partialNow) bucket = 'overdue';
      else if (nextAgreed < partialWeek) bucket = 'due_week';
      else bucket = 'open';
    }
    const ageDays = Math.floor((partialNow - new Date(r.issueDate)) / (1000 * 60 * 60 * 24));
    return { ...r, paid, balance, lastPaymentAt: lastPmt, bucket, daysFromDue, ageDays };
  });
  const partialBuckets = {
    overdue:  partialEnriched.filter((r) => r.bucket === 'overdue'),
    due_week: partialEnriched.filter((r) => r.bucket === 'due_week'),
    open:     partialEnriched.filter((r) => r.bucket === 'open'),
  };
  const partialBucketTotal = (b) => b.reduce((s, r) => s + r.balance, 0);

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
        <h2 className="ed-section-head">Money in · last 12 months</h2>
        <div className="rep-bars">
          {monthly.map((m) => (
            <Link
              key={m.key}
              href={`?month=${m.key}`}
              scroll={false}
              className={`rep-bar-col ${m.isCurrent ? 'rep-bar-col-now' : ''} ${m.isDrill ? 'rep-bar-col-drill' : ''}`}
            >
              <div className="rep-bar-amt">{m.paise > 0 ? formatRupees(m.paise).replace('₹', '₹').replace(',00', 'k').replace(',000', 'k') : '—'}</div>
              <div className="rep-bar-wrap">
                <div className="rep-bar" style={{ height: `${Math.max((m.paise / peakPaise) * 100, m.paise > 0 ? 4 : 0)}%` }} />
              </div>
              <div className="rep-bar-month">{m.label}</div>
              {m.count > 0 && <div className="rep-bar-count">{m.count} pmt{m.count === 1 ? '' : 's'}</div>}
            </Link>
          ))}
        </div>
        <p className="adm-help" style={{ marginTop: 8 }}>Click any month to see who paid, how much, and what.</p>

        {drillMonth && (
          <div className="rep-drill">
            <div className="rep-drill-head">
              <h3 className="rep-drill-title">{drillMonth} · {drillPayments.length} payment{drillPayments.length === 1 ? '' : 's'} · {formatRupees(drillPayments.reduce((s, p) => s + p.amountPaise, 0))}</h3>
              <Link href="?" className="adm-btn adm-btn-secondary adm-btn-sm">Close ✕</Link>
            </div>
            {drillPayments.length === 0 ? (
              <p className="adm-muted">No payments in this month.</p>
            ) : (
              <table className="prv-table">
                <thead><tr><th>Date</th><th>Member</th><th>Plan</th><th>Method</th><th>Reference</th><th>Amount</th></tr></thead>
                <tbody>
                  {drillPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="prv-muted">{formatDate(p.receivedAt)}</td>
                      <td>{p.receipt.plan?.member ? <Link href={`/admin/members/${p.receipt.plan.member.id}`} className="prv-name">{fullName(p.receipt.plan.member)}</Link> : '—'}</td>
                      <td className="prv-muted">{p.receipt.plan ? `${p.receipt.plan.tier} ${p.receipt.plan.cycle}` : '—'}</td>
                      <td className="prv-muted">{p.method}</td>
                      <td className="adm-mono prv-muted">{p.reference || '—'}</td>
                      <td><strong>{formatRupees(p.amountPaise)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      <div className="ed-rule" />

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
        <h2 className="ed-section-head">Partial collections</h2>
        <p className="ed-paragraph">
          <strong>{formatRupees(outstandingTotalPaise)}</strong> owed across <strong>{partialReceipts.length}</strong> receipt{partialReceipts.length === 1 ? '' : 's'}.
        </p>

        <div className="rep-partial-grid">
          <PartialSwatch
            tone="rust"
            label="Overdue"
            sub={`Past their agreed date`}
            count={partialBuckets.overdue.length}
            total={partialBucketTotal(partialBuckets.overdue)}
          />
          <PartialSwatch
            tone="gold"
            label="Due this week"
            sub={`Next 7 days`}
            count={partialBuckets.due_week.length}
            total={partialBucketTotal(partialBuckets.due_week)}
          />
          <PartialSwatch
            tone="green"
            label="Open"
            sub={`No date set or > 7 days away`}
            count={partialBuckets.open.length}
            total={partialBucketTotal(partialBuckets.open)}
          />
        </div>

        {partialEnriched.length > 0 && (
          <div className="prv-table-wrap" style={{ marginTop: 16 }}>
            <table className="prv-table">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Last payment</th>
                  <th>Next agreed</th>
                </tr>
              </thead>
              <tbody>
                {partialEnriched.map((r) => (
                  <tr key={r.id}>
                    <td><PartialBucketChip bucket={r.bucket} daysFromDue={r.daysFromDue} ageDays={r.ageDays} /></td>
                    <td><Link href={`/admin/receipts/${r.id}`} className="adm-mono prv-name">{r.invoiceNumber}</Link></td>
                    <td>
                      {r.plan?.memberId ? (
                        <Link href={`/admin/members/${r.plan.memberId}`} className="prv-name">{r.customerNameSnapshot}</Link>
                      ) : (
                        r.customerNameSnapshot
                      )}
                      <div className="prv-sub">{r.customerPhoneSnapshot}</div>
                    </td>
                    <td>{formatRupees(r.totalPaise)}</td>
                    <td className="prv-muted">{formatRupees(r.paid)}</td>
                    <td><strong>{formatRupees(r.balance)}</strong></td>
                    <td className="prv-muted">{r.lastPaymentAt ? formatDate(r.lastPaymentAt) : <span className="adm-muted">—</span>}</td>
                    <td className="prv-muted">{r.nextAgreedDate ? formatDate(r.nextAgreedDate) : <span className="adm-muted">no date set</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function PartialSwatch({ tone, label, sub, count, total }) {
  return (
    <div className={`rep-swatch rep-swatch-${tone}`}>
      <p className="rep-swatch-label">{label}</p>
      <p className="rep-swatch-num">{count}</p>
      <p className="rep-swatch-sub">{sub}</p>
      <p className="rep-swatch-total">{count > 0 ? formatRupees(total) : '—'}</p>
    </div>
  );
}

function PartialBucketChip({ bucket, daysFromDue, ageDays }) {
  if (bucket === 'overdue') {
    const d = Math.abs(daysFromDue);
    return <span className="prv-stage prv-stage-rust"><span className="prv-stage-dot" />{d}d overdue</span>;
  }
  if (bucket === 'due_week') {
    return <span className="prv-stage prv-stage-gold"><span className="prv-stage-dot" />{daysFromDue === 0 ? 'today' : `${daysFromDue}d`}</span>;
  }
  return <span className="prv-stage prv-stage-green"><span className="prv-stage-dot" />open · {ageDays}d old</span>;
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
