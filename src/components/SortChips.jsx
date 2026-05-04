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

// Valid sort keys — narrow the surface so an unknown ?sort=foo doesn't
// fall through silently. Values map to Prisma orderBy clauses.
export const SORT_KEYS = ['modified', 'created'];

export function sortToOrderBy(sort) {
  switch (sort) {
    case 'created': return { createdAt: 'desc' };
    case 'modified':
    case undefined:
    case '':
    case null:
      return { updatedAt: 'desc' };
    default:
      return { updatedAt: 'desc' };
  }
}
