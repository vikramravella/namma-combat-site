import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRupees } from '@/lib/format';
import { PLAN_STATUSES, TIERS, stageMeta } from '@/lib/constants';

const STATUS_KEYS = PLAN_STATUSES.map((s) => s.key);

export default async function PlansPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status && STATUS_KEYS.includes(sp.status) ? sp.status : '';
  const tier = sp?.tier && TIERS.find((t) => t.key === sp.tier) ? sp.tier : '';

  const where = {};
  if (status) where.status = status;
  if (tier) where.tier = tier;

  const [rows, allCount, byStatus] = await Promise.all([
    db.plan.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: 200,
      include: { member: true, receipt: true },
    }),
    db.plan.count(),
    db.plan.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const counts = { '': allCount };
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Plans</h1>
          <p className="adm-page-subtitle">{rows.length === allCount ? `${allCount} plan${allCount === 1 ? '' : 's'}` : `${rows.length} of ${allCount} matching`}</p>
        </div>
        <Link href="/admin/plans/new" className="adm-btn">+ New plan</Link>
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!status && !tier} label="All" count={counts['']} />
        {PLAN_STATUSES.map((s) => (
          <ChipLink key={s.key} href={`?status=${s.key}`} on={status === s.key} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty"><p>No plans yet.</p></div>
        ) : (
          <table className="prv-table">
            <thead><tr><th>Member</th><th>Plan</th><th>Period</th><th>Status</th><th>Amount</th><th>Receipt</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/members/${p.memberId}`} className="prv-name">{fullName(p.member)}</Link><div className="prv-sub">{p.member.phone}</div></td>
                  <td><Link href={`/admin/plans/${p.id}`}>{p.tier} {p.cycle}</Link></td>
                  <td>{formatDate(p.startDate)} → {formatDate(p.endDate)}</td>
                  <td><StatusChip value={p.status} /></td>
                  <td>{p.receipt ? formatRupees(p.receipt.totalPaise) : <span className="adm-muted">—</span>}</td>
                  <td>{p.receipt ? <Link href={`/admin/receipts/${p.receipt.id}`}>{p.receipt.invoiceNumber}</Link> : <span className="adm-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function ChipLink({ href, on, label, count }) {
  return (
    <Link href={href} className={`prv-chip ${on ? 'prv-chip-on' : ''}`} scroll={false}>
      <span>{label}</span>
      <span className="prv-chip-count">{count}</span>
    </Link>
  );
}

function StatusChip({ value }) {
  const meta = stageMeta(PLAN_STATUSES, value);
  return <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>;
}
