import Link from 'next/link';

// Two-option sort selector. Server component — renders as Link chips so
// sort state lives in the URL and the sort respects whatever filter / page
// the user is on.
//
// Pass current `sort` (the searchParams.sort value, defaults to 'modified')
// and the rest of the searchParams so we can preserve them when building
// the chip URLs.
const OPTIONS = [
  { key: 'modified', label: 'Recently modified' },
  { key: 'created', label: 'Date created' },
];

export function SortChips({ sort = 'modified', sp = {} }) {
  function hrefFor(value) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp || {})) {
      if (v && typeof v === 'string' && k !== 'sort') next.set(k, v);
    }
    if (value && value !== 'modified') next.set('sort', value);
    const s = next.toString();
    return s ? `?${s}` : '?';
  }
  return (
    <div className="prv-chips" style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Sort by</span>
      {OPTIONS.map((o) => (
        <Link key={o.key} href={hrefFor(o.key)} className={`prv-chip ${sort === o.key ? 'prv-chip-on' : ''}`} scroll={false}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}

// Map a sort key to a Prisma orderBy clause. The fallback for invalid
// keys is 'modified'.
export function sortToOrderBy(sort) {
  if (sort === 'created') return { createdAt: 'desc' };
  return { updatedAt: 'desc' };
}
