'use client';
import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { editPlanDates } from '../actions';
import { DatePicker } from '@/components/DatePicker';

export function EditDatesForm({ plan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(toIsoDate(plan.startDate));
  const [bonusDays, setBonusDays] = useState(plan.bonusDays > 0 ? String(plan.bonusDays) : '');
  const [notes, setNotes] = useState(plan.notes || '');

  const baseDays = (plan.durationDays || 0) - (plan.bonusDays || 0);
  const previewEnd = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + baseDays + (Number(bonusDays) || 0));
    return end;
  }, [startDate, bonusDays, baseDays]);

  const blockedByFreeze = (plan.freezeDaysUsed || 0) > 0;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!startDate) { setError('Pick a start date.'); return; }
    const fd = new FormData();
    fd.set('startDate', startDate);
    fd.set('bonusDays', String(Number(bonusDays) || 0));
    if (notes) fd.set('notes', notes);
    startTransition(async () => {
      const r = await editPlanDates(plan.id, fd);
      if (r?.ok === false) {
        setError(r.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="adm-btn adm-btn-secondary adm-btn-sm">
        Edit dates / notes
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form" style={{ marginTop: 12 }}>
      {error && <p className="adm-error">{error}</p>}
      {blockedByFreeze && (
        <p className="adm-help" style={{ color: 'var(--rust)' }}>
          This membership has freeze days applied. End the freeze first to edit dates.
        </p>
      )}
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Start date *</label>
          <DatePicker value={startDate} onChange={setStartDate} required />
        </div>
        <div className="adm-field">
          <label className="adm-label">Bonus days</label>
          <input
            type="number"
            value={bonusDays}
            onChange={(e) => setBonusDays(e.target.value)}
            placeholder="0"
            min="0"
            max="180"
            className="adm-input"
          />
        </div>
      </div>
      {previewEnd && (
        <p className="adm-help">
          New end date: <strong>{previewEnd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          {' '}({baseDays + (Number(bonusDays) || 0)} days)
        </p>
      )}
      <div className="adm-field">
        <label className="adm-label">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="adm-textarea"
          rows={3}
          placeholder="Anything worth keeping with this membership."
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setOpen(false)} className="adm-btn adm-btn-secondary">Cancel</button>
        <button type="submit" disabled={isPending || blockedByFreeze} className="adm-btn">
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function toIsoDate(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}
