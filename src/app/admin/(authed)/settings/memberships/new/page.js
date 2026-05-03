import Link from 'next/link';
import { MembershipTypeForm } from '../MembershipTypeForm';
import { createMembershipType } from '../actions';

export default function NewMembershipTypePage() {
  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/settings/memberships" className="prv-back">← Membership types</Link></p>
          <h1 className="adm-page-title">New membership type</h1>
        </div>
      </div>
      <MembershipTypeForm action={createMembershipType} mode="create" />
    </>
  );
}
