import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName } from '@/lib/format';
import { PlanForm } from './PlanForm';

export default async function NewPlanPage({ searchParams }) {
  const sp = await searchParams;
  const memberId = sp?.memberId;

  if (!memberId) {
    const recent = await db.member.findMany({
      where: { status: { in: ['active', 'on_freeze', 'lapsed'] } },
      orderBy: { joinedAt: 'desc' },
      take: 50,
    });
    return (
      <>
        <div className="adm-page-header">
          <div>
            <p className="prv-eyebrow"><Link href="/admin/plans" className="prv-back">← Plans</Link></p>
            <h1 className="adm-page-title">New plan</h1>
            <p className="adm-page-subtitle">Pick the member to create a plan for.</p>
          </div>
        </div>
        <div className="prv-table-wrap">
          {recent.length === 0 ? (
            <div className="prv-empty"><p>No members yet.</p></div>
          ) : (
            <table className="prv-table">
              <thead><tr><th>Member</th><th>Phone</th><th>Skill</th><th></th></tr></thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id}>
                    <td>{fullName(m)}</td>
                    <td className="adm-mono">{m.phone}</td>
                    <td className="prv-muted">{m.skillLevel}</td>
                    <td><Link href={`/admin/plans/new?memberId=${m.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Pick →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  const [member, types] = await Promise.all([
    db.member.findUnique({ where: { id: memberId } }),
    db.membershipType.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
  ]);
  if (!member) return <p>Member not found.</p>;
  if (types.length === 0) {
    return <p>No active membership types. <Link href="/admin/settings/memberships/new">Create one →</Link></p>;
  }

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href={`/admin/members/${member.id}`} className="prv-back">← {fullName(member)}</Link></p>
          <h1 className="adm-page-title">New plan</h1>
          <p className="adm-page-subtitle">Pick a membership type, then accept the full price or enter the agreed final amount.</p>
        </div>
      </div>

      <PlanForm member={member} types={types} />
    </>
  );
}
