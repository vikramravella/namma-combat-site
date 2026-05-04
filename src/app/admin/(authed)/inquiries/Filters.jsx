'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { INQUIRY_STAGES } from '@/lib/constants';
import { ChipLink } from '@/components/ChipLink';

export function Filters({ counts }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const stage = params.get('stage') || '';
  const queue = params.get('queue') || '';
  const initialQ = params.get('q') || '';

  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set('q', q); else next.delete('q');
      router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key, value) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  const hasActive = stage || queue || q;

  return (
    <>
      <div className="prv-toolbar">
        <div className="prv-search-wrap">
          <svg className="prv-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone"
            className="prv-search"
          />
        </div>
        {hasActive && (
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="adm-btn adm-btn-secondary adm-btn-sm">
            Clear
          </button>
        )}
      </div>

      <div className="prv-chips">
        <ChipLink href={hrefFor(params, { stage: '', queue: '' })} on={!stage && !queue} label="All" count={counts['']} />
        {counts._due > 0 && (
          <ChipLink href={hrefFor(params, { queue: 'due', stage: '' })} on={queue === 'due'} label="Follow-ups due" count={counts._due} pulse />
        )}
        {INQUIRY_STAGES.map((s) => (
          <ChipLink key={s.key} href={hrefFor(params, { stage: s.key, queue: '' })} on={stage === s.key && !queue} label={s.label} count={counts[s.key] ?? 0} />
        ))}
      </div>
    </>
  );
}

function hrefFor(params, overrides) {
  const next = new URLSearchParams(params.toString());
  for (const [k, v] of Object.entries(overrides)) {
    if (v) next.set(k, v); else next.delete(k);
  }
  const s = next.toString();
  return s ? `?${s}` : '?';
}
