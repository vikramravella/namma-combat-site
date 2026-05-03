'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logEvent, changeStage } from '../actions';
import { INQUIRY_STAGES } from '@/lib/constants';
import { DatePicker } from '@/components/DatePicker';

const TYPES = [
  { key: 'called', label: 'Called', needsOutcome: true },
  { key: 'whatsapp', label: 'WhatsApp', needsOutcome: true },
  { key: 'in_person', label: 'In person', needsOutcome: false },
  { key: 'note', label: 'Note', needsOutcome: false },
];

const OUTCOMES = [
  { key: 'got_through', label: 'Got through' },
  { key: 'no_answer', label: 'No answer' },
  { key: 'busy', label: 'Busy / declined' },
  { key: 'wrong_number', label: 'Wrong number' },
  { key: 'responded', label: 'They responded' },
];

export function EventLog({ inquiryId, currentStage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState('called');
  const [outcome, setOutcome] = useState('');
  const [detail, setDetail] = useState('');
  const [nextDate, setNextDate] = useState(defaultNextDate());
  const [error, setError] = useState('');

  function reset() {
    setType('called'); setOutcome(''); setDetail(''); setNextDate(defaultNextDate()); setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('type', type);
    if (outcome) fd.set('outcome', outcome);
    if (detail) fd.set('detail', detail);
    if (nextDate) fd.set('nextFollowUpAt', new Date(nextDate).toISOString());
    startTransition(async () => {
      const r = await logEvent(inquiryId, fd);
      if (r?.ok === false) { setError(r.error); return; }
      reset();
      router.refresh();
    });
  }

  const meta = TYPES.find((t) => t.key === type);

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}

      <div className="adm-form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="adm-field">
          <label className="adm-label">Type</label>
          <div className="evt-type-row">
            {TYPES.map((t) => (
              <button key={t.key} type="button" onClick={() => setType(t.key)} className={`evt-type ${type === t.key ? 'evt-type-on' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {meta?.needsOutcome && (
          <div className="adm-field">
            <label className="adm-label">Outcome</label>
            <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="adm-select">
              <option value="">— pick one —</option>
              {OUTCOMES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="adm-field">
        <label className="adm-label">What happened</label>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="adm-textarea" rows={2} placeholder={type === 'note' ? 'Useful context for next time…' : 'Brief summary of the conversation'} />
      </div>

      <div className="adm-field">
        <label className="adm-label">Next follow-up</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <DatePicker value={nextDate} onChange={setNextDate} />
          </div>
          <button type="submit" disabled={isPending} className="adm-btn" style={{ flex: '0 0 auto' }}>
            {isPending ? 'Saving…' : 'Log event'}
          </button>
        </div>
        <span className="adm-help">Leave blank if no next contact planned.</span>
      </div>

      <StageQuickSwitch inquiryId={inquiryId} currentStage={currentStage} />
    </form>
  );
}

function StageQuickSwitch({ inquiryId, currentStage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(newStage) {
    startTransition(async () => {
      const r = await changeStage(inquiryId, newStage, null);
      if (r?.redirectTo) router.push(r.redirectTo);
      else router.refresh();
    });
  }

  const targets = INQUIRY_STAGES.filter((s) => s.key !== currentStage);

  return (
    <div style={{ borderTop: '1px solid var(--border, #E0D6C8)', paddingTop: 12, marginTop: 4 }}>
      <div className="adm-label" style={{ marginBottom: 8 }}>Quick stage change</div>
      <div className="prv-chips">
        {targets.map((s) => (
          <button key={s.key} type="button" disabled={isPending} onClick={() => handle(s.key)} className="prv-chip" style={{ cursor: isPending ? 'wait' : 'pointer' }}>
            → {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function defaultNextDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}
