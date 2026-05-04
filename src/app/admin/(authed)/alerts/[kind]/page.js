import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDate, formatRelative } from '@/lib/format';
import { istTodayWindow } from '@/lib/today-ist';
import { hasMeaningfulHealthData, structuredHealthSummary } from '@/lib/health-notes';

// Alerts drilldown reads live aggregated data from Members / Trials /
// Inquiries. Render dynamic so deletions and updates appear immediately.
export const dynamic = 'force-dynamic';

// Auth check (getServerSession in the layout) keeps this page dynamic.

const KINDS = {
  calls:    { title: 'Calls today', sub: 'Follow-ups due', empty: 'Nobody to chase right now.' },
  trials:   { title: 'Trials today', sub: 'On the floor', empty: 'No trials on the floor today.' },
  convert:  { title: 'Convert from trial', sub: 'Trials waiting to become members', empty: 'No trials waiting to convert.' },
  health:   { title: 'Health alerts', sub: 'Critical flag or medical notes', empty: 'No critical health flags.' },
  smokers:  { title: 'Smokers', sub: 'Adjust cardio expectations', empty: 'No smokers on the roster.' },
  media:    { title: 'No media consent', sub: 'Do not photograph or feature', empty: 'All members OK with photos / video.' },
};

export default async function AlertKindPage({ params }) {
  const { kind } = await params;
  const meta = KINDS[kind];
  if (!meta) notFound();

  const now = new Date();
  const { start: todayStart, end: todayEnd } = istTodayWindow(now);
  const items = await fetchItems(kind, now, todayStart, todayEnd);

  return (
    <div className="home">
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin/alerts" className="prv-back">← Alerts</Link></p>
          <h1 className="adm-page-title">{meta.title}</h1>
          <p className="adm-page-subtitle">{meta.sub} · {items.length}</p>
        </div>
      </div>

      <div className="prv-table-wrap">
        {items.length === 0 ? (
          <div className="prv-empty"><p>{meta.empty}</p></div>
        ) : (
          <table className="prv-table">
            <thead><tr>{headers(kind)}</tr></thead>
            <tbody>{items.map((it) => row(kind, it))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function headers(kind) {
  if (kind === 'calls') return <><th>Name</th><th>Phone</th><th>Stage</th><th>Attempts</th><th>Due</th></>;
  if (kind === 'trials') return <><th>Name</th><th>Time</th><th>Discipline</th><th>Status</th><th>Form</th></>;
  if (kind === 'convert') return <><th>Name</th><th>Trial date</th><th>Discipline</th><th>Status</th><th>Outcome</th></>;
  if (kind === 'health') return <><th>Name</th><th>Critical</th><th>Conditions</th><th>Injuries</th><th>Medications</th><th>Notes</th></>;
  if (kind === 'smokers') return <><th>Name</th><th>Status</th></>;
  if (kind === 'media') return <><th>Name</th><th>Status</th></>;
}

function row(kind, it) {
  if (kind === 'calls') {
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/inquiries/${it.id}`} className="prv-name">{it.firstName} {it.lastName}</Link></td>
        <td className="adm-mono">{it.phone}</td>
        <td className="prv-muted">{it.stage.replace('_', ' ')}</td>
        <td className="prv-muted">{it.followUpAttempts > 0 ? `${it.followUpAttempts} prev` : 'first'}</td>
        <td className="prv-muted">{formatRelative(it.nextFollowUpAt)}</td>
      </tr>
    );
  }
  if (kind === 'trials') {
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/trials/${it.id}`} className="prv-name">{it.inquiry.firstName} {it.inquiry.lastName}</Link></td>
        <td className="adm-mono">{it.scheduledTime}</td>
        <td className="prv-muted">{it.discipline} ({it.area})</td>
        <td className="prv-muted">{it.status.replace('_', ' ')}</td>
        <td>{it.healthDecl ? <span className="prv-muted">submitted</span> : <span className="dash-pill dash-pill-warn">pending</span>}</td>
      </tr>
    );
  }
  if (kind === 'convert') {
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/trials/${it.id}`} className="prv-name">{it.inquiry.firstName} {it.inquiry.lastName}</Link></td>
        <td className="prv-muted">{formatDate(it.scheduledDate)}</td>
        <td className="prv-muted">{it.discipline}</td>
        <td className="prv-muted">{it.status.replace('_', ' ')}</td>
        <td className="prv-muted">{it.outcome ? it.outcome.replace('_', ' ') : '—'}</td>
      </tr>
    );
  }
  if (kind === 'health') {
    const cell = (v) => v ? <span className="prv-muted" style={{ whiteSpace: 'pre-wrap' }}>{v}</span> : <span className="adm-muted">—</span>;
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/members/${it.id}`} className="prv-name">{it.firstName} {it.lastName}</Link></td>
        <td>{it.criticalHealthFlag ? <span style={{ color: 'var(--rust)' }}>⚠ critical</span> : <span className="adm-muted">—</span>}</td>
        <td>{cell(it.medicalConditions)}</td>
        <td>{cell(it.injuries)}</td>
        <td>{cell(it.medications)}</td>
        <td>{cell(it.medicalNotes)}</td>
      </tr>
    );
  }
  if (kind === 'smokers') {
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/members/${it.id}`} className="prv-name">{it.firstName} {it.lastName}</Link></td>
        <td className="prv-muted">Adjust cardio expectations</td>
      </tr>
    );
  }
  if (kind === 'media') {
    return (
      <tr key={it.id}>
        <td><Link href={`/admin/members/${it.id}`} className="prv-name">{it.firstName} {it.lastName}</Link></td>
        <td className="prv-muted">Do not photograph or feature</td>
      </tr>
    );
  }
  return null;
}

async function fetchItems(kind, now, todayStart, todayEnd) {
  if (kind === 'calls') {
    return db.inquiry.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        stage: { in: ['new', 'following_up'] },
        convertedMemberId: null,
        trials: { none: {} },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      select: { id: true, firstName: true, lastName: true, phone: true, nextFollowUpAt: true, stage: true, followUpAttempts: true },
    });
  }
  if (kind === 'trials') {
    return db.trial.findMany({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { scheduledTime: 'asc' },
      select: {
        id: true, status: true, scheduledTime: true, discipline: true, area: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
        healthDecl: { select: { id: true } },
      },
    });
  }
  if (kind === 'convert') {
    return db.trial.findMany({
      where: {
        scheduledDate: { lt: todayStart },
        convertedMemberId: null,
        status: { in: ['confirmed', 'showed_up'] },
        outcome: { not: 'didnt_join' },
      },
      orderBy: { scheduledDate: 'desc' },
      select: {
        id: true, scheduledDate: true, status: true, outcome: true, discipline: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }
  if (kind === 'health') {
    const rows = await db.member.findMany({
      where: {
        OR: [
          { criticalHealthFlag: true },
          { medicalConditions: { not: null } },
          { injuries: { not: null } },
          { medications: { not: null } },
          { medicalNotes: { not: null } },
        ],
      },
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, criticalHealthFlag: true,
        medicalConditions: true, injuries: true, medications: true, medicalNotes: true,
      },
    });
    return rows.filter(hasMeaningfulHealthData);
  }
  if (kind === 'smokers') {
    return db.member.findMany({
      where: { smokes: true },
      orderBy: { joinedAt: 'desc' },
      select: { id: true, firstName: true, lastName: true },
    });
  }
  if (kind === 'media') {
    return db.member.findMany({
      where: { mediaConsent: false },
      orderBy: { joinedAt: 'desc' },
      select: { id: true, firstName: true, lastName: true },
    });
  }
  return [];
}
