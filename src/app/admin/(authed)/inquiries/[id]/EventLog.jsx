'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { changeStage } from '../actions';
import { INQUIRY_STAGES } from '@/lib/constants';

// Just the quick-stage-change chips. The old free-form "log an event" form
// (Type / Outcome / What happened / Next follow-up combo) was removed —
// nobody was filling it in. Next follow-up moved to its own sidebar card;
// the per-event journal is captured automatically when the stage changes.
export function EventLog({ inquiryId, currentStage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(newStage) {
    startTransition(async () => {
      const r = await changeStage(inquiryId, newStage, null);
      if (r?.redirectTo) router.push(r.redirectTo);
      else router.refresh();
    });
  }

  const targets = INQUIRY_STAGES.filter((s) => s.key !== currentStage);

  return (
    <div className="prv-chips">
      {targets.map((s) => (
        <button
          key={s.key}
          type="button"
          disabled={isPending}
          onClick={() => handle(s.key)}
          className="prv-chip"
          style={{ cursor: isPending ? 'wait' : 'pointer' }}
        >
          → {s.label}
        </button>
      ))}
    </div>
  );
}
