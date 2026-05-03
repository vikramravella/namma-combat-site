import Link from 'next/link';

// Pure-server alert tiles. Each tile is a Link to its own list page,
// matching the rest of the admin's "click a module → land on its list"
// pattern. No inline expansion.
export function DashFolder({ counts }) {
  const tiles = [
    { key: 'calls', icon: '☎', label: 'Calls today', sub: 'Follow-ups due', tone: 'rust' },
    { key: 'trials', icon: '◇', label: 'Trials today', sub: 'On the floor', tone: 'gold' },
    { key: 'convert', icon: '↗', label: 'Convert', sub: 'Trials waiting', tone: 'rust-light' },
    { key: 'health', icon: '⚠', label: 'Health alerts', sub: 'Coach attention', tone: 'rust' },
    { key: 'smokers', icon: '◌', label: 'Smokers', sub: 'Adjust cardio', tone: 'gold' },
    { key: 'media', icon: '✕', label: 'No media', sub: 'Do not photograph', tone: 'cream' },
  ];
  return (
    <div className="home-grid dash-alerts">
      {tiles.map((t, i) => {
        const count = counts[t.key] || 0;
        return (
          <Link
            key={t.key}
            href={`/admin/alerts/${t.key}`}
            className={`home-tile home-tile-${t.tone}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className="home-tile-mark">{t.icon}</span>
            {count > 0 && <span className="home-tile-badge">{count}</span>}
            <span className="home-tile-name">{t.label}</span>
            <span className="home-tile-sub">{t.sub}</span>
          </Link>
        );
      })}
    </div>
  );
}
