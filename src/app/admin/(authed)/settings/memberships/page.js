import Link from 'next/link';
import { db } from '@/lib/db';

export const revalidate = 10;

export default async function MembershipTypesPage({ searchParams }) {
  const sp = await searchParams;
  const justCreated = sp?.created;
  const rows = await db.membershipType.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Membership types</h1>
          <p className="adm-page-subtitle">{rows.length} {rows.length === 1 ? 'type' : 'types'}. These appear in the add-membership dropdown.</p>
        </div>
        <Link href="/admin/settings/memberships/new" className="adm-btn">+ New membership type</Link>
      </div>

      {justCreated && <p className="adm-success" style={{ marginBottom: 16 }}>Created &ldquo;{justCreated}&rdquo;.</p>}

      <div className="prv-table-wrap">
        <table className="prv-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Tier</th>
              <th>Cycle</th>
              <th>Days</th>
              <th>Freeze</th>
              <th>Price (pre-GST)</th>
              <th>Floor access</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/settings/memberships/${r.id}`} className="prv-name">{r.name}</Link></td>
                <td>{r.tier}</td>
                <td>{r.cycle}</td>
                <td className="prv-muted">{r.durationDays}</td>
                <td className="prv-muted">{r.freezeDaysAllowed}d</td>
                <td className="adm-mono">₹{r.basePriceRupees.toLocaleString('en-IN')}</td>
                <td className="prv-muted">{r.floorAccess || '—'}</td>
                <td>{r.active ? <span className="prv-stage prv-stage-green"><span className="prv-stage-dot" />Active</span> : <span className="prv-stage prv-stage-gray"><span className="prv-stage-dot" />Inactive</span>}</td>
                <td><Link href={`/admin/settings/memberships/${r.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
