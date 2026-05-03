import Link from 'next/link';
import { db } from '@/lib/db';

export const revalidate = 30;

export default async function SettingsHubPage() {
  const [typeCount, slotCount] = await Promise.all([
    db.membershipType.count({ where: { active: true } }),
    db.assessmentSlot.count({ where: { active: true } }),
  ]);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-subtitle">Configuration that rarely changes — pricing, slot times, etc.</p>
        </div>
      </div>

      <div className="prv-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        <SettingsCard
          title="Membership types"
          subtitle={`${typeCount} active`}
          description="Tier + cycle + price catalog used by the plan-creation flow."
          href="/admin/settings/memberships"
        />
        <SettingsCard
          title="Assessment slots"
          subtitle={`${slotCount} active`}
          description="Recurring weekly slots Naeem holds for posture assessments."
          href="/admin/settings/assessment-slots"
        />
      </div>
    </>
  );
}

function SettingsCard({ title, subtitle, description, href }) {
  return (
    <Link href={href} className="adm-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <h2 className="adm-card-title" style={{ marginBottom: 4 }}>{title}</h2>
      <p className="adm-muted" style={{ fontSize: 12, margin: 0 }}>{subtitle}</p>
      <p style={{ marginTop: 12, marginBottom: 0, fontSize: 14 }}>{description}</p>
    </Link>
  );
}
