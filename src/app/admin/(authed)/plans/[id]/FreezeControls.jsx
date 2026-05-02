'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { freezePlan, endFreeze, cancelPlan } from '../actions';

export function FreezeControls({ plan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [start, setStart] = useState(addDays(7));
  const [end, setEnd] = useState(addDays(14));
  const [reason, setReason] = useState('');
  const [medical, setMedical] = useState(false);

  function handleFreeze(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('freezeStart', start);
    fd.set('freezeEnd', end);
    if (reason) fd.set('freezeReason', reason);
    if (medical) fd.set('medicalException', 'true');
    startTransition(async () => {
      const r = await freezePlan(plan.id, fd);
      if (r?.ok === false) setError(r.error);
      else router.refresh();
    });
  }

  function handleEnd() {
    if (!confirm('End freeze early? Plan resumes today.')) return;
    startTransition(async () => {
      await endFreeze(plan.id);
      router.refresh();
    });
  }

  function handleCancel() {
    const r = prompt('Cancel this plan? Optional reason:');
    if (r === null) return;
    startTransition(async () => {
      await cancelPlan(plan.id, r);
      router.refresh();
    });
  }

  if (plan.status === 'cancelled') return <p className="adm-muted">This plan is cancelled.</p>;
  if (plan.status === 'ended') return <p className="adm-muted">This plan has ended.</p>;

  if (plan.status === 'on_freeze') {
    return (
      <>
        {error && <p className="adm-error">{error}</p>}
        <p>Plan is on freeze from <strong>{formatDate(plan.freezeStart)}</strong> to <strong>{formatDate(plan.freezeEnd)}</strong>.</p>
        {plan.freezeReason && <p className="adm-muted">{plan.freezeReason}</p>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="button" onClick={handleEnd} disabled={isPending} className="adm-btn">End freeze early</button>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleFreeze} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Freeze from</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="adm-input" />
        </div>
        <div className="adm-field">
          <label className="adm-label">Freeze to</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="adm-input" />
        </div>
      </div>
      <div className="adm-field">
        <label className="adm-label">Reason</label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Travel, injury, etc." className="adm-input" />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} />
        Medical exception (bypass cap + minimum + advance-notice rules)
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" onClick={handleCancel} className="adm-btn adm-btn-danger">Cancel plan</button>
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Freezing…' : 'Freeze plan'}</button>
      </div>
    </form>
  );
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
