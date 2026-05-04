import Link from 'next/link';
import { db } from '@/lib/db';
import { QuickAddForm } from './QuickAddForm';

export const dynamic = 'force-dynamic';

export default async function QuickAddPage() {
  const types = await db.membershipType.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/members" className="prv-back">← Members</Link></p>
          <h1 className="adm-page-title">Quick add — backdated entry</h1>
          <p className="adm-page-subtitle">
            Creates Member + Membership + Receipt + Payment in one go. Use for old paper entries
            that didn&rsquo;t go through the inquiry → trial → convert flow.
          </p>
        </div>
      </div>
      <QuickAddForm types={types} />
    </>
  );
}
