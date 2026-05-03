import Link from 'next/link';
import { db } from '@/lib/db';
import { DashFolder } from '../DashFolder';

export const revalidate = 30;

export default async function AlertsPage() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

  const [callsToday, todaysTrials, conversionFollowUps, healthAlerts, smokers, noMediaConsent] = await Promise.all([
    db.inquiry.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        stage: { in: ['new', 'following_up'] },
        convertedMemberId: null,
        trials: { none: {} },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 30,
      select: { id: true, firstName: true, lastName: true, phone: true, nextFollowUpAt: true, stage: true, followUpAttempts: true },
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
    db.trial.findMany({
      where: {
        scheduledDate: { lt: todayStart },
        convertedMemberId: null,
        status: { in: ['confirmed', 'showed_up'] },
        outcome: { not: 'didnt_join' },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 30,
      select: {
        id: true,
        scheduledDate: true,
        status: true,
        outcome: true,
        discipline: true,
        inquiry: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
    db.member.findMany({
      where: {
        OR: [{ criticalHealthFlag: true }, { medicalNotes: { not: null } }],
      },
      orderBy: { joinedAt: 'desc' },
      take: 50,
      select: { id: true, firstName: true, lastName: true, criticalHealthFlag: true, medicalNotes: true },
    }),
    db.member.findMany({
      where: { smokes: true },
      orderBy: { joinedAt: 'desc' },
      take: 50,
      select: { id: true, firstName: true, lastName: true },
    }),
    db.member.findMany({
      where: { mediaConsent: false },
      orderBy: { joinedAt: 'desc' },
      take: 50,
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const healthAlertsFiltered = healthAlerts.filter((m) => m.criticalHealthFlag || (m.medicalNotes && m.medicalNotes.trim()));

  return (
    <div className="home">
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href="/admin" className="prv-back">← Dashboard</Link></p>
          <h1 className="adm-page-title">Alerts</h1>
          <p className="adm-page-subtitle">Calls · Trials · Conversion · Health · Smokers · Media</p>
        </div>
      </div>

      <DashFolder data={{
        callsToday,
        todaysTrials,
        conversionFollowUps,
        healthAlerts: healthAlertsFiltered,
        smokers,
        noMediaConsent,
      }} />
    </div>
  );
}
