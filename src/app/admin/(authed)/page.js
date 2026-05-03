import Link from 'next/link';
import { db } from '@/lib/db';
import { fullName, formatDate, formatRelative } from '@/lib/format';

// Cache the dashboard for 30s — Vinod refreshes the page often, but the
// data shape doesn't change minute-to-minute. Inquiry/trial creates revalidate
// on the relevant routes anyway.
export const revalidate = 30;

const MODULES = [
  { href: '/admin/inquiries',   label: 'Inquiries',   sub: 'Leads & follow-ups',     tone: 'rust',     emoji: '✦' },
  { href: '/admin/trials',      label: 'Trials',      sub: 'Bookings & outcomes',    tone: 'gold',     emoji: '◇' },
  { href: '/admin/members',     label: 'Members',     sub: 'The roster',             tone: 'cream',    emoji: '◯' },
  { href: '/admin/receipts',    label: 'Receipts',    sub: 'Invoices & payments',    tone: 'warm',     emoji: '✧' },
  { href: '/admin/assessments', label: 'Assessments', sub: 'Posture & progress',     tone: 'gold',     emoji: '△' },
  { href: '/admin/reports',     label: 'Reports',     sub: 'Money & numbers',        tone: 'rust-light', emoji: '☷' },
];

export default async function HomePage() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

  const [inquiryFollowUps, trialFollowUps, todaysTrials, healthAlerts, mediaFlags, recentInquiryEvents, recentTrialEvents] = await Promise.all([
    db.inquiry.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        stage: { in: ['new', 'following_up'] },
        convertedMemberId: null,
        trials: { none: {} },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 8,
      select: { id: true, firstName: true, lastName: true, phone: true, nextFollowUpAt: true, stage: true },
    }),
    db.trial.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        convertedMemberId: null,
        status: { in: ['no_show', 'booked'] },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 6,
      select: {
        id: true,
        nextFollowUpAt: true,
        status: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
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
    db.member.findMany({
      where: {
        OR: [
          { criticalHealthFlag: true },
          { medicalNotes: { not: null } },
        ],
      },
      orderBy: { joinedAt: 'desc' },
      take: 8,
      select: { id: true, firstName: true, lastName: true, criticalHealthFlag: true, medicalNotes: true },
    }),
    db.member.findMany({
      where: { mediaConsent: false },
      orderBy: { joinedAt: 'desc' },
      take: 8,
      select: { id: true, firstName: true, lastName: true },
    }),
    db.inquiryEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { inquiry: { select: { id: true, firstName: true, lastName: true } } },
    }),
    db.trialEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { trial: { select: { id: true, inquiry: { select: { firstName: true, lastName: true } } } } },
    }),
  ]);

  // Filter out medical notes that are blank strings (Prisma's not:null doesn't
  // exclude empty strings).
  const healthAlertsFiltered = healthAlerts.filter((m) => m.criticalHealthFlag || (m.medicalNotes && m.medicalNotes.trim()));

  // Merge + sort the two event streams into one feed.
  const feed = [
    ...recentInquiryEvents.map((e) => ({
      id: 'i' + e.id,
      when: e.createdAt,
      label: e.label,
      detail: e.detail,
      type: e.type,
      who: `${e.inquiry.firstName} ${e.inquiry.lastName}`,
      href: `/admin/inquiries/${e.inquiryId}`,
      kind: 'inquiry',
    })),
    ...recentTrialEvents.map((e) => ({
      id: 't' + e.id,
      when: e.createdAt,
      label: e.label,
      detail: e.detail,
      type: e.type,
      who: `${e.trial.inquiry.firstName} ${e.trial.inquiry.lastName}`,
      href: `/admin/trials/${e.trialId}`,
      kind: 'trial',
    })),
  ].sort((a, b) => new Date(b.when) - new Date(a.when)).slice(0, 12);

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

      <div className="dash-grid">
        <DashCard
          title="Follow-ups due"
          accent="rust"
          empty="Inbox zero — no follow-ups due."
          items={[...inquiryFollowUps, ...trialFollowUps]}
          render={(it) => {
            const isTrial = 'inquiry' in it;
            const person = isTrial ? it.inquiry : it;
            const href = isTrial ? `/admin/trials/${it.id}` : `/admin/inquiries/${it.id}`;
            return (
              <Link key={(isTrial ? 't' : 'i') + it.id} href={href} className="dash-row">
                <div>
                  <div className="dash-row-name">{person.firstName} {person.lastName}</div>
                  <div className="dash-row-sub">{isTrial ? `Trial · ${it.status}` : `Inquiry · ${it.stage.replace('_', ' ')}`}</div>
                </div>
                <div className="dash-row-meta">{formatRelative(it.nextFollowUpAt)}</div>
              </Link>
            );
          }}
        />

        <DashCard
          title={`Today · ${todaysTrials.length} trial${todaysTrials.length === 1 ? '' : 's'}`}
          accent="gold"
          empty="No trials scheduled today."
          items={todaysTrials}
          render={(t) => (
            <Link key={t.id} href={`/admin/trials/${t.id}`} className="dash-row">
              <div>
                <div className="dash-row-name">{t.inquiry.firstName} {t.inquiry.lastName}</div>
                <div className="dash-row-sub">
                  {t.discipline} · {t.scheduledTime} ({t.area})
                  {!t.healthDecl && <span className="dash-pill dash-pill-warn"> form pending</span>}
                </div>
              </div>
              <div className={`dash-row-meta dash-row-meta-${t.status}`}>{t.status}</div>
            </Link>
          )}
        />

        <DashCard
          title="Health alerts"
          accent="rust"
          empty="No health flags."
          items={healthAlertsFiltered}
          render={(m) => (
            <Link key={m.id} href={`/admin/members/${m.id}`} className="dash-row">
              <div>
                <div className="dash-row-name">
                  {m.criticalHealthFlag && <span className="dash-icon" aria-hidden>⚠</span>}
                  {m.firstName} {m.lastName}
                </div>
                {m.medicalNotes && <div className="dash-row-sub" style={{ whiteSpace: 'normal' }}>{m.medicalNotes}</div>}
              </div>
            </Link>
          )}
        />

        <DashCard
          title="No media consent"
          accent="gold"
          empty="All members OK with photos / video."
          items={mediaFlags}
          render={(m) => (
            <Link key={m.id} href={`/admin/members/${m.id}`} className="dash-row">
              <div>
                <div className="dash-row-name">
                  <span className="dash-icon" aria-hidden>📷</span>{m.firstName} {m.lastName}
                </div>
                <div className="dash-row-sub">Do not photograph or feature</div>
              </div>
            </Link>
          )}
        />
      </div>

      {feed.length > 0 && (
        <div className="dash-feed">
          <h2 className="dash-feed-title">Recent activity</h2>
          <ol className="dash-feed-list">
            {feed.map((e) => (
              <li key={e.id} className="dash-feed-item">
                <Link href={e.href} className="dash-feed-link">
                  <span className={`dash-feed-dot dash-feed-dot-${e.kind}`} aria-hidden />
                  <div className="dash-feed-body">
                    <div className="dash-feed-head">
                      <span className="dash-feed-label">{e.label}</span>
                      <span className="dash-feed-time">{formatRelative(e.when)}</span>
                    </div>
                    <div className="dash-feed-meta">
                      <span className="dash-feed-who">{e.who}</span>
                      {e.detail && <span className="dash-feed-detail">· {e.detail}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="home-grid">
        {MODULES.map((m, i) => (
          <Link key={m.href} href={m.href} className={`home-tile home-tile-${m.tone}`} style={{ animationDelay: `${i * 40}ms` }}>
            <span className="home-tile-mark">{m.emoji}</span>
            <span className="home-tile-name">{m.label}</span>
            <span className="home-tile-sub">{m.sub}</span>
          </Link>
        ))}
      </div>

      <div className="home-foot">
        <img src="/seal.svg" alt="Namma Combat" className="home-foot-seal" />
        <p className="home-foot-tag"><em>Skill · Strength · Sanctuary</em></p>
      </div>
    </div>
  );
}

function DashCard({ title, accent, items, render, empty }) {
  return (
    <div className={`dash-card dash-card-${accent}`}>
      <div className="dash-card-head">
        <span className="dash-card-title">{title}</span>
        <span className="dash-card-count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="dash-card-empty">{empty}</p>
      ) : (
        <div className="dash-card-list">{items.map(render)}</div>
      )}
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
