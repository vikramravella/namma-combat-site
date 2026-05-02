'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TRIAL_STATUSES, TRIAL_OUTCOMES } from '@/lib/constants';
import { updateTrialStatus, setTrialOutcome, convertTrialToMember } from '../actions';

export function StatusControls({ trial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function changeStatus(newStatus) {
    setError('');
    const fd = new FormData();
    fd.set('status', newStatus);
    startTransition(async () => {
      const r = await updateTrialStatus(trial.id, fd);
      if (r?.ok === false) setError(r.error);
      else router.refresh();
    });
  }

  function changeOutcome(newOutcome) {
    setError('');
    const fd = new FormData();
    fd.set('outcome', newOutcome);
    startTransition(async () => {
      const r = await setTrialOutcome(trial.id, fd);
      if (r?.ok === false) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="adm-form">
      {error && <p className="adm-error">{error}</p>}

      <div className="adm-field">
        <label className="adm-label">Trial status</label>
        <div className="prv-chips">
          {TRIAL_STATUSES.map((s) => (
            <button key={s.key} type="button" disabled={isPending} onClick={() => changeStatus(s.key)} className={`prv-chip ${trial.status === s.key ? 'prv-chip-on' : ''}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {['showed_up', 'no_show'].includes(trial.status) && (
        <div className="adm-field">
          <label className="adm-label">Outcome (post-attendance)</label>
          <div className="prv-chips">
            {TRIAL_OUTCOMES.map((o) => (
              <button key={o.key} type="button" disabled={isPending} onClick={() => changeOutcome(o.key)} className={`prv-chip ${trial.outcome === o.key ? 'prv-chip-on' : ''}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConvertControl({ trial }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleConvert() {
    setError('');
    if (!confirm('Convert this trial to a member? You\'ll be sent to the New Plan page next.')) return;
    const fd = new FormData();
    fd.set('primaryDiscipline', trial.discipline);
    startTransition(async () => {
      const r = await convertTrialToMember(trial.id, fd);
      if (r?.ok === false) setError(r.error);
    });
  }

  if (trial.convertedMemberId) {
    return <p className="adm-success">✓ Converted to member.</p>;
  }

  return (
    <>
      {error && <p className="adm-error">{error}</p>}
      <button type="button" onClick={handleConvert} disabled={isPending} className="adm-btn" style={{ width: '100%' }}>
        {isPending ? 'Converting…' : 'Convert to member → create plan'}
      </button>
      <p className="adm-help" style={{ marginTop: 8 }}>Creates a Member record, links from this Trial + Inquiry, and opens the New Plan form.</p>
    </>
  );
}
