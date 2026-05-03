'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ARENA_SCHEDULE, SANCTUARY_SCHEDULE, DAY_LABELS, coachFor } from '@/lib/schedule';
import { fullName } from '@/lib/format';
import { scheduleTrial, rescheduleTrial } from '../actions';

export function Booker({ inquiry, mode = 'create', trialId, currentArea }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState(currentArea || 'Arena');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const schedule = tab === 'Arena' ? ARENA_SCHEDULE : SANCTUARY_SCHEDULE;
  const interests = Array.isArray(inquiry.interestedIn) ? inquiry.interestedIn : [];
  const highlight = interests.map((s) => s.toLowerCase());

  function handleClick(discipline, time, dayIndex) {
    if (!discipline.trim()) return;
    const day = DAY_LABELS[dayIndex];
    const coach = coachFor(tab, discipline, time);
    setSelected({ area: tab, discipline, time, dayIndex, day, coach });
    setError('');
  }

  function handleConfirm() {
    if (!selected) return;
    setError('');
    const fd = new FormData();
    if (mode === 'create') fd.set('inquiryId', inquiry.id);
    fd.set('area', selected.area);
    fd.set('discipline', selected.discipline);
    fd.set('dayIndex', String(selected.dayIndex));
    fd.set('time', selected.time);
    startTransition(async () => {
      const r = mode === 'reschedule'
        ? await rescheduleTrial(trialId, fd)
        : await scheduleTrial(fd);
      if (r?.ok === false) {
        setError(r.error);
        return;
      }
      // After a successful reschedule, leave the booker grid and go back to
      // the trial detail page so the user sees the updated time/coach. The
      // create flow already redirects via the server action.
      if (mode === 'reschedule') router.push(`/admin/trials/${trialId}`);
    });
  }

  return (
    <>
      <div className="sch-context-bar">
        <div>
          <span className="sch-context-label">Booking for</span>{' '}
          <strong>{fullName(inquiry)}</strong>
          <span className="prv-divider">·</span>
          <span className="adm-mono">{inquiry.phone}</span>
          {interests.length > 0 && (
            <>
              <span className="prv-divider">·</span>
              <span>Interested in <strong>{interests.join(', ')}</strong></span>
            </>
          )}
        </div>
        <Link href={`/admin/inquiries/${inquiry.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Cancel</Link>
      </div>

      {error && <p className="adm-error" style={{ marginBottom: 12 }}>{error}</p>}

      {selected && (
        <div className="sch-confirm">
          <div className="sch-confirm-text">
            <strong>{selected.discipline}</strong> · {selected.day} · {selected.time}
            {selected.coach && <> · {selected.coach}</>}
            <span className="adm-muted" style={{ marginLeft: 8 }}>({selected.area})</span>
          </div>
          <div className="sch-confirm-actions">
            <button type="button" onClick={() => setSelected(null)} className="adm-btn adm-btn-secondary adm-btn-sm">Pick another</button>
            <button type="button" onClick={handleConfirm} disabled={isPending} className="adm-btn">
              {isPending ? (mode === 'reschedule' ? 'Rescheduling…' : 'Booking…') : (mode === 'reschedule' ? 'Confirm reschedule' : 'Confirm booking')}
            </button>
          </div>
        </div>
      )}

      <div className="sch-layout">
        <aside className="sch-tabs">
          <button type="button" onClick={() => setTab('Arena')} className={`sch-tab ${tab === 'Arena' ? 'sch-tab-on' : ''}`}>
            <span className="sch-tab-name">The Arena</span>
            <span className="sch-tab-sub">Combat Sports</span>
          </button>
          <button type="button" onClick={() => setTab('Sanctuary')} className={`sch-tab ${tab === 'Sanctuary' ? 'sch-tab-on' : ''}`}>
            <span className="sch-tab-name">The Sanctuary</span>
            <span className="sch-tab-sub">Strength & Conditioning</span>
          </button>
        </aside>

        <div className="sch-tab-content">
          <div className="sch-block">
            <div className="sch-block-head">
              <h3 className="sch-block-title">{tab === 'Arena' ? 'The Arena' : 'The Sanctuary'}</h3>
              <span className="sch-block-sub">{tab === 'Arena' ? 'Combat Sports' : 'Strength & Conditioning'}</span>
            </div>
            <div className="sch-table-wrap">
              <table className="sch-table">
                <colgroup>
                  <col style={{ width: '70px' }} />
                  {DAY_LABELS.map((d) => <col key={d} style={{ width: 'calc((100% - 70px) / 7)' }} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th className="sch-th-time">Time</th>
                    {DAY_LABELS.map((d) => <th key={d} className="sch-th-day">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {schedule.morning.map((row) => (
                    <Row key={row.time} time={row.time} cells={row.cells} highlight={highlight} selected={selected} area={tab} onClick={handleClick} />
                  ))}
                  <tr><td colSpan={8} className="sch-break">Afternoon Break</td></tr>
                  {schedule.evening.map((row) => (
                    <Row key={row.time} time={row.time} cells={row.cells} highlight={highlight} selected={selected} area={tab} onClick={handleClick} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ time, cells, highlight, selected, area, onClick }) {
  return (
    <tr>
      <td className="sch-time">{time}</td>
      {cells.map((cell, i) => {
        const empty = !cell.trim();
        if (empty) return <td key={i} className="sch-empty">—</td>;
        const isSelected = selected && selected.area === area && selected.discipline === cell && selected.time === time && selected.dayIndex === i;
        const cellLower = cell.toLowerCase();
        const isMatch = highlight.some((h) => cellLower.includes(h));
        const elite = cell.toLowerCase().includes('elite');
        const coach = coachFor(area, cell, time);
        return (
          <td key={i} className={`sch-cell ${isSelected ? 'sch-cell-on' : ''} ${isMatch ? 'sch-cell-match' : ''} ${elite ? 'sch-cell-elite' : ''}`}>
            <button type="button" onClick={() => onClick(cell, time, i)} className="sch-cell-btn">
              <div className="sch-cell-name">{cell}</div>
              {coach && <div className="sch-cell-coach">{coach}</div>}
            </button>
          </td>
        );
      })}
    </tr>
  );
}
