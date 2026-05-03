'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDate, formatRelative } from '@/lib/format';

// One unified "folder" with tabs across the top — Calls, Trials, Convert,
// Health, Smokers, Media. The tab with the highest count is selected by
// default so the most demanding queue is what Vinod sees first.
export function DashFolder({ data }) {
  const tabs = [
    { key: 'calls', icon: '☎', label: 'Calls today', accent: 'rust', items: data.callsToday, empty: 'Nobody to chase right now.' },
    { key: 'trials', icon: '◇', label: 'Trials today', accent: 'gold', items: data.todaysTrials, empty: 'No trials on the floor today.' },
    { key: 'convert', icon: '↗', label: 'Convert', accent: 'rust', items: data.conversionFollowUps, empty: 'No trials waiting to convert.' },
    { key: 'health', icon: '⚠', label: 'Health', accent: 'rust', items: data.healthAlerts, empty: 'No critical health flags.' },
    { key: 'smokers', icon: '◌', label: 'Smokers', accent: 'gold', items: data.smokers, empty: 'No smokers on the roster.' },
    { key: 'media', icon: '✕', label: 'No media', accent: 'gold', items: data.noMediaConsent, empty: 'All members OK with photos / video.' },
  ];

  // Open on whichever tab has the most pending work — falls back to first tab.
  const initial = tabs.reduce((best, t) => (t.items.length > best.items.length ? t : best), tabs[0]).key;
  const [active, setActive] = useState(initial);
  const tab = tabs.find((t) => t.key === active);

  return (
    <div className="dash-folder">
      <div className="dash-folder-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === active}
            onClick={() => setActive(t.key)}
            className={`dash-folder-tab ${t.key === active ? 'dash-folder-tab-on' : ''} dash-folder-tab-${t.accent}`}
          >
            <span className="dash-folder-tab-icon" aria-hidden>{t.icon}</span>
            <span className="dash-folder-tab-label">{t.label}</span>
            {t.items.length > 0 && <span className="dash-folder-tab-count">{t.items.length}</span>}
          </button>
        ))}
      </div>

      <div className="dash-folder-body" role="tabpanel">
        {tab.items.length === 0 ? (
          <p className="dash-folder-empty">{tab.empty}</p>
        ) : (
          <div className="dash-folder-list">{renderRows(tab.key, tab.items)}</div>
        )}
      </div>
    </div>
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
