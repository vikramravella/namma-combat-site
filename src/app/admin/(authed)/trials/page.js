import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';
import { TRIAL_STATUSES, TRIAL_OUTCOMES, stageMeta } from '@/lib/constants';
import { SortChips, sortToOrderBy } from '@/components/SortChips';
import { ChipLink } from '@/components/ChipLink';

export const revalidate = 10;
const STATUS_KEYS = TRIAL_STATUSES.map((s) => s.key);

export default async function TrialsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status && STATUS_KEYS.includes(sp.status) ? sp.status : '';
  const when = sp?.when || ''; // 'today' | 'week'

  const where = { convertedMemberId: null };
  if (status) where.status = status;
  if (when === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(24, 0, 0, 0);
    where.scheduledDate = { gte: start, lt: end };
  } else if (when === 'week') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setDate(end.getDate() + 7); end.setHours(0, 0, 0, 0);
    where.scheduledDate = { gte: start, lt: end };
  }

  const baseFilter = { convertedMemberId: null };

  let rows = [], allCount = 0, byStatus = [];
  let debugError = null;
  try {
    [rows, allCount, byStatus] = await Promise.all([
      db.trial.findMany({
        where,
        orderBy: sortToOrderBy(sp?.sort),
        take: 200,
        include: { inquiry: true, coach: true, healthDecl: true },
      }),
      db.trial.count({ where: baseFilter }),
      db.trial.groupBy({ by: ['status'], _count: { _all: true }, where: baseFilter }),
    ]);
  } catch (err) {
    debugError = { message: err?.message || String(err), code: err?.code, stack: (err?.stack || '').split('\n').slice(0, 8).join('\n') };
    console.error('[trials/page] Prisma query failed:', err);
  }
  if (debugError) {
    return (
      <div className="adm-card" style={{ background: '#fff5f5', border: '1px solid #c00', padding: 16 }}>
        <h2 className="adm-card-title">Trials query failed</h2>
        <p><strong>Message:</strong> {debugError.message}</p>
        <p><strong>Code:</strong> {debugError.code || '(none)'}</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#fafafa', padding: 8, borderRadius: 4 }}>{debugError.stack}</pre>
      </div>
    );
  }

  const counts = { '': allCount };
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Trials</h1>
          <p className="adm-page-subtitle">
            {rows.length === allCount ? `${allCount} ${allCount === 1 ? 'trial' : 'trials'}` : `${rows.length} of ${allCount} matching`}
          </p>
        </div>
        <div className="prv-action-row">
          <Link href="/admin/trials/new" className="adm-btn">+ Schedule trial</Link>
        </div>
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!status && !when} label="All" count={counts['']} />
        <ChipLink href="?when=today" on={when === 'today'} label="Today" count={undefined} />
        <ChipLink href="?when=week" on={when === 'week'} label="This week" count={undefined} />
        {TRIAL_STATUSES.map((s) => (
          <ChipLink key={s.key} href={`?status=${s.key}`} on={status === s.key} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>
      <SortChips sort={sp?.sort || 'modified'} sp={sp} />

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty"><p>No trials match.</p></div>
        ) : (
          <table className="prv-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>When</th>
                <th>Class</th>
                <th>Coach</th>
                <th>Status</th>
                <th>Outcome</th>
                <th>Health form</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/trials/${t.id}`} className="prv-name">{fullName(t.inquiry)}</Link>
                    <div className="prv-sub">{t.inquiry.phone}</div>
                  </td>
                  <td>
                    <div>{formatDate(t.scheduledDate)} <span className="adm-mono">{t.scheduledTime}</span></div>
                    <div className="prv-sub">{t.day}</div>
                  </td>
                  <td>{t.discipline} <span className="adm-muted">· {t.area}</span></td>
                  <td className="prv-muted">{t.coach?.name || '—'}</td>
                  <td><StatusChip kind="status" value={t.status} /></td>
                  <td>{t.outcome ? <StatusChip kind="outcome" value={t.outcome} /> : <span className="adm-muted">—</span>}</td>
                  <td className="prv-muted">{t.healthDecl ? '✓ Submitted' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StatusChip({ kind, value }) {
  const list = kind === 'status' ? TRIAL_STATUSES : TRIAL_OUTCOMES;
  const meta = stageMeta(list, value);
  return (
    <span className={`prv-stage prv-stage-${meta.tone}`}>
      <span className="prv-stage-dot" />
      {meta.label}
    </span>
  );
}
