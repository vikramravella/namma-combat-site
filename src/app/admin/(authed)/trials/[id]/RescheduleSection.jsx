'use client';
import { useState } from 'react';
import { Booker } from '../../trials/new/Booker';

// Wraps the Booker grid so it only appears when the user explicitly clicks
// "Reschedule trial". Auto-opens for no_show trials since rescheduling is
// the obvious next action there. After a successful reschedule the page
// router-pushes away to /admin/trials/[id], so this component effectively
// stays in its closed state on return.
export function RescheduleSection({ trial }) {
  const [open, setOpen] = useState(trial.status === 'no_show' || trial.status === 'rescheduled');

  if (open) {
    return (
      <div className="adm-card" style={{ borderLeft: '4px solid var(--gold, #C99419)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <h2 className="adm-card-title" style={{ marginBottom: 0 }}>Reschedule — pick a new slot</h2>
          <button type="button" onClick={() => setOpen(false)} className="adm-btn adm-btn-secondary adm-btn-sm">Cancel</button>
        </div>
        <p className="adm-help" style={{ marginBottom: 12 }}>Same trial record, full history preserved.</p>
        <Booker inquiry={trial.inquiry} mode="reschedule" trialId={trial.id} currentArea={trial.area} />
      </div>
    );
  }

  return (
    <div className="adm-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h2 className="adm-card-title" style={{ marginBottom: 4 }}>Reschedule</h2>
          <p className="adm-muted" style={{ margin: 0, fontSize: 13 }}>
            {trial.rescheduleCount > 0
              ? `Rescheduled ${trial.rescheduleCount} time${trial.rescheduleCount === 1 ? '' : 's'} so far.`
              : 'Move to a different day or time on the schedule.'}
          </p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="adm-btn adm-btn-secondary">Reschedule trial</button>
      </div>
    </div>
  );
}
