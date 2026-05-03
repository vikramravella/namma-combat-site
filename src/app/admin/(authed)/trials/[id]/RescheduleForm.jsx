'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { rescheduleTrial } from '../actions';

const DAYS = [['Mon', 0], ['Tue', 1], ['Wed', 2], ['Thu', 3], ['Fri', 4], ['Sat', 5], ['Sun', 6]];

export function RescheduleForm({ trialId, currentArea, currentDiscipline, currentDay, currentTime }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [area, setArea] = useState(currentArea || 'Arena');
  const [discipline, setDiscipline] = useState(currentDiscipline || '');
  const [dayIndex, setDayIndex] = useState(DAYS.find((d) => d[0] === currentDay)?.[1] ?? 0);
  const [time, setTime] = useState(currentTime || '06:00');
  const [scheduledDate, setScheduledDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('area', area);
    fd.set('discipline', discipline);
    fd.set('dayIndex', String(dayIndex));
    fd.set('time', time);
    if (scheduledDate) fd.set('scheduledDate', scheduledDate);
    if (reason) fd.set('reason', reason);
    startTransition(async () => {
      const r = await rescheduleTrial(trialId, fd);
      if (r?.ok === false) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Area</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="adm-select">
            <option>Arena</option>
            <option>Sanctuary</option>
          </select>
        </div>
        <div className="adm-field">
          <label className="adm-label">Discipline</label>
          <input value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="adm-input" placeholder="Boxing / MMA / S&C…" required />
        </div>
      </div>
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Day of week</label>
          <select value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))} className="adm-select">
            {DAYS.map(([l, v]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="adm-field">
          <label className="adm-label">Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="adm-input" />
        </div>
        <div className="adm-field">
          <label className="adm-label">Specific date (optional)</label>
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="adm-input" />
          <span className="adm-help">Blank = next occurrence of the chosen day.</span>
        </div>
      </div>
      <div className="adm-field">
        <label className="adm-label">Reason (optional)</label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} className="adm-input" placeholder="No-show last time, traveling, etc." />
      </div>
      <div className="adm-form-actions">
        <button type="submit" disabled={isPending} className="adm-btn">{isPending ? 'Rescheduling…' : 'Reschedule trial'}</button>
      </div>
    </form>
  );
}
