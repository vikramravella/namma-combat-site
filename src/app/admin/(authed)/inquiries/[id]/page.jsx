import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';
import { INQUIRY_STAGES, SOURCES, stageMeta } from '@/lib/constants';
import { InquiryForm } from '../InquiryForm';
import { updateInquiry, deleteInquiry } from '../actions';
import { EventLog } from './EventLog';

export default async function InquiryDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      trials: { orderBy: { scheduledDate: 'desc' } },
    },
  });
  if (!inquiry) notFound();

  const stage = stageMeta(INQUIRY_STAGES, inquiry.stage);
  const sourceLabel = SOURCES.find((s) => s.key === inquiry.source)?.label;
  const justCreated = sp?.created === '1';

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/inquiries" className="prv-back">← Inquiries</Link></p>
          <h1 className="adm-page-title">{fullName(inquiry)}</h1>
          <p className="adm-page-subtitle">
            <span className={`prv-stage prv-stage-${stage.tone}`}><span className="prv-stage-dot" />{stage.label}</span>
            <span className="prv-divider">·</span>
            <span className="adm-mono">{inquiry.phone}</span>
            <span className="prv-divider">·</span>
            <span>Added {formatRelative(inquiry.createdAt)}</span>
            {inquiry.nextFollowUpAt && (
              <>
                <span className="prv-divider">·</span>
                <span>Next follow-up <strong>{formatDate(inquiry.nextFollowUpAt)}</strong></span>
              </>
            )}
          </p>
        </div>
        <div className="prv-action-row">
          <a href={`https://wa.me/91${inquiry.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">
            Open WhatsApp
          </a>
          <Link href={`/admin/trials/new?inquiryId=${inquiry.id}`} className="adm-btn">Schedule trial</Link>
        </div>
      </div>

      {justCreated && <p className="adm-success" style={{ marginBottom: 16 }}>Inquiry created.</p>}

      {inquiry.convertedMemberId && (
        <div className="adm-card" style={{ marginBottom: 16, borderLeft: '4px solid var(--green, #2E7D32)', background: 'rgba(46,125,50,0.06)' }}>
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span><strong>✓ Converted to member.</strong> This inquiry became a member; further activity is tracked there.</span>
            <Link href={`/admin/members/${inquiry.convertedMemberId}`} className="adm-btn adm-btn-secondary adm-btn-sm">View member →</Link>
          </p>
        </div>
      )}

      <div className="prv-detail-grid">
        <div className="prv-detail-main">
          <div className="adm-card">
            <h2 className="adm-card-title">Log an event</h2>
            <EventLog inquiryId={inquiry.id} currentStage={inquiry.stage} />
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Journey</h2>
            <ol className="prv-timeline">
              {inquiry.events.map((e) => (
                <li key={e.id} className={`prv-event prv-event-${e.type}`}>
                  <div className="prv-event-marker" aria-hidden />
                  <div className="prv-event-body">
                    <div className="prv-event-head">
                      <span className="prv-event-label">{e.label}{e.outcome && <span className="adm-muted"> — {formatOutcome(e.outcome)}</span>}</span>
                      <span className="prv-event-time">{formatRelative(e.createdAt)}</span>
                    </div>
                    {e.detail && <p className="prv-event-detail">{e.detail}</p>}
                    {e.scheduledFor && <p className="prv-event-detail adm-muted">Next follow-up set: {formatDate(e.scheduledFor)}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Edit details</h2>
            <InquiryForm inquiry={inquiry} action={updateInquiry} deleteAction={deleteInquiry} mode="edit" />
          </div>
        </div>

        <aside className="prv-detail-side">
          <div className="adm-card">
            <h2 className="adm-card-title">Contact</h2>
            <dl className="prv-defs">
              <DefRow label="Phone" value={<span className="adm-mono">{inquiry.phone}</span>} />
              <DefRow label="Area" value={inquiry.area} />
              <DefRow label="Follow-up attempts" value={String(inquiry.followUpAttempts || 0)} />
              <DefRow label="Last contacted" value={inquiry.lastContactedAt ? formatRelative(inquiry.lastContactedAt) : '—'} />
            </dl>
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">What they want</h2>
            <dl className="prv-defs">
              <DefRow label="Interested in" value={inquiry.interestedIn} />
              <DefRow label="Primary goal" value={inquiry.primaryGoal} />
              <DefRow label="Experience" value={inquiry.experience} />
              <DefRow label="Preferred time" value={inquiry.preferredTime} />
            </dl>
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">How they found us</h2>
            <p className="prv-source">{sourceLabel || '—'}</p>
            {inquiry.sourceDetails && <p className="adm-muted" style={{ fontSize: 12, marginTop: 4 }}>{inquiry.sourceDetails}</p>}
          </div>

          {inquiry.trials.length > 0 && (
            <div className="adm-card">
              <h2 className="adm-card-title">Trials</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
                {inquiry.trials.map((t) => (
                  <li key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border, #E0D6C8)' }}>
                    <Link href={`/admin/trials/${t.id}`} style={{ color: 'var(--rust, #9A3520)', textDecoration: 'none', fontWeight: 500 }}>
                      {t.discipline} · {formatDate(t.scheduledDate)} {t.scheduledTime}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status: {t.status}{t.outcome ? ` → ${t.outcome}` : ''}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {inquiry.notes && (
            <div className="adm-card">
              <h2 className="adm-card-title">Notes</h2>
              <p className="prv-notes">{inquiry.notes}</p>
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

function formatOutcome(o) {
  return o.replace(/_/g, ' ');
}
