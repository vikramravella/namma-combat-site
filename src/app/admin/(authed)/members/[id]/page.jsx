import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative, formatRupees } from '@/lib/format';
import { MEMBER_STATUSES, SKILL_LEVELS, PLAN_STATUSES, stageMeta } from '@/lib/constants';
import { MemberForm } from '../MemberForm';
import { updateMember, deleteMember } from '../actions';
import { SkillLevelEditor } from './SkillLevelEditor';
import { BookAssessment } from './BookAssessment';

export default async function MemberDetailPage({ params }) {
  const { id } = await params;
  const [member, slots, upcomingBookings] = await Promise.all([
    db.member.findUnique({
      where: { id },
      include: {
        plans: {
          include: { receipt: { include: { payments: true } } },
          orderBy: { startDate: 'desc' },
        },
        assessments: { orderBy: { assessedAt: 'desc' }, include: { coach: true } },
        fromInquiry: { include: { events: true } },
        fromTrial: { include: { coach: true } },
      },
    }),
    db.assessmentSlot.findMany({ where: { active: true }, orderBy: [{ dayOfWeek: 'asc' }, { timeOfDay: 'asc' }] }),
    db.assessmentBooking.findMany({
      where: { memberId: id, status: 'booked', scheduledDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { slot: true },
      orderBy: { scheduledDate: 'asc' },
    }),
  ]);
  if (!member) notFound();

  const status = stageMeta(MEMBER_STATUSES, member.status);
  const skill = stageMeta(SKILL_LEVELS, member.skillLevel);
  const currentPlan = member.plans.find((p) => ['active', 'on_freeze'].includes(p.status));
  const lastAssess = member.assessments[0];

  // Lifetime money
  const ltvPaise = member.plans.reduce((s, p) => {
    if (!p.receipt) return s;
    const paid = p.receipt.payments.reduce((x, y) => x + y.amountPaise, 0);
    return s + paid;
  }, 0);

  // Build the unified journey timeline
  const events = [];
  if (member.fromInquiry) {
    const interestedLabel = Array.isArray(member.fromInquiry.interestedIn) && member.fromInquiry.interestedIn.length > 0 ? member.fromInquiry.interestedIn.join(', ') : '—';
    events.push({ when: member.fromInquiry.createdAt, type: 'inquiry', label: 'Inquiry created', detail: `Source: ${member.fromInquiry.source || '—'} · Interested in ${interestedLabel}` });
    for (const e of member.fromInquiry.events) {
      events.push({ when: e.createdAt, type: e.type, label: e.label, detail: e.detail });
    }
  }
  if (member.fromTrial) {
    events.push({ when: member.fromTrial.scheduledDate, type: 'trial', label: `Trial — ${member.fromTrial.discipline}`, detail: `${member.fromTrial.day} ${member.fromTrial.scheduledTime}${member.fromTrial.coach ? ' · ' + member.fromTrial.coach.name : ''}${member.fromTrial.outcome ? ' → ' + member.fromTrial.outcome : ''}` });
  }
  events.push({ when: member.joinedAt, type: 'convert', label: 'Joined as member', detail: null });
  for (const p of member.plans) {
    events.push({ when: p.startDate, type: 'plan', label: `Membership — ${p.tier} ${p.cycle}`, detail: `${formatDate(p.startDate)} → ${formatDate(p.endDate)}${p.receipt ? ' · ' + formatRupees(p.receipt.totalPaise) : ''}` });
  }
  for (const a of member.assessments) {
    events.push({ when: a.assessedAt, type: 'assess', label: `Assessment${a.coach ? ' — ' + a.coach.name : ''}`, detail: a.priorityFocus });
  }
  events.sort((a, b) => new Date(b.when) - new Date(a.when));

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/members" className="prv-back">← Members</Link></p>
          <h1 className="adm-page-title">{fullName(member)}</h1>
          <p className="adm-page-subtitle">
            <span className={`prv-stage prv-stage-${status.tone}`}><span className="prv-stage-dot" />{status.label}</span>
            <span className="prv-divider">·</span>
            <SkillLevelEditor memberId={member.id} current={member.skillLevel} />
            <span className="prv-divider">·</span>
            <span>Joined {formatDate(member.joinedAt)}</span>
            <span className="prv-divider">·</span>
            <span className="adm-mono">{member.phone}</span>
          </p>
        </div>
        <div className="prv-action-row">
          <a href={`https://wa.me/91${member.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">Open WhatsApp</a>
          <Link href={`/admin/plans/new?memberId=${member.id}`} className="adm-btn">+ Add membership</Link>
        </div>
      </div>

      {currentPlan && (() => {
        const daysLeft = Math.ceil((new Date(currentPlan.endDate) - new Date()) / 86400000);
        if (daysLeft < 0 || daysLeft > 14) return null;
        return (
          <div className="adm-card" style={{ marginBottom: 16, borderLeft: '4px solid var(--gold, #C99419)', background: 'rgba(201,148,25,0.06)' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span>
                <strong>Renewal due in {daysLeft} day{daysLeft === 1 ? '' : 's'}.</strong>{' '}
                Current membership ({currentPlan.tier} {currentPlan.cycle}) ends {formatDate(currentPlan.endDate)}.
              </span>
              <Link href={`/admin/plans/new?memberId=${member.id}`} className="adm-btn">+ Renew membership</Link>
            </p>
          </div>
        );
      })()}

      <div className="prv-summary-grid">
        <SummaryStat label="Current membership" value={currentPlan ? `${currentPlan.tier} · ${currentPlan.cycle}` : 'None'} sub={currentPlan ? `Until ${formatDate(currentPlan.endDate)}` : null} />
        <AssessmentTile memberId={member.id} lastAssess={lastAssess} upcomingBookings={upcomingBookings} slots={slots} />
        <SummaryStat label="Disciplines" value={member.disciplines || member.primaryDiscipline || '—'} />
        <SummaryStat label="Lifetime value" value={formatRupees(ltvPaise)} sub={`${member.plans.length} membership${member.plans.length === 1 ? '' : 's'}`} />
      </div>

      <div className="prv-detail-grid">
        <div className="prv-detail-main">
          <div className="adm-card">
            <h2 className="adm-card-title">Full journey</h2>
            <ol className="prv-timeline">
              {events.map((e, i) => (
                <li key={i} className={`prv-event prv-event-${e.type}`}>
                  <div className="prv-event-marker" aria-hidden />
                  <div className="prv-event-body">
                    <div className="prv-event-head">
                      <span className="prv-event-label">{e.label}</span>
                      <span className="prv-event-time">{formatDate(e.when)}</span>
                    </div>
                    {e.detail && <p className="prv-event-detail">{e.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h2 className="adm-card-title" style={{ marginBottom: 0 }}>Memberships</h2>
              <Link href={`/admin/plans/new?memberId=${member.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">+ Add membership</Link>
            </div>
            {member.plans.length === 0 ? (
              <p className="adm-muted" style={{ marginTop: 12 }}>No memberships yet.</p>
            ) : (
              <table className="prv-table" style={{ marginTop: 12 }}>
                <thead><tr><th>Membership</th><th>Period</th><th>Status</th><th>Amount</th><th>Receipt</th><th></th></tr></thead>
                <tbody>
                  {member.plans.map((p) => {
                    const isCurrent = ['active', 'on_freeze'].includes(p.status);
                    return (
                      <tr key={p.id} style={isCurrent ? { background: 'rgba(46,125,50,0.04)' } : undefined}>
                        <td><strong>{p.tier} {p.cycle}</strong></td>
                        <td className="prv-muted">{formatDate(p.startDate)} → {formatDate(p.endDate)}</td>
                        <td><PlanStatusChip status={p.status} /></td>
                        <td className="adm-mono">{p.receipt ? formatRupees(p.receipt.totalPaise) : <span className="adm-muted">—</span>}</td>
                        <td>{p.receipt ? <Link href={`/admin/receipts/${p.receipt.id}`}>{p.receipt.invoiceNumber}</Link> : <span className="adm-muted">—</span>}</td>
                        <td><Link href={`/admin/plans/${p.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">{isCurrent ? 'Manage' : 'View'}</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Edit details</h2>
            <MemberForm member={member} action={updateMember} deleteAction={deleteMember} />
          </div>
        </div>

        <aside className="prv-detail-side">
          <div className="adm-card">
            <h2 className="adm-card-title">Contact</h2>
            <dl className="prv-defs">
              <DefRow label="Phone" value={<span className="adm-mono">{member.phone}</span>} />
              <DefRow label="DOB" value={member.dob ? formatDate(member.dob) : null} />
              <DefRow label="Gender" value={member.gender} />
            </dl>
          </div>

          {(member.emergencyName || member.emergencyPhone) && (
            <div className="adm-card">
              <h2 className="adm-card-title">Emergency</h2>
              <dl className="prv-defs">
                <DefRow label="Name" value={member.emergencyName} />
                <DefRow label="Phone" value={member.emergencyPhone ? <span className="adm-mono">{member.emergencyPhone}</span> : null} />
                <DefRow label="Relation" value={member.emergencyRelation} />
              </dl>
            </div>
          )}

          {member.medicalNotes && (
            <div className="adm-card">
              <h2 className="adm-card-title">Medical</h2>
              <p className="prv-notes">{member.medicalNotes}</p>
            </div>
          )}

          <div className="adm-card">
            <h2 className="adm-card-title">Quick actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={`/admin/assessments/new?memberId=${member.id}`} className="adm-btn adm-btn-secondary">+ Walk-in assessment</Link>
              <Link href={`/admin/plans/new?memberId=${member.id}`} className="adm-btn adm-btn-secondary">+ Add membership</Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function PlanStatusChip({ status }) {
  const meta = stageMeta(PLAN_STATUSES, status);
  return <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>;
}

function SummaryStat({ label, value, sub }) {
  return (
    <div className="prv-summary">
      <div className="prv-summary-label">{label}</div>
      <div className="prv-summary-value">{value}</div>
      {sub && <div className="prv-summary-sub">{sub}</div>}
    </div>
  );
}

// Assessment tile that combines the summary stat (last date / Pending /
// "2nd assessment pending" once 3 months elapse) with the inline booking
// form. Replaces the separate sidebar "Book assessment" card.
function AssessmentTile({ memberId, lastAssess, upcomingBookings, slots }) {
  const ASSESSMENT_VALIDITY_DAYS = 90;
  const validityMs = ASSESSMENT_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
  const ageMs = lastAssess ? Date.now() - new Date(lastAssess.assessedAt).getTime() : null;
  const overdue = ageMs != null && ageMs > validityMs;
  const fresh = ageMs != null && ageMs <= validityMs;
  const showBookingUi = !lastAssess || overdue;
  const ordinal = !lastAssess ? '1st' : '2nd';

  return (
    <div className="prv-summary">
      <div className="prv-summary-label">Last assessment</div>
      {fresh ? (
        <>
          <div className="prv-summary-value">
            <Link href={`/admin/assessments/${lastAssess.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {formatDate(lastAssess.assessedAt)}
            </Link>
          </div>
          {lastAssess.priorityFocus && <div className="prv-summary-sub">{lastAssess.priorityFocus}</div>}
        </>
      ) : (
        <>
          <div className="prv-summary-value" style={{ color: 'var(--gold-deep, #C99419)' }}>
            {ordinal} pending
          </div>
          {overdue && (
            <div className="prv-summary-sub">
              Previous:{' '}
              <Link href={`/admin/assessments/${lastAssess.id}`}>{formatDate(lastAssess.assessedAt)}</Link>
            </div>
          )}
        </>
      )}
      {showBookingUi && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border, #E0D6C8)' }}>
          {upcomingBookings.length > 0 ? (
            <p className="adm-muted" style={{ fontSize: 12, margin: 0 }}>
              Booked: {upcomingBookings.map((b) => `${formatDate(b.scheduledDate)} ${b.slot.timeOfDay}`).join(', ')}
            </p>
          ) : (
            <BookAssessment memberId={memberId} slots={slots} />
          )}
        </div>
      )}
    </div>
  );
}

function DefRow({ label, value }) {
  return (
    <div className="prv-def-row">
      <dt>{label}</dt>
      <dd>{value || <span className="adm-muted">—</span>}</dd>
    </div>
  );
}
