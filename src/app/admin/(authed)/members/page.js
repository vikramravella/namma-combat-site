import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRupees } from '@/lib/format';
import { MEMBER_STATUSES, SKILL_LEVELS, TIERS, CYCLES, stageMeta } from '@/lib/constants';

export const revalidate = 10;
const STATUS_KEYS = MEMBER_STATUSES.map((s) => s.key);
const SKILL_KEYS = SKILL_LEVELS.map((s) => s.key);
const TIER_KEYS = TIERS.map((t) => t.key);
const CYCLE_KEYS = CYCLES.map((c) => c.key);

export default async function MembersPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status && STATUS_KEYS.includes(sp.status) ? sp.status : '';
  const skill = sp?.skill && SKILL_KEYS.includes(sp.skill) ? sp.skill : '';
  const tier = sp?.tier && TIER_KEYS.includes(sp.tier) ? sp.tier : '';
  const cycle = sp?.cycle && CYCLE_KEYS.includes(sp.cycle) ? sp.cycle : '';
  const q = (sp?.q || '').trim();

  const planFilter = (tier || cycle) ? {
    some: {
      status: { in: ['running', 'on_freeze'] },
      ...(tier ? { tier } : {}),
      ...(cycle ? { cycle } : {}),
    },
  } : null;

  const where = {};
  if (status) where.status = status;
  if (skill) where.skillLevel = skill;
  if (planFilter) where.plans = planFilter;
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  // Counts by tier and cycle: groupBy on Plan with current-plan filter
  const [rows, allCount, byStatus, planTierCounts, planCycleCounts] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { plans: { where: { status: { in: ['running', 'on_freeze'] } }, take: 1, orderBy: { endDate: 'desc' } } },
    }),
    db.member.count(),
    db.member.groupBy({ by: ['status'], _count: { _all: true } }),
    db.plan.groupBy({ by: ['tier'], where: { status: { in: ['running', 'on_freeze'] } }, _count: { _all: true } }),
    db.plan.groupBy({ by: ['cycle'], where: { status: { in: ['running', 'on_freeze'] } }, _count: { _all: true } }),
  ]);

  const counts = { '': allCount };
  for (const r of byStatus) counts[r.status] = r._count._all;
  const tierCounts = {};
  for (const r of planTierCounts) tierCounts[r.tier] = r._count._all;
  const cycleCounts = {};
  for (const r of planCycleCounts) cycleCounts[r.cycle] = r._count._all;
  const totalActivePlans = Object.values(tierCounts).reduce((s, n) => s + n, 0);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Members</h1>
          <p className="adm-page-subtitle">{rows.length === allCount ? `${allCount} ${allCount === 1 ? 'member' : 'members'}` : `${rows.length} of ${allCount} matching`}</p>
        </div>
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!status && !skill && !tier && !cycle} label="All" count={counts['']} />
        {MEMBER_STATUSES.map((s) => (
          <ChipLink key={s.key} href={hrefFor(sp, { status: s.key, tier: '', cycle: '' })} on={status === s.key} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>

      <div className="prv-chips" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Plan tier:</span>
        <ChipLink href={hrefFor(sp, { tier: '' })} on={!tier} label="Any" count={totalActivePlans} />
        {TIERS.map((t) => (
          <ChipLink key={t.key} href={hrefFor(sp, { tier: t.key })} on={tier === t.key} label={t.label} count={tierCounts[t.key] ?? 0} />
        ))}
      </div>

      <div className="prv-chips" style={{ marginTop: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Cycle:</span>
        <ChipLink href={hrefFor(sp, { cycle: '' })} on={!cycle} label="Any" count={totalActivePlans} />
        {CYCLES.map((c) => (
          <ChipLink key={c.key} href={hrefFor(sp, { cycle: c.key })} on={cycle === c.key} label={c.label} count={cycleCounts[c.key] ?? 0} />
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

function hrefFor(sp, overrides) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (v && typeof v === 'string') next.set(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v) next.set(k, v); else next.delete(k);
  }
  const s = next.toString();
  return s ? `?${s}` : '?';
}
