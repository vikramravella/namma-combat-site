import Link from 'next/link';
import { db } from '@/lib/db';
import { DashFolder } from '../DashFolder';
import { istTodayWindow } from '@/lib/today-ist';

export const revalidate = 30;

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
    db.member.count({
      where: { OR: [{ criticalHealthFlag: true }, { medicalNotes: { not: null } }] },
    }),
    db.member.count({ where: { smokes: true } }),
    db.member.count({ where: { mediaConsent: false } }),
  ]);

  return (
    <div className="home">
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
