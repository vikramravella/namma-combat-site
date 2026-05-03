'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/app/admin/(authed)/assessments/bookings/actions';

export function BookAssessment({ memberId, slots }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Build the next 14 days that match an active slot's dayOfWeek
  const candidates = useMemo(() => {
    const out = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 28; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const isoDow = d.getDay() === 0 ? 7 : d.getDay();
      const matching = slots.filter((s) => s.dayOfWeek === isoDow);
      for (const s of matching) {
        out.push({
          date: d.toISOString().slice(0, 10),
          dateLabel: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
          slotId: s.id,
          slotLabel: `${s.timeOfDay}${s.notes ? ' (' + s.notes + ')' : ''}`,
        });
      }
      if (out.length >= 8) break;
    }
    return out;
  }, [slots]);

  const [picked, setPicked] = useState(candidates[0]?.date + '|' + candidates[0]?.slotId || '');

  function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const [date, slotId] = (picked || '').split('|');
    if (!date || !slotId) { setError('Pick a date+time'); return; }
    const fd = new FormData();
    fd.set('memberId', memberId);
    fd.set('slotId', slotId);
    fd.set('scheduledDate', date);
    startTransition(async () => {
      const r = await createBooking(fd);
      if (r?.ok === false) setError(r.error);
      else { setSuccess('Booked.'); router.refresh(); }
    });
  }

  if (slots.length === 0) {
    return <p className="adm-muted">No active slots configured. Add one in <a href="/admin/settings/assessment-slots">Settings → Assessment slots</a>.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <select value={picked} onChange={(e) => setPicked(e.target.value)} className="adm-select" style={{ flex: '1 1 200px', minWidth: 200 }}>
        {candidates.map((c) => (
          <option key={c.date + c.slotId} value={c.date + '|' + c.slotId}>
            {c.dateLabel} · {c.slotLabel}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isPending} className="adm-btn adm-btn-secondary adm-btn-sm">{isPending ? 'Booking…' : 'Book'}</button>
      {error && <span style={{ color: '#9A3520', fontSize: 12 }}>{error}</span>}
      {success && <span style={{ color: '#2E7D32', fontSize: 12 }}>{success}</span>}
    </form>
  );
}
