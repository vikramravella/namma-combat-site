import Link from 'next/link';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';
import { istTodayWindow } from '@/lib/today-ist';

export const revalidate = 30;

const MODULES = [
  { href: '/admin/alerts',      label: 'Alerts',      sub: 'Calls · Trials · Health', tone: 'rust',     emoji: '⏻' },
  { href: '/admin/inquiries',   label: 'Inquiries',   sub: 'Leads & follow-ups',     tone: 'gold',     emoji: '✦' },
  { href: '/admin/trials',      label: 'Trials',      sub: 'Bookings & outcomes',    tone: 'rust-light', emoji: '◇' },
  { href: '/admin/members',     label: 'Members',     sub: 'The roster',             tone: 'cream',    emoji: '◯' },
  { href: '/admin/receipts',    label: 'Receipts',    sub: 'Invoices & payments',    tone: 'warm',     emoji: '✧' },
  { href: '/admin/assessments', label: 'Assessments', sub: 'Posture & progress',     tone: 'gold',     emoji: '△' },
  { href: '/admin/reports',     label: 'Reports',     sub: 'Money & numbers',        tone: 'rust-light', emoji: '☷' },
];

export default async function HomePage() {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = istTodayWindow(now);

  // Read the "last seen inquiries" cookie so we can highlight only the
  // website leads that arrived since Vinod last opened the inquiries list.
  const lastSeenRaw = (await cookies()).get('last-seen-inq')?.value;
  const lastSeenInq = lastSeenRaw ? new Date(Number(lastSeenRaw)) : new Date(0);

  const [
    callsToday,
    todaysTrials,
    conversionFollowUps,
    healthAlerts,
    smokers,
    noMediaConsent,
    countNewInquiries,
  ] = await Promise.all([
    // 1. Calls to make today — leads with overdue follow-ups
    db.inquiry.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        stage: { in: ['new', 'following_up'] },
        convertedMemberId: null,
        trials: { none: {} },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 10,
      select: { id: true, firstName: true, lastName: true, phone: true, nextFollowUpAt: true, stage: true, followUpAttempts: true },
    }),
    // 2. Trials scheduled for today
    db.trial.findMany({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { scheduledTime: 'asc' },
      select: {
        id: true,
        status: true,
        scheduledTime: true,
        discipline: true,
        area: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
        healthDecl: { select: { id: true } },
      },
    }),
    // 3. Trials past their date that haven't converted yet — chase for conversion
    db.trial.findMany({
      where: {
        scheduledDate: { lt: todayStart },
        convertedMemberId: null,
        status: { in: ['confirmed', 'showed_up'] },
        outcome: { not: 'didnt_join' },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 10,
      select: {
        id: true,
        scheduledDate: true,
        status: true,
        outcome: true,
        discipline: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
    // 4. Members with critical health flag or medical notes
    db.member.findMany({
      where: {
        OR: [
          { criticalHealthFlag: true },
          { medicalNotes: { not: null } },
        ],
      },
      orderBy: { joinedAt: 'desc' },
      take: 10,
      select: { id: true, firstName: true, lastName: true, criticalHealthFlag: true, medicalNotes: true },
    }),
    // 5. Smoker members — coach attention for cardio plan
    db.member.findMany({
      where: { smokes: true },
      orderBy: { joinedAt: 'desc' },
      take: 10,
      select: { id: true, firstName: true, lastName: true },
    }),
    // 6. Members who declined photo / video consent
    db.member.findMany({
      where: { mediaConsent: false },
      orderBy: { joinedAt: 'desc' },
      take: 10,
      select: { id: true, firstName: true, lastName: true },
    }),
    // Module-tile notification counts
    db.inquiry.count({
      where: {
        source: 'website',
        createdAt: { gt: lastSeenInq },
        convertedMemberId: null,
        trials: { none: {} },
      },
    }),
  ]);

  const healthAlertsFiltered = healthAlerts.filter((m) => m.criticalHealthFlag || (m.medicalNotes && m.medicalNotes.trim()));

  const totalAlerts =
    callsToday.length +
    todaysTrials.length +
    conversionFollowUps.length +
    healthAlertsFiltered.length +
    smokers.length +
    noMediaConsent.length;

  // Badges only on Alerts and Inquiries. The other modules don't need a
  // pile of red bubbles — the alert dashboard already surfaces what's
  // urgent across the whole admin.
  const moduleCounts = {
    '/admin/alerts': totalAlerts,
    '/admin/inquiries': countNewInquiries,
  };

  const greeting = greet(now);
  const dateLine = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' });

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
        {MODULES.map((m, i) => {
          const count = moduleCounts[m.href] || 0;
          return (
            <Link key={m.href} href={m.href} className={`home-tile home-tile-${m.tone}`} style={{ animationDelay: `${i * 40}ms` }}>
              <span className="home-tile-mark">{m.emoji}</span>
              {count > 0 && <span className="home-tile-badge">{count}</span>}
              <span className="home-tile-name">{m.label}</span>
              <span className="home-tile-sub">{m.sub}</span>
            </Link>
          );
        })}
      </div>

      <div className="home-foot">
        <img src="/seal.svg" alt="Namma Combat" className="home-foot-seal" />
        <p className="home-foot-tag"><em>Skill · Strength · Sanctuary</em></p>
      </div>
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
