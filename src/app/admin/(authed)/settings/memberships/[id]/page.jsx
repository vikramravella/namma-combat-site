import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { MembershipTypeForm } from '../MembershipTypeForm';
import { updateMembershipType } from '../actions';

export default async function EditMembershipTypePage({ params }) {
  const { id } = await params;
  const row = await db.membershipType.findUnique({ where: { id } });
  if (!row) notFound();

  const usageCount = await db.plan.count({ where: { tier: row.tier, cycle: row.cycle } });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/settings/memberships" className="prv-back">← Membership types</Link></p>
          <h1 className="adm-page-title">{row.name}</h1>
          <p className="adm-page-subtitle">{usageCount} plan{usageCount === 1 ? '' : 's'} sold under this tier+cycle. Editing changes future sales only — historical plans keep their original snapshot.</p>
        </div>
      </div>
      <MembershipTypeForm row={row} action={updateMembershipType} mode="edit" />
    </>
  );
}
