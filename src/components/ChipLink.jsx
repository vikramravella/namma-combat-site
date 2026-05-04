import Link from 'next/link';

// Pill-style filter chip used across every list module — Inquiries,
// Trials, Members, Memberships, Receipts. Single source of truth so
// the visual language stays consistent and tweaks apply everywhere.
//
// Props:
//   href       Link target (preserves searchParams via the parent).
//   on         True if this chip is the currently-applied filter.
//   label      Visible chip text.
//   count      Optional integer shown in a smaller pill on the right.
//   pulse      Optional — adds the .prv-chip-pulse class for the
//              follow-ups-due chip's gentle gold pulse.
export function ChipLink({ href, on, label, count, pulse }) {
  return (
    <Link
      href={href}
      className={`prv-chip ${on ? 'prv-chip-on' : ''} ${pulse ? 'prv-chip-pulse' : ''}`}
      scroll={false}
    >
      <span>{label}</span>
      {count !== undefined && <span className="prv-chip-count">{count}</span>}
    </Link>
  );
}
