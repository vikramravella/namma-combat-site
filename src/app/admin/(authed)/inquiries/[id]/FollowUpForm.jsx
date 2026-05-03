'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logEvent } from '../actions';
import { DatePicker } from '@/components/DatePicker';

// Lives in the right sidebar of the inquiry detail page. Just a date +
// Save — sets nextFollowUpAt and records a 'note' event in the journey
// so the timeline still reflects when a follow-up was scheduled.
export function FollowUpForm({ inquiryId, currentNext }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(
    currentNext ? new Date(currentNext).toISOString().slice(0, 10) : ''
  );
  const [success, setSuccess] = useState('');

  function handleSave() {
    if (!date) return;
    const fd = new FormData();
    fd.set('type', 'note');
    fd.set('nextFollowUpAt', new Date(date).toISOString());
    startTransition(async () => {
      const r = await logEvent(inquiryId, fd);
      if (r?.ok === false) return;
      setSuccess('Saved.');
      router.refresh();
      setTimeout(() => setSuccess(''), 3000);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <DatePicker value={date} onChange={setDate} />
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !date}
        className="adm-btn adm-btn-sm"
      >
        {isPending ? 'Saving…' : 'Set follow-up'}
      </button>
      {success && <p className="adm-success" style={{ margin: 0, fontSize: 12 }}>{success}</p>}
    </div>
  );
}
