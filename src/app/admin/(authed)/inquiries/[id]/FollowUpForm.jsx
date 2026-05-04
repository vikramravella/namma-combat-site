'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logEvent, markFollowUpDone } from '../actions';
import { DatePicker } from '@/components/DatePicker';
import { formatDate } from '@/lib/format';

// Lives in the right sidebar of the inquiry detail page. Lets Vinod
// either set a future follow-up date (date picker + Save) or, when a
// follow-up is already pending, tick it off as done in one click.
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

  function handleDone() {
    startTransition(async () => {
      const r = await markFollowUpDone(inquiryId);
      if (r?.ok === false) return;
      setDate('');
      setSuccess('Marked done.');
      router.refresh();
      setTimeout(() => setSuccess(''), 3000);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {currentNext && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', background: 'var(--gold-soft, rgba(227,199,104,0.15))', borderRadius: 6, fontSize: 13 }}>
          <span>Pending — due <strong>{formatDate(currentNext)}</strong></span>
          <button
            type="button"
            onClick={handleDone}
            disabled={isPending}
            className="adm-btn adm-btn-sm"
            title="Mark this follow-up as done"
            style={{ padding: '4px 10px' }}
          >
            ✓ Done
          </button>
        </div>
      )}
      <DatePicker value={date} onChange={setDate} />
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !date}
        className="adm-btn adm-btn-sm"
      >
        {isPending ? 'Saving…' : currentNext ? 'Reschedule follow-up' : 'Set follow-up'}
      </button>
      {success && <p className="adm-success" style={{ margin: 0, fontSize: 12 }}>{success}</p>}
    </div>
  );
}
