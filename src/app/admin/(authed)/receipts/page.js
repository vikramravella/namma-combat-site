import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate, formatRupees } from '@/lib/format';
import { RECEIPT_STATUSES, stageMeta } from '@/lib/constants';
import { FyFilter } from './FyFilter';

export const revalidate = 10;
const STATUS_KEYS = RECEIPT_STATUSES.map((s) => s.key);

export default async function ReceiptsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status && STATUS_KEYS.includes(sp.status) ? sp.status : '';
  const fy = sp?.fy || '';

  const where = {};
  if (status) where.status = status;
  if (fy) where.fiscalYear = fy;

  const [rows, allCount, byStatus, fys] = await Promise.all([
    db.receipt.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      take: 200,
      include: { payments: true },
    }),
    db.receipt.count(),
    db.receipt.groupBy({ by: ['status'], _count: { _all: true } }),
    db.receipt.findMany({ select: { fiscalYear: true }, distinct: ['fiscalYear'], orderBy: { fiscalYear: 'desc' } }),
  ]);

  const counts = { '': allCount };
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Receipts</h1>
          <p className="adm-page-subtitle">{rows.length === allCount ? `${allCount} ${allCount === 1 ? 'receipt' : 'receipts'}` : `${rows.length} of ${allCount} matching`}</p>
        </div>
      </div>

      <div className="prv-toolbar">
        {fys.length > 0 && (
          <FyFilter currentFy={fy} status={status} fys={fys} />
        )}
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!status} label="All" count={counts['']} />
        {RECEIPT_STATUSES.map((s) => (
          <ChipLink key={s.key} href={`?status=${s.key}`} on={status === s.key} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty"><p>No receipts yet.</p></div>
        ) : (
          <table className="prv-table">
            <thead><tr><th>Number</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const paid = r.payments.reduce((s, p) => s + p.amountPaise, 0);
                return (
                  <tr key={r.id}>
                    <td><Link href={`/admin/receipts/${r.id}`} className="prv-name adm-mono">{r.invoiceNumber}</Link></td>
                    <td className="prv-muted">{formatDate(r.issueDate)}</td>
                    <td>{r.customerNameSnapshot}<div className="prv-sub">{r.customerPhoneSnapshot}</div></td>
                    <td>{formatRupees(r.totalPaise)}</td>
                    <td>{formatRupees(paid)}{r.status === 'partial' && <div className="prv-sub">balance {formatRupees(r.totalPaise - paid)}</div>}</td>
                    <td><StatusChip value={r.status} /></td>
                  </tr>
                );
              })}
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
  const meta = stageMeta(RECEIPT_STATUSES, value);
  return <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>;
}
