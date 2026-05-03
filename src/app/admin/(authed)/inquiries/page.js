import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatRelative, formatDate } from '@/lib/format';
import { INQUIRY_STAGES, SOURCES, stageMeta } from '@/lib/constants';
import { Filters } from './Filters';

export const revalidate = 10;
const STAGE_KEYS = INQUIRY_STAGES.map((s) => s.key);

export default async function InquiriesPage({ searchParams }) {
  const sp = await searchParams;
  const stage = sp?.stage && STAGE_KEYS.includes(sp.stage) ? sp.stage : '';
  const source = sp?.source && SOURCES.find((s) => s.key === sp.source) ? sp.source : '';
  const queue = sp?.queue || ''; // 'due' for follow-ups due today
  const q = (sp?.q || '').trim();
  const where = {
    convertedMemberId: null,
    trials: { none: {} },
  };
  if (stage) where.stage = stage;
  if (source) where.source = source;
  if (queue === 'due') {
    where.nextFollowUpAt = { lte: new Date() };
    where.stage = { in: ['new', 'following_up'] };
  }
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const baseFilter = { convertedMemberId: null, trials: { none: {} } };

  const [rows, allCount, byStage, dueCount] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: queue === 'due'
        ? [{ nextFollowUpAt: 'asc' }]
        : [{ createdAt: 'desc' }],
      take: 200,
    }),
    db.inquiry.count({ where: baseFilter }),
    db.inquiry.groupBy({ by: ['stage'], _count: { _all: true }, where: baseFilter }),
    db.inquiry.count({
      where: {
        ...baseFilter,
        nextFollowUpAt: { lte: new Date() },
        stage: { in: ['new', 'following_up'] },
      },
    }),
  ]);

  const counts = { '': allCount, _due: dueCount };
  for (const r of byStage) counts[r.stage] = r._count._all;

  return (
    <>
      <MarkSeenOnMount />
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Inquiries</h1>
          <p className="adm-page-subtitle">
            {rows.length === allCount
              ? `${allCount} ${allCount === 1 ? 'inquiry' : 'inquiries'}`
              : `${rows.length} of ${allCount} matching`}
            {dueCount > 0 && (
              <>
                <span className="prv-divider">·</span>
                <Link href="/admin/inquiries?queue=due" className="inq-due-link">
                  {dueCount} follow-up{dueCount === 1 ? '' : 's'} due
                </Link>
              </>
            )}
          </p>
        </div>
        <Link href="/admin/inquiries/new" className="adm-btn">+ New inquiry</Link>
      </div>

      <Filters counts={counts} />

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty">
            <p>{allCount === 0 ? 'No inquiries yet.' : 'No inquiries match these filters.'}</p>
            {allCount === 0 && <Link href="/admin/inquiries/new" className="adm-btn">Add the first one</Link>}
          </div>
        ) : (
          <table className="prv-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Stage</th>
                <th>Interested in</th>
                <th>Goal</th>
                <th>Source</th>
                <th>Last touch</th>
                <th>Next follow-up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isDue = r.nextFollowUpAt && new Date(r.nextFollowUpAt) <= new Date() && ['new', 'following_up'].includes(r.stage);
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/inquiries/${r.id}`} className="prv-name">{fullName(r)}</Link>
                      <div className="prv-sub">{r.phone}</div>
                    </td>
                    <td><StageChip stage={r.stage} /></td>
                    <td>{Array.isArray(r.interestedIn) && r.interestedIn.length > 0 ? r.interestedIn.join(', ') : <span className="adm-muted">—</span>}</td>
                    <td className="prv-muted">{r.primaryGoal || '—'}</td>
                    <td className="prv-muted">{r.source ? formatSource(r.source) : '—'}</td>
                    <td className="prv-muted">{r.lastContactedAt ? formatRelative(r.lastContactedAt) : '—'}</td>
                    <td className={isDue ? 'inq-due-cell' : 'prv-muted'}>
                      {r.nextFollowUpAt ? formatDate(r.nextFollowUpAt) : '—'}
                    </td>
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

function StageChip({ stage }) {
  const meta = stageMeta(INQUIRY_STAGES, stage);
  return (
    <span className={`prv-stage prv-stage-${meta.tone}`}>
      <span className="prv-stage-dot" />
      {meta.label}
    </span>
  );
}

function formatSource(s) {
  return SOURCES.find((x) => x.key === s)?.label || s;
}
