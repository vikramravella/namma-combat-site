import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';
import { TRIAL_STATUSES, TRIAL_OUTCOMES, stageMeta, VENDOR } from '@/lib/constants';
import { StatusControls, ConvertControl } from './StatusControls';
import { TrialFollowUpForm } from './TrialFollowUpForm';
import { RescheduleSection } from './RescheduleSection';

export default async function TrialDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const trial = await db.trial.findUnique({
    where: { id },
    include: {
      inquiry: true,
      coach: true,
      healthDecl: true,
      formToken: true,
      convertedMember: true,
      events: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!trial) notFound();

  const justScheduled = sp?.scheduled === '1';
  const status = stageMeta(TRIAL_STATUSES, trial.status);
  const outcome = trial.outcome ? stageMeta(TRIAL_OUTCOMES, trial.outcome) : null;
  const formUrl = trial.formToken ? `${process.env.NEXTAUTH_URL || ''}/form/${trial.formToken.token}` : null;
  const waMessage = formUrl ? encodeURIComponent(`Hi ${trial.inquiry.firstName}, please fill this short form before your trial on ${formatDate(trial.scheduledDate)} at ${trial.scheduledTime}: ${formUrl}`) : '';
  const phoneDigits = trial.inquiry.phone.replace(/\D/g, '').slice(-10);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/trials" className="prv-back">← Trials</Link></p>
          <h1 className="adm-page-title">{fullName(trial.inquiry)}</h1>
          <p className="adm-page-subtitle">
            <span className={`prv-stage prv-stage-${status.tone}`}><span className="prv-stage-dot" />{status.label}</span>
            {outcome && (
              <>
                <span className="prv-divider">→</span>
                <span className={`prv-stage prv-stage-${outcome.tone}`}><span className="prv-stage-dot" />{outcome.label}</span>
              </>
            )}
            <span className="prv-divider">·</span>
            <span>{trial.discipline} · {trial.day} {trial.scheduledTime} <span className="adm-muted">({trial.area})</span></span>
            <span className="prv-divider">·</span>
            <span>{formatDate(trial.scheduledDate)}</span>
          </p>
        </div>
      </div>

      {justScheduled && <p className="adm-success" style={{ marginBottom: 16 }}>Trial scheduled. Send the health form link below.</p>}

      <div className="prv-detail-grid">
        <div className="prv-detail-main">
          <div className="adm-card">
            <h2 className="adm-card-title">Status & outcome</h2>
            <StatusControls trial={trial} />
          </div>

          {trial.outcome === 'joined' && !trial.convertedMember && (
            <div className="adm-card" style={{ borderColor: 'var(--rust, #9A3520)' }}>
              <h2 className="adm-card-title">Convert to member</h2>
              <ConvertControl trial={trial} />
            </div>
          )}
          {trial.outcome === 'joined' && trial.convertedMember && (
            <div className="adm-card">
              <h2 className="adm-card-title">Converted</h2>
              <p>This trial converted to a member.</p>
              <p style={{ marginTop: 8 }}>
                <Link href={`/admin/members/${trial.convertedMember.id}`} className="adm-btn">→ Open member profile</Link>
              </p>
            </div>
          )}

          <div className="adm-card">
            <h2 className="adm-card-title">Health declaration</h2>
            {trial.healthDecl ? (
              <HealthDeclView hd={trial.healthDecl} />
            ) : (
              <>
                <p className="adm-muted" style={{ marginBottom: 12 }}>Not submitted yet.</p>
                {formUrl && (
                  <>
                    <div className="adm-field">
                      <label className="adm-label">Form link (token expires {formatDate(trial.formToken.expiresAt)})</label>
                      <input type="text" readOnly defaultValue={formUrl} className="adm-input adm-mono" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <a href={`https://wa.me/91${phoneDigits}?text=${waMessage}`} target="_blank" rel="noreferrer" className="adm-btn">
                        Send via WhatsApp
                      </a>
                      <a href={formUrl} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">
                        Open form (preview)
                      </a>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Coach notes</h2>
            <p className="adm-muted">{trial.attendanceNotes || 'Not recorded yet.'}</p>
          </div>

          {!trial.convertedMember && trial.status !== 'attended' && trial.status !== 'cancelled' && (
            <RescheduleSection trial={trial} />
          )}

          {(trial.outcome === 'didnt_join' || trial.outcome === 'lost_touch') && (
            <div className="adm-card">
              <h2 className="adm-card-title">Try again?</h2>
              <p className="adm-muted" style={{ marginBottom: 12 }}>If they want a second shot, schedule a fresh trial.</p>
              <Link href={`/admin/trials/new?inquiryId=${trial.inquiryId}`} className="adm-btn adm-btn-secondary">+ Schedule another trial</Link>
            </div>
          )}

          <div className="adm-card">
            <h2 className="adm-card-title">Log a follow-up</h2>
            <TrialFollowUpForm trialId={trial.id} />
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Journey</h2>
            {trial.events.length === 0 ? (
              <p className="adm-muted">No events yet.</p>
            ) : (
              <ol className="prv-timeline">
                {trial.events.map((e) => (
                  <li key={e.id} className={`prv-event prv-event-${e.type}`}>
                    <div className="prv-event-marker" aria-hidden />
                    <div className="prv-event-body">
                      <div className="prv-event-head">
                        <span className="prv-event-label">{e.label}</span>
                        <span className="prv-event-time">{formatRelative(e.createdAt)}</span>
                      </div>
                      {e.detail && <p className="prv-event-detail">{e.detail}</p>}
                      {e.scheduledFor && <p className="prv-event-detail adm-muted">Next: {formatDate(e.scheduledFor)}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <aside className="prv-detail-side">
          <div className="adm-card">
            <h2 className="adm-card-title">Person</h2>
            <dl className="prv-defs">
              <DefRow label="Name" value={fullName(trial.inquiry)} />
              <DefRow label="Phone" value={<span className="adm-mono">{trial.inquiry.phone}</span>} />
              <DefRow label="Source" value={trial.inquiry.source} />
            </dl>
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Class</h2>
            <dl className="prv-defs">
              <DefRow label="Area" value={trial.area} />
              <DefRow label="Discipline" value={trial.discipline} />
              <DefRow label="Day" value={trial.day} />
              <DefRow label="Time" value={<span className="adm-mono">{trial.scheduledTime}</span>} />
              <DefRow label="Coach" value={trial.coach?.name} />
            </dl>
          </div>

          {trial.notes && (
            <div className="adm-card">
              <h2 className="adm-card-title">Internal notes</h2>
              <p className="prv-notes">{trial.notes}</p>
            </div>
          )}
        </aside>
      </div>
    </>
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

function HealthDeclView({ hd }) {
  return (
    <dl className="prv-defs">
      <DefRow label="Submitted" value={formatDate(hd.consentSignedAt)} />
      <DefRow label="DOB" value={hd.dob ? formatDate(hd.dob) : null} />
      <DefRow label="Gender" value={hd.gender} />
      <DefRow label="Emergency" value={hd.emergencyName ? `${hd.emergencyName} (${hd.emergencyRelation || '—'}) · ${hd.emergencyPhone}` : null} />
      <DefRow label="Medical" value={hd.medicalConditions} />
      <DefRow label="Injuries" value={hd.injuries} />
      <DefRow label="Medications" value={hd.medications} />
      <DefRow label="Smoking" value={hd.smoking} />
      <DefRow label="Alcohol" value={hd.alcohol} />
      <DefRow label="Signed by" value={hd.consentSignedName} />
    </dl>
  );
}
