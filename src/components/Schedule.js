'use client';
import { useState } from 'react';
import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar } from './ui';

// Arena schedule
const arenaSchedule = {
  header: ['TIME', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  morning: [
    ['06:00', 'Boxing', 'Boxing', 'Wrestling', 'Boxing', 'Boxing', 'Wrestling', ''],
    ['07:00', 'Jiu-Jitsu', 'Kickboxing', 'Boxing', 'Jiu-Jitsu', 'Kickboxing', 'Boxing', ''],
    ['08:00', 'Wrestling', 'Jiu-Jitsu', 'MMA', 'Wrestling', 'Jiu-Jitsu', 'Workshop', ''],
    ['09:00', 'Open Mat', 'Open Mat', 'Open Mat', 'Open Mat', 'Open Mat', 'Workshop', 'Workshop'],
  ],
  evening: [
    ['16:00', 'Judo', 'Judo', 'Judo', 'Judo', 'Judo', 'Judo', ''],
    ['17:00', 'Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', ''],
    ['18:00', 'Boxing', 'Boxing', 'Jiu-Jitsu', 'Boxing', 'Boxing', 'Jiu-Jitsu', ''],
    ['19:00', 'Kickboxing', 'Jiu-Jitsu', 'Boxing', 'Kickboxing', 'Jiu-Jitsu', 'Boxing', ''],
    ['20:00', 'Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', '', ''],
  ],
};

const sanctuarySchedule = {
  header: ['TIME', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  morning: [
    ['06:00', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Reset & Play', ''],
    ['07:00', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'Reset & Play', ''],
    ['08:00', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Reset & Play', ''],
    ['09:00', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Reset & Play', 'Workshop'],
  ],
  evening: [
    ['17:00', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', '', ''],
    ['18:00', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', '', ''],
    ['19:00', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', '', ''],
    ['20:00', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', '', ''],
  ],
};

const combatCoach = {
  'Boxing': 'Coach Rajan',
  'Kickboxing': 'Coach Kantharaj',
  'Jiu-Jitsu': 'Coach Kantharaj',
  'Wrestling': 'Coach Venkatesh',
  'Judo': 'Coach Kantharaj',
  'MMA': 'Coach Kantharaj',
  'Elite Combat/MMA': 'Kantharaj, Rajan & Venkatesh',
  'Open Mat': 'Open training',
  'Workshop': 'Guest coaches',
};

const sanctuaryCoach = (className, time) => {
  if (className === 'Elite S&C' && time === '20:00') return 'Naeem, Spoorthi or Manoj';
  if (className === 'Workshop') return 'Guest coaches';
  return 'Spoorthi or Manoj';
};

const isElite = (v) => v && v.toLowerCase().includes('elite');
const isEmpty = (v) => !v || v.trim() === '';

function Table({ title, subtitle, schedule, type }) {
  const getCoach = (className, time) => {
    if (isEmpty(className)) return '';
    if (type === 'combat') return combatCoach[className] || '';
    return sanctuaryCoach(className, time);
  };

  const renderRow = (row) => {
    const [time, ...cells] = row;
    return (
      <tr key={time}>
        <td style={{ padding: '14px 10px', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--rust)', textAlign: 'center', background: 'var(--warm)', borderBottom: '1px solid var(--border)', minWidth: 65, letterSpacing: 0.5 }}>{time}</td>
        {cells.map((cell, i) => {
          if (isEmpty(cell)) {
            return <td key={i} style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>—</td>;
          }
          const elite = isElite(cell);
          const coach = getCoach(cell, time);
          return (
            <td key={i} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', background: elite ? 'rgba(227,199,104,0.12)' : 'transparent', verticalAlign: 'middle' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.3, marginBottom: 3, textTransform: 'uppercase' }}>{cell}</div>
              {elite && <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--rust)', fontWeight: 700, letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' }}>Advanced</div>}
              {coach && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-light)', lineHeight: 1.3 }}>{coach}</div>}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 2 }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', margin: '0 0 20px', letterSpacing: 0.5 }}>{subtitle}</p>
      <div className="nc-scroll-hint" style={{ display: 'none', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>← Swipe to see all days →</div>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr>
              {schedule.header.map((h, i) => (
                <th key={i} style={{ padding: '14px 10px', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: i === 0 ? 'var(--rust)' : 'var(--text)', textAlign: 'center', background: i === 0 ? 'var(--warm)' : 'rgba(227,199,104,0.2)', borderBottom: '2px solid var(--rust)', letterSpacing: 2, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.morning.map(renderRow)}
            <tr>
              <td colSpan={8} style={{ padding: '8px 12px', borderTop: '2px dashed var(--gold)', borderBottom: '2px dashed var(--gold)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', background: 'var(--cream)' }}>Afternoon Break</td>
            </tr>
            {schedule.evening.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Schedule() {
  return (
    <Section id="schedule" bg="var(--cream)">
      <Reveal>
        <Eyebrow>Weekly Timetable</Eyebrow>
        <Heading>Train every day, on your schedule.</Heading>
        <SubHeading>Our doors open at 6 AM. Choose any class that fits your day.</SubHeading>
        <GoldBar />
      </Reveal>

      <Reveal delay={0.1}>
        <div style={{ marginTop: 16 }}>
          <Table title="The Arena" subtitle="Combat Sports Timetable" schedule={arenaSchedule} type="combat" />
          <Table title="The Sanctuary" subtitle="Strength & Conditioning Timetable" schedule={sanctuarySchedule} type="sanctuary" />

          <div style={{ padding: '24px 28px', background: 'var(--warm)', borderRadius: 8, border: '1px solid var(--border)', maxWidth: 780 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 2, color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px' }}>Good to know</p>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8 }}>
              <li><strong>Elite classes and Open Mat</strong> are 90-minute sessions.</li>
              <li><strong>Saturday Elite classes</strong> are held outdoors.</li>
              <li><strong>Workshops</strong> are not part of any membership. Ask us for details.</li>
              <li><strong>Schedule may adjust</strong> for holidays and special events — WhatsApp us to confirm.</li>
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* mobile swipe hint */
