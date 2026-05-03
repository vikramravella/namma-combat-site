'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Branded date picker that hands back an ISO string (YYYY-MM-DD).
// Renders an input that opens an inline calendar on focus / click.
// Pass `name` to also produce a hidden input for native form submission.
export function DatePicker({ value, onChange, name, placeholder = 'Pick a date', required, min, max, className = 'adm-input' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const selectedDate = value ? parseISO(value) : undefined;
  const display = value ? formatDisplay(value) : '';

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
        <div style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 4px)', left: 0, background: 'var(--surface, #fff)', border: '1px solid var(--border, #E0D6C8)', borderRadius: 8, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <DayPicker
            mode="single"
            selected={selectedDate}
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
            startMonth={new Date(1950, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
          />
        </div>
      )}
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
