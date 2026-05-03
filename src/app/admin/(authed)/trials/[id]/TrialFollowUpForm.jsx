'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logTrialFollowUp } from '../actions';
import { DatePicker } from '@/components/DatePicker';

export function TrialFollowUpForm({ trialId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState('called');
  const [detail, setDetail] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const fd = new FormData();
    fd.set('type', type);
    if (detail) fd.set('detail', detail);
    if (nextDate) fd.set('nextFollowUpAt', nextDate);
    startTransition(async () => {
      const r = await logTrialFollowUp(trialId, fd);
      if (r?.ok === false) setError(r.error);
      else { setSuccess('Logged.'); setDetail(''); setNextDate(''); router.refresh(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {success && <p className="adm-success">{success}</p>}
      <div className="adm-field">
        <label className="adm-label">Type</label>
        <div className="prv-chips">
          {[['called', 'Called'], ['whatsapp', 'WhatsApp'], ['in_person', 'In person'], ['note', 'Note']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setType(k)} className={`prv-chip ${type === k ? 'prv-chip-on' : ''}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="adm-field">
        <label className="adm-label">What happened</label>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="adm-textarea" rows={2} placeholder="Brief summary…" />
      </div>
      <div className="adm-field">
        <label className="adm-label">Next follow-up (optional)</label>
        <DatePicker value={nextDate} onChange={setNextDate} />
      </div>
      <div className="adm-form-actions">
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Logging…' : 'Log event'}</button>
      </div>
    </form>
  );
}
