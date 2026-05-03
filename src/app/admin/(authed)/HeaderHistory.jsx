'use client';
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fetchHistory } from './history/actions';
import { formatRelative } from '@/lib/format';

// Clock-icon next to the search icon. Click → modal with the last 25
// events across inquiries + trials. Same overlay pattern as HeaderSearch.
export function HeaderHistory() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState(null); // null = not yet loaded

  useEffect(() => {
    if (!open) return;
    if (events !== null) return;
    startTransition(async () => {
      const r = await fetchHistory();
      setEvents(r);
    });
  }, [open, events]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function pick(href) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="adm-search-icon-btn"
        aria-label="Recent activity"
        title="Recent activity"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>

      {open && (
        <div className="adm-search-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="adm-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="adm-search-modal-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto', color: 'var(--text-muted)' }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: 1, textTransform: 'uppercase' }}>Recent activity</div>
              <kbd className="adm-search-kbd">esc</kbd>
            </div>
            <div className="adm-search-modal-results">
              {events === null ? (
                <p className="adm-search-empty">Loading…</p>
              ) : events.length === 0 ? (
                <p className="adm-search-empty">No activity yet.</p>
              ) : (
                <ol className="dash-feed-list" style={{ padding: '4px 8px 8px' }}>
                  {events.map((e) => (
                    <li key={e.id} className="dash-feed-item">
                      <button type="button" onClick={() => pick(e.href)} className="dash-feed-link" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                        <span className={`dash-feed-dot dash-feed-dot-${e.kind}`} aria-hidden />
                        <div className="dash-feed-body">
                          <div className="dash-feed-head">
                            <span className="dash-feed-label">{e.label}</span>
                            <span className="dash-feed-time">{formatRelative(e.when)}</span>
                          </div>
                          <div className="dash-feed-meta">
                            <span className="dash-feed-who">{e.who}</span>
                            {e.detail && <span className="dash-feed-detail">· {e.detail}</span>}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
