import Link from 'next/link';
import { db } from '@/lib/db';
import { DashFolder } from '../DashFolder';
import { istTodayWindow } from '@/lib/today-ist';
import { isHealthNoteMeaningful } from '@/lib/health-notes';
import { MarkAlertsSeenOnMount } from './MarkAlertsSeenOnMount';

// Implicitly dynamic via getServerSession() in the markAlertsSeen
// child component path.

export default async function AlertsPage() {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = istTodayWindow(now);

  const [callsCount, trialsCount, convertCount, healthCount, smokersCount, mediaCount] = await Promise.all([
    db.inquiry.count({
      where: {
        nextFollowUpAt: { lte: now },
        stage: { in: ['new', 'following_up'] },
        convertedMemberId: null,
        trials: { none: {} },
      },
    }),
    db.trial.count({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
    }),
    db.trial.count({
      where: {
        scheduledDate: { lt: todayStart },
        convertedMemberId: null,
        status: { in: ['confirmed', 'showed_up'] },
        outcome: { not: 'didnt_join' },
      },
    }),
    // Fetch then filter rather than count — noise notes ("No known
    // health conditions" etc.) need a JS-side filter to match the
    // /admin/alerts/health list. Cheap (≤ ~150 rows).
    db.member.findMany({
      where: { OR: [{ criticalHealthFlag: true }, { medicalNotes: { not: null } }] },
      select: { id: true, criticalHealthFlag: true, medicalNotes: true },
    }).then((rows) => rows.filter((m) => m.criticalHealthFlag || isHealthNoteMeaningful(m.medicalNotes)).length),
    db.member.count({ where: { smokes: true } }),
    db.member.count({ where: { mediaConsent: false } }),
  ]);

  return (
    <div className="home">
      <MarkAlertsSeenOnMount />
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin" className="prv-back">← Dashboard</Link></p>
          <h1 className="adm-page-title">Alerts</h1>
          <p className="adm-page-subtitle">Calls · Trials · Conversion · Health · Smokers · Media</p>
        </div>
      </div>

      <DashFolder counts={{
        calls: callsCount,
        trials: trialsCount,
        convert: convertCount,
        health: healthCount,
        smokers: smokersCount,
        media: mediaCount,
      }} />
    </div>
  );
}
