'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { freezePlan, endFreeze, cancelPlan } from '../actions';
import { DatePicker } from '@/components/DatePicker';

export function FreezeControls({ plan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [start, setStart] = useState(addDays(0));
  const [end, setEnd] = useState(addDays(7));
  const [days, setDays] = useState('7');
  const [reason, setReason] = useState('');
  const [medical, setMedical] = useState(false);

  // Two-way sync between the days input and the end date — staff can
  // type either, the other auto-fills.
  function handleStartChange(newStart) {
    setStart(newStart);
    if (days) setEnd(addToDate(newStart, Number(days) || 0));
  }
  function handleDaysChange(v) {
    setDays(v);
    const n = Number(v);
    if (Number.isFinite(n) && n > 0 && start) setEnd(addToDate(start, n));
  }
  function handleEndChange(newEnd) {
    setEnd(newEnd);
    if (start && newEnd) {
      const d = Math.ceil((new Date(newEnd) - new Date(start)) / (1000 * 60 * 60 * 24));
      if (d > 0) setDays(String(d));
    }
  }

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
    if (!confirm('End freeze early? Membership resumes today.')) return;
    startTransition(async () => {
      await endFreeze(plan.id);
      router.refresh();
    });
  }

  function handleCancel() {
    const r = prompt('Cancel this membership? Optional reason:');
    if (r === null) return;
    startTransition(async () => {
      await cancelPlan(plan.id, r);
      router.refresh();
    });
  }

  if (plan.status === 'cancelled') return <p className="adm-muted">This membership is cancelled.</p>;
  if (plan.status === 'ended') return <p className="adm-muted">This membership has ended.</p>;

  if (plan.status === 'on_freeze') {
    return (
      <>
        {error && <p className="adm-error">{error}</p>}
        <p>Membership is on freeze from <strong>{formatDate(plan.freezeStart)}</strong> to <strong>{formatDate(plan.freezeEnd)}</strong>.</p>
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
          <DatePicker value={start} onChange={handleStartChange} />
        </div>
        <div className="adm-field">
          <label className="adm-label">Number of days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => handleDaysChange(e.target.value)}
            min="1"
            max="365"
            placeholder="e.g. 30"
            className="adm-input"
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">Freeze to</label>
          <DatePicker value={end} onChange={handleEndChange} />
        </div>
      </div>
      <p className="adm-help" style={{ margin: 0 }}>
        Type either the number of days or the end date — the other auto-fills.
        Allowance: <strong>{plan.freezeDaysAllowed}</strong> days max ({plan.freezeDaysUsed || 0} used so far).
      </p>
      <div className="adm-field">
        <label className="adm-label">Reason</label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Travel, injury, etc." className="adm-input" />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} />
        Medical exception (bypass freeze cap + minimum-length rule)
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" onClick={handleCancel} className="adm-btn adm-btn-danger">Cancel membership</button>
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Freezing…' : 'Freeze membership'}</button>
      </div>
    </form>
  );
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function addToDate(isoDate, n) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
