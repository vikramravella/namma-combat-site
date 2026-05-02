import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRupees } from '@/lib/format';
import { PLAN_STATUSES, stageMeta } from '@/lib/constants';
import { FreezeControls } from './FreezeControls';

export default async function PlanDetailPage({ params }) {
  const { id } = await params;
  const plan = await db.plan.findUnique({
    where: { id },
    include: { member: true, receipt: { include: { payments: true } } },
  });
  if (!plan) notFound();
  const status = stageMeta(PLAN_STATUSES, plan.status);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/plans" className="prv-back">← Plans</Link></p>
          <h1 className="adm-page-title">{plan.tier} {plan.cycle}</h1>
          <p className="adm-page-subtitle">
            <span className={`prv-stage prv-stage-${status.tone}`}><span className="prv-stage-dot" />{status.label}</span>
            <span className="prv-divider">·</span>
            <Link href={`/admin/members/${plan.memberId}`}>{fullName(plan.member)}</Link>
            <span className="prv-divider">·</span>
            <span>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</span>
          </p>
        </div>
        <div className="prv-action-row">
          {plan.receipt && <Link href={`/admin/receipts/${plan.receipt.id}`} className="adm-btn">→ Receipt {plan.receipt.invoiceNumber}</Link>}
        </div>
      </div>

      <div className="prv-summary-grid">
        <SummaryStat label="Total" value={formatRupees(plan.agreedFinalPaise)} sub={plan.basePricePaise !== plan.agreedFinalPaise / 1.05 * 100 ? `Catalog ${formatRupees(plan.basePricePaise)}` : null} />
        <SummaryStat label="Duration" value={`${plan.durationDays} days`} sub={plan.bonusDays > 0 ? `+${plan.bonusDays} bonus` : null} />
        <SummaryStat label="Freeze used" value={`${plan.freezeDaysUsed} / ${plan.freezeDaysAllowed}`} sub={`${plan.freezeDaysAllowed - plan.freezeDaysUsed} days remaining`} />
        <SummaryStat label="End date" value={formatDate(plan.endDate)} />
      </div>

      <div className="prv-detail-grid">
        <div className="prv-detail-main">
          <div className="adm-card">
            <h2 className="adm-card-title">Freeze</h2>
            <FreezeControls plan={plan} />
          </div>

          {plan.notes && (
            <div className="adm-card">
              <h2 className="adm-card-title">Notes</h2>
              <p className="prv-notes">{plan.notes}</p>
            </div>
          )}
        </div>
        <aside className="prv-detail-side">
          <div className="adm-card">
            <h2 className="adm-card-title">Receipt</h2>
            {plan.receipt ? (
              <dl className="prv-defs">
                <DefRow label="Number" value={<Link href={`/admin/receipts/${plan.receipt.id}`}><span className="adm-mono">{plan.receipt.invoiceNumber}</span></Link>} />
                <DefRow label="Status" value={plan.receipt.status} />
                <DefRow label="Total" value={formatRupees(plan.receipt.totalPaise)} />
              </dl>
            ) : <p className="adm-muted">No receipt linked.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}

function SummaryStat({ label, value, sub }) {
  return (
    <div className="prv-summary">
      <div className="prv-summary-label">{label}</div>
      <div className="prv-summary-value">{value}</div>
      {sub && <div className="prv-summary-sub">{sub}</div>}
    </div>
  );
}

function DefRow({ label, value }) {
  return (
    <div className="prv-def-row">
      <dt>{label}</dt>
      <dd>{value || <span className="adm-muted">—</span>}</dd>
    </div>
  );
}
