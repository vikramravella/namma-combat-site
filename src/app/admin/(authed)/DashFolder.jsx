'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDate, formatRelative } from '@/lib/format';

// Alert tiles — same visual language as the module tiles below, but each
// tile carries a notification badge and clicks expand a details panel
// inline (no navigation away from the dashboard).
export function DashFolder({ data }) {
  const tiles = [
    { key: 'calls', icon: '☎', label: 'Calls today', sub: 'Follow-ups due', tone: 'rust', items: data.callsToday, empty: 'Nobody to chase right now.' },
    { key: 'trials', icon: '◇', label: 'Trials today', sub: 'On the floor', tone: 'gold', items: data.todaysTrials, empty: 'No trials on the floor today.' },
    { key: 'convert', icon: '↗', label: 'Convert', sub: 'Trials waiting', tone: 'rust-light', items: data.conversionFollowUps, empty: 'No trials waiting to convert.' },
    { key: 'health', icon: '⚠', label: 'Health alerts', sub: 'Coach attention', tone: 'rust', items: data.healthAlerts, empty: 'No critical health flags.' },
    { key: 'smokers', icon: '◌', label: 'Smokers', sub: 'Adjust cardio', tone: 'gold', items: data.smokers, empty: 'No smokers on the roster.' },
    { key: 'media', icon: '✕', label: 'No media', sub: 'Do not photograph', tone: 'cream', items: data.noMediaConsent, empty: 'All members OK with photos / video.' },
  ];

  const initial = tiles.reduce((best, t) => (t.items.length > best.items.length ? t : best), tiles[0]).key;
  const [active, setActive] = useState(initial);
  const tile = tiles.find((t) => t.key === active);

  return (
    <>
      <div className="home-grid dash-alerts" style={{ marginBottom: 28 }}>
        {tiles.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`home-tile home-tile-${t.tone} dash-alert-tile ${t.key === active ? 'dash-alert-on' : ''}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className="home-tile-mark">{t.icon}</span>
            {t.items.length > 0 && <span className="home-tile-badge">{t.items.length}</span>}
            <span className="home-tile-name">{t.label}</span>
            <span className="home-tile-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      <div className="dash-alert-panel" key={tile.key}>
        <div className="dash-alert-panel-head">
          <span className="dash-alert-panel-icon" aria-hidden>{tile.icon}</span>
          <span className="dash-alert-panel-title">{tile.label}</span>
          <span className="dash-alert-panel-count">{tile.items.length}</span>
        </div>
        {tile.items.length === 0 ? (
          <p className="dash-folder-empty">{tile.empty}</p>
        ) : (
          <div className="dash-folder-list">{renderRows(tile.key, tile.items)}</div>
        )}
      </div>
    </>
  );
}

function renderRows(kind, items) {
  if (kind === 'calls') {
    return items.map((i) => (
      <Link key={i.id} href={`/admin/inquiries/${i.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">{i.firstName} {i.lastName}</div>
          <div className="dash-row-sub adm-mono">{i.phone}</div>
        </div>
        <div className="dash-row-meta">{i.followUpAttempts > 0 ? `${i.followUpAttempts} prev` : 'first attempt'}</div>
      </Link>
    ));
  }
  if (kind === 'trials') {
    return items.map((t) => (
      <Link key={t.id} href={`/admin/trials/${t.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">{t.inquiry.firstName} {t.inquiry.lastName}</div>
          <div className="dash-row-sub">
            {t.scheduledTime} · {t.discipline} ({t.area})
            {!t.healthDecl && <span className="dash-pill dash-pill-warn"> form pending</span>}
          </div>
        </div>
        <div className={`dash-row-meta dash-row-meta-${t.status}`}>{t.status.replace('_', ' ')}</div>
      </Link>
    ));
  }
  if (kind === 'convert') {
    return items.map((t) => (
      <Link key={t.id} href={`/admin/trials/${t.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">{t.inquiry.firstName} {t.inquiry.lastName}</div>
          <div className="dash-row-sub">
            {t.discipline} · {formatDate(t.scheduledDate)}
            {t.outcome && <span> · {t.outcome.replace('_', ' ')}</span>}
          </div>
        </div>
        <div className="dash-row-meta">{formatRelative(t.scheduledDate)}</div>
      </Link>
    ));
  }
  if (kind === 'health') {
    return items.map((m) => (
      <Link key={m.id} href={`/admin/members/${m.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">
            {m.criticalHealthFlag && <span className="dash-icon" aria-hidden style={{ color: 'var(--rust)' }}>⚠</span>}
            {m.firstName} {m.lastName}
          </div>
          {m.medicalNotes && <div className="dash-row-sub" style={{ whiteSpace: 'normal' }}>{m.medicalNotes}</div>}
        </div>
      </Link>
    ));
  }
  if (kind === 'smokers') {
    return items.map((m) => (
      <Link key={m.id} href={`/admin/members/${m.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">{m.firstName} {m.lastName}</div>
          <div className="dash-row-sub">Adjust cardio expectations</div>
        </div>
      </Link>
    ));
  }
  if (kind === 'media') {
    return items.map((m) => (
      <Link key={m.id} href={`/admin/members/${m.id}`} className="dash-row">
        <div>
          <div className="dash-row-name">{m.firstName} {m.lastName}</div>
          <div className="dash-row-sub">Do not photograph or feature</div>
        </div>
      </Link>
    ));
  }
  return null;
}
