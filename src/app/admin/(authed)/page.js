import Link from 'next/link';

// No data queries — pure navigator. Fast as static.
export const revalidate = false;

const MODULES = [
  { href: '/admin/inquiries',   label: 'Inquiries',   sub: 'Leads & follow-ups',     tone: 'rust',     emoji: '✦' },
  { href: '/admin/trials',      label: 'Trials',      sub: 'Bookings & outcomes',    tone: 'gold',     emoji: '◇' },
  { href: '/admin/members',     label: 'Members',     sub: 'The roster',             tone: 'cream',    emoji: '◯' },
  { href: '/admin/plans',       label: 'Plans',       sub: 'Memberships',            tone: 'rust-light', emoji: '▣' },
  { href: '/admin/receipts',    label: 'Receipts',    sub: 'Invoices & payments',    tone: 'warm',     emoji: '✧' },
  { href: '/admin/assessments', label: 'Assessments', sub: 'Posture & progress',     tone: 'gold',     emoji: '△' },
  { href: '/admin/reports',     label: 'Reports',     sub: 'Money & numbers',        tone: 'rust-light', emoji: '☷' },
];

export default function HomePage() {
  const today = new Date();
  const greeting = greet(today);
  const dateLine = today.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <div className="home">
      <header className="home-mast">
        <div>
          <p className="home-eyebrow">{dateLine}</p>
          <h1 className="home-greet">{greeting}, Vinod.</h1>
        </div>
        <Link href="/admin/inquiries/new" className="home-cta">
          <span className="home-cta-plus">+</span>
          <span>New inquiry</span>
        </Link>
      </header>

      <div className="home-rule" />

      <div className="home-grid">
        {MODULES.map((m, i) => (
          <Link key={m.href} href={m.href} className={`home-tile home-tile-${m.tone}`} style={{ animationDelay: `${i * 40}ms` }}>
            <span className="home-tile-mark">{m.emoji}</span>
            <span className="home-tile-name">{m.label}</span>
            <span className="home-tile-sub">{m.sub}</span>
          </Link>
        ))}
      </div>

      <p className="home-foot">
        <span className="home-foot-mark">⌘</span>
        <em>Skill · Strength · Sanctuary</em>
      </p>
    </div>
  );
}

function greet(d) {
  const h = d.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}
