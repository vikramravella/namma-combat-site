'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Branded date picker that hands back an ISO string (YYYY-MM-DD).
// Renders an input that opens an inline calendar on focus / click, with
// month + year dropdowns for fast jumping (good for DOB selection).
// Pass `name` to also produce a hidden input for native form submission.
export function DatePicker({ value, onChange, name, placeholder = 'Pick a date', required, min, max, className = 'adm-input' }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectedDate = value ? parseISO(value) : undefined;
  const display = value ? formatDisplay(value) : '';

  function pickToday() {
    const t = new Date();
    onChange(toISODate(t));
    setMonth(t);
    setOpen(false);
  }
  function clearDate() {
    onChange('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        readOnly
        value={display}
        onClick={() => setOpen((o) => !o)}
        placeholder={placeholder}
        required={required}
        className={className}
        style={{ cursor: 'pointer' }}
      />
      {name && <input type="hidden" name={name} value={value || ''} />}
      {open && (
        <div className="ncdp-pop" style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 4px)', left: 0, background: 'var(--surface, #fff)', border: '1px solid var(--border, #E0D6C8)', borderRadius: 8, padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 300 }}>
          <DayPicker
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => {
              if (!d) return;
              onChange(toISODate(d));
              setOpen(false);
            }}
            disabled={[
              ...(min ? [{ before: parseISO(min) }] : []),
              ...(max ? [{ after: parseISO(max) }] : []),
            ]}
            captionLayout="dropdown"
            startMonth={new Date(1940, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            showOutsideDays
            weekStartsOn={1}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border, #E0D6C8)' }}>
            <button type="button" onClick={clearDate} className="adm-btn adm-btn-secondary adm-btn-sm">Clear</button>
            <button type="button" onClick={pickToday} className="adm-btn adm-btn-secondary adm-btn-sm">Today</button>
          </div>
        </div>
      )}
      <style>{`
        .ncdp-pop .rdp-root { --rdp-accent-color: #9A3520; --rdp-accent-background-color: rgba(154,53,32,0.12); font-family: inherit; }
        .ncdp-pop .rdp-month_caption { display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ncdp-pop .rdp-dropdowns { display: flex; gap: 6px; }
        .ncdp-pop .rdp-dropdown { padding: 4px 8px; border: 1px solid var(--border, #E0D6C8); border-radius: 4px; background: #fff; font-size: 13px; cursor: pointer; }
        .ncdp-pop .rdp-day_button { font-size: 13px; }
        .ncdp-pop .rdp-day { padding: 0; }
        .ncdp-pop .rdp-nav button { background: transparent; border: 1px solid var(--border, #E0D6C8); border-radius: 4px; cursor: pointer; }
      `}</style>
    </div>
  );
}

function parseISO(s) {
  if (!s) return undefined;
  const d = new Date(s + 'T00:00:00');
  return isFinite(d) ? d : undefined;
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatDisplay(iso) {
  const d = parseISO(iso);
  if (!d) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
