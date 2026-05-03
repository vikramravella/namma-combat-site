'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export function AssessmentSlotForm({ row, action, deleteAction, mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(formData) {
    setError('');
    startTransition(async () => {
      const r = mode === 'create' ? await action(formData) : await action(row.id, formData);
      if (r?.ok === false) setError(r.error);
      else if (r?.ok === true) router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm('Delete this slot?')) return;
    startTransition(async () => {
      const r = await deleteAction(row.id);
      if (r?.ok === false) setError(r.error);
    });
  }

  const r = row || {};
  return (
    <form action={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">When</h2>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="dayOfWeek">Day *</label>
            <select id="dayOfWeek" name="dayOfWeek" defaultValue={r.dayOfWeek ?? 3} className="adm-select" required>
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="timeOfDay">Time *</label>
            <input id="timeOfDay" name="timeOfDay" type="time" defaultValue={r.timeOfDay || '18:00'} required className="adm-input" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="durationMinutes">Duration (min)</label>
            <input id="durationMinutes" name="durationMinutes" type="number" min="5" max="480" defaultValue={r.durationMinutes ?? 30} className="adm-input" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Capacity & status</h2>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="capacity">Capacity</label>
            <input id="capacity" name="capacity" type="number" min="1" max="100" defaultValue={r.capacity ?? 10} className="adm-input" />
            <span className="adm-help">How many members can book this slot</span>
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="notes">Notes</label>
            <input id="notes" name="notes" defaultValue={r.notes || ''} placeholder="e.g. Naeem morning" className="adm-input" />
          </div>
        </div>
        <div className="adm-field">
          <label className="adm-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="active" defaultChecked={mode === 'create' ? true : r.active} /> Active (members can book)
          </label>
        </div>
      </div>

      <div className="adm-form-actions">
        {mode === 'edit' && (
          <>
            <button type="button" onClick={handleDelete} disabled={isPending} className="adm-btn adm-btn-danger">Delete</button>
            <div className="adm-spacer" />
          </>
        )}
        <Link href="/admin/settings/assessment-slots" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Saving…' : mode === 'create' ? 'Create slot' : 'Save changes'}</button>
      </div>
    </form>
  );
}
