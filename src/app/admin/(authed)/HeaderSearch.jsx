'use client';
import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { searchPeople } from './search/actions';

// Spotlight-style search: tiny magnifying-glass icon in the header.
// Click (or ⌘K / CtrlK) opens a centered modal that filters across all
// modules. Pick a result with mouse, ↑/↓ + Enter, or Escape to close.
export function HeaderSearch() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);

  // ⌘K / CtrlK to open from anywhere; Esc to close
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    } else {
      setQ(''); setResults([]); setHighlight(0);
    }
  }, [open]);

  // Debounced lookup
  useEffect(() => {
    if (!open) return;
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await searchPeople(q);
        setResults(r);
        setHighlight(0);
      });
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  function handleKey(e) {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); pick(results[highlight]); }
  }

  function pick(r) {
    if (!r) return;
    setOpen(false);
    router.push(r.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="adm-search-icon-btn"
        aria-label="Search"
        title="Search (⌘K)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
      </button>

      {open && (
        <div className="adm-search-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="adm-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="adm-search-modal-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto', color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search name or phone…"
                className="adm-search-modal-input"
              />
              <kbd className="adm-search-kbd">esc</kbd>
            </div>
            {q.trim().length >= 2 && (
              <div className="adm-search-modal-results">
                {results.length === 0 ? (
                  <p className="adm-search-empty">No matches.</p>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.kind + r.id}
                      type="button"
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => pick(r)}
                      className={`adm-search-row ${i === highlight ? 'adm-search-row-on' : ''}`}
                    >
                      <span className="adm-search-name">{r.name}</span>
                      <span className="adm-search-meta">
                        <span className={`adm-search-kind adm-search-kind-${r.kind}`}>{r.kind}</span>
                        <span className="adm-search-sub">{r.sub}</span>
                        <span className="adm-search-phone adm-mono">{r.phone}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
