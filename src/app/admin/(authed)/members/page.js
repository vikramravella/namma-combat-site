import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRupees } from '@/lib/format';
import { MEMBER_STATUSES, SKILL_LEVELS, TIERS, CYCLES, stageMeta } from '@/lib/constants';
import { SortChips, sortToOrderBy } from '@/components/SortChips';
import { ChipLink } from '@/components/ChipLink';

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

  const expiring = sp?.expiring === '1';
  const noMembership = sp?.no_membership === '1';

  const planFilter = (tier || cycle) ? {
    some: {
      status: { in: ['active', 'on_freeze'] },
      ...(tier ? { tier } : {}),
      ...(cycle ? { cycle } : {}),
    },
  } : null;

  const where = {};
  if (status) where.status = status;
  if (skill) where.skillLevel = skill;
  if (planFilter) where.plans = planFilter;
  if (expiring) {
    const now = new Date();
    const in14 = new Date(); in14.setDate(in14.getDate() + 14);
    where.plans = {
      some: { status: { in: ['active', 'on_freeze'] }, endDate: { gte: now, lte: in14 } },
    };
  }
  if (noMembership) {
    // Members who have NEVER had a plan attached to them (lapsed members
    // still have the historical plan rows, so they're excluded from this
    // filter). Useful for one-off cleanup of test/orphan member rows.
    where.plans = { none: {} };
  }
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  // Count of members whose current active plan ends within 14 days
  const _now = new Date();
  const _in14 = new Date(); _in14.setDate(_in14.getDate() + 14);
  const expiringCount = await db.member.count({
    where: { plans: { some: { status: { in: ['active', 'on_freeze'] }, endDate: { gte: _now, lte: _in14 } } } },
  });

  const [rows, allCount] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: sortToOrderBy(sp?.sort),
      take: 200,
      include: { plans: { where: { status: { in: ['active', 'on_freeze'] } }, take: 1, orderBy: { endDate: 'desc' } } },
    }),
    db.member.count(),
  ]);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Members</h1>
          <p className="adm-page-subtitle">{rows.length === allCount ? `${allCount} ${allCount === 1 ? 'member' : 'members'}` : `${rows.length} of ${allCount} matching`}</p>
        </div>
      </div>

      <div className="prv-chips">
        <ChipLink href="?" on={!noMembership && !expiring} label="All" count={allCount} />
        <ChipLink href="?no_membership=1" on={noMembership} label="No membership" />
      </div>

      <SortChips sort={sp?.sort || 'modified'} sp={sp} />
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
                <th>Current membership</th>
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

function StatusChip({ value }) {
  const meta = stageMeta(MEMBER_STATUSES, value);
  return <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>;
}
