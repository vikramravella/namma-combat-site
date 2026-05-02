import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRupees } from '@/lib/format';
import { MEMBER_STATUSES, SKILL_LEVELS, stageMeta } from '@/lib/constants';

export const revalidate = 10;
const STATUS_KEYS = MEMBER_STATUSES.map((s) => s.key);
const SKILL_KEYS = SKILL_LEVELS.map((s) => s.key);

export default async function MembersPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status && STATUS_KEYS.includes(sp.status) ? sp.status : '';
  const skill = sp?.skill && SKILL_KEYS.includes(sp.skill) ? sp.skill : '';
  const q = (sp?.q || '').trim();

  const where = {};
  if (status) where.status = status;
  if (skill) where.skillLevel = skill;
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const [rows, allCount, byStatus] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { plans: { where: { status: { in: ['running', 'on_freeze'] } }, take: 1, orderBy: { endDate: 'desc' } } },
    }),
    db.member.count(),
    db.member.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const counts = { '': allCount };
  for (const r of byStatus) counts[r.status] = r._count._all;

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Members</h1>
          <p className="adm-page-subtitle">{rows.length === allCount ? `${allCount} ${allCount === 1 ? 'member' : 'members'}` : `${rows.length} of ${allCount} matching`}</p>
        </div>
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!status && !skill} label="All" count={counts['']} />
        {MEMBER_STATUSES.map((s) => (
          <ChipLink key={s.key} href={`?status=${s.key}`} on={status === s.key} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>

      <div className="prv-table-wrap">
        {rows.length === 0 ? (
          <div className="prv-empty"><p>{allCount === 0 ? 'No members yet — they appear after a trial converts.' : 'No members match these filters.'}</p></div>
        ) : (
          <table className="prv-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Skill</th>
                <th>Disciplines</th>
                <th>Current plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const cur = m.plans[0];
                return (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/admin/members/${m.id}`} className="prv-name">{fullName(m)}</Link>
                      <div className="prv-sub">{m.phone}</div>
                    </td>
                    <td><StatusChip value={m.status} /></td>
                    <td className="prv-muted">{m.skillLevel}</td>
                    <td className="prv-muted">{m.disciplines || m.primaryDiscipline || '—'}</td>
                    <td>{cur ? `${cur.tier} ${cur.cycle}` : <span className="adm-muted">—</span>}{cur && <div className="prv-sub">till {formatDate(cur.endDate)}</div>}</td>
                    <td className="prv-muted">{formatDate(m.joinedAt)}</td>
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
      {count !== undefined && <span className="prv-chip-count">{count}</span>}
    </Link>
  );
}

function StatusChip({ value }) {
  const meta = stageMeta(MEMBER_STATUSES, value);
  return <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>;
}
