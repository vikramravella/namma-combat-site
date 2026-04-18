'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

const PrimaryBtn = ({ children, onClick, href, style }) => {
  const [h, setH] = useState(false);
  const commonStyle = { fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.cream, background: h ? '#7A2A18' : T.rust, border: 'none', padding: '14px 32px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5, textDecoration: 'none', display: 'inline-block', ...style };
  if (href) return (<a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={commonStyle}>{children}</a>);
  return (<button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={commonStyle}>{children}</button>);
};

// Arena schedule data
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

// Sanctuary schedule data
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

// Coach assignments (combat)
const combatCoach = {
  'Boxing': 'Coach Packiarajan',
  'Kickboxing': 'Coach Kantharaj',
  'Jiu-Jitsu': 'Coach Kantharaj',
  'Wrestling': 'Coach Venkatesh',
  'Judo': 'Coach Kantharaj',
  'MMA': 'Coach Kantharaj',
  'Elite Combat/MMA': 'Kantharaj, Packiarajan & Venkatesh',
  'Open Mat': 'Open training',
  'Workshop': 'Guest coaches',
};

// Coach assignments (sanctuary) - 8 PM Elite S&C has Naeem + Spoorthi + Manoj, morning Elite has Spoorthi & Manoj
const sanctuaryCoach = (className, time) => {
  if (className === 'Elite S&C' && time === '20:00') return 'Naeem, Spoorthi & Manoj';
  if (className === 'Workshop') return 'Guest coaches';
  return 'Spoorthi & Manoj';
};

const isElite = (v) => v.toLowerCase().includes('elite');
const isEmpty = (v) => !v || v.trim() === '';

function ScheduleTable({ title, schedule, type }) {
  const getCoach = (className, time) => {
    if (isEmpty(className)) return '';
    if (type === 'combat') return combatCoach[className] || '';
    return sanctuaryCoach(className, time);
  };

  const renderRow = (row) => {
    const [time, ...cells] = row;
    return (
      <tr key={time}>
        <td style={{ padding: '14px 10px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.rust, textAlign: 'center', background: T.warm, borderBottom: `1px solid ${T.border}`, minWidth: 65, letterSpacing: 0.5 }}>{time}</td>
        {cells.map((cell, i) => {
          if (isEmpty(cell)) {
            return <td key={i} style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11, fontStyle: 'italic', fontFamily: T.fontBody }}>—</td>;
          }
          const elite = isElite(cell);
          const coach = getCoach(cell, time);
          return (
            <td key={i} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`, background: elite ? 'rgba(227,199,104,0.12)' : 'transparent', verticalAlign: 'middle' }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: 0.3, marginBottom: 3, textTransform: 'uppercase' }}>{cell}</div>
              {elite && <div style={{ fontFamily: T.fontBody, fontSize: 9, color: T.rust, fontWeight: 700, letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' }}>Advanced</div>}
              {coach && <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.textLight, lineHeight: 1.3 }}>{coach}</div>}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 900, color: T.text, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 2 }}>{title}</h2>
      <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, margin: '0 0 20px', letterSpacing: 0.5 }}>{type === 'combat' ? 'Combat Sports Timetable' : 'Strength & Conditioning Timetable'}</p>
      <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 8, background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr>
              {schedule.header.map((h, i) => (
                <th key={i} style={{ padding: '14px 10px', fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, color: i === 0 ? T.rust : T.text, textAlign: 'center', background: i === 0 ? T.warm : T.gold + '33', borderBottom: `2px solid ${T.rust}`, letterSpacing: 2, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.morning.map(renderRow)}
            <tr>
              <td colSpan={8} style={{ padding: '8px 12px', borderTop: `2px dashed ${T.gold}`, borderBottom: `2px dashed ${T.gold}`, textAlign: 'center', fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase', background: T.cream }}>Afternoon Break</td>
            </tr>
            {schedule.evening.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(true); }, []);

  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');@font-face{font-family:'Materia Pro';src:url('/fonts/MateriaPro-Bold.otf') format('opentype');font-weight:700;font-style:normal;font-display:swap;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:${T.cream};color:${T.text};-webkit-font-smoothing:antialiased;}`}</style>
      <div style={{ minHeight: '100vh', background: T.cream }}>
        {/* Logo bar */}
        <div style={{ background: T.cream, padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center' }}>
          <a href="/"><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a>
        </div>

        {/* Hero */}
        <div style={{ padding: '56px 24px 32px', maxWidth: 1100, margin: '0 auto', textAlign: 'center', opacity: v?1:0, transform: v?'translateY(0)':'translateY(20px)', transition: 'all 0.6s ease' }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>Weekly Timetable</p>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>Train every day,<br/>on your schedule.</h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textLight, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>Our doors open at 6 AM. Choose any class that fits your day. Your membership gives you access across both floors — train combat in the morning, strength in the evening, or the other way around.</p>
          <PrimaryBtn href="/trial" style={{ padding: '16px 36px', fontSize: 14 }}>Book your free trial</PrimaryBtn>
        </div>

        {/* Schedule tables */}
        <div style={{ padding: '32px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
          <ScheduleTable title="The Arena" schedule={arenaSchedule} type="combat" />
          <ScheduleTable title="The Sanctuary" schedule={sanctuarySchedule} type="sanctuary" />

          {/* Notes */}
          <div style={{ padding: '24px 28px', background: T.warm, borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 48 }}>
            <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 2, color: T.rust, textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px' }}>Good to know</p>
            <ul style={{ margin: 0, padding: '0 0 0 18px', fontFamily: T.fontBody, fontSize: 13, color: T.textLight, lineHeight: 1.8 }}>
              <li><strong>Elite classes and Open Mat</strong> are 90-minute sessions.</li>
              <li><strong>Saturday Elite classes</strong> are held outdoors.</li>
              <li><strong>Workshops</strong> are not part of any membership. Ask us for details.</li>
              <li><strong>Kids and adults</strong> train together. No separate junior programs.</li>
              <li><strong>Schedule may adjust</strong> for holidays and special events — WhatsApp us to confirm.</li>
            </ul>
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', padding: '32px 24px 48px', background: '#fff', borderRadius: 12, border: `1px solid ${T.border}` }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 900, color: T.text, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Ready to start?</h2>
            <p style={{ fontFamily: T.fontBody, fontSize: 15, color: T.textLight, margin: '0 0 24px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>Book a free trial and experience any class on the timetable.</p>
            <PrimaryBtn href="/trial" style={{ padding: '16px 36px', fontSize: 14 }}>Book your free trial</PrimaryBtn>
          </div>
        </div>

        {/* Location snippet */}
        <div style={{ padding: '0 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ padding: '18px 22px', background: T.warm, borderRadius: 8, border: `1px solid ${T.border}`, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <div>
              <p style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, margin: '0 0 2px' }}>10, 80 Feet Road, 4th Block Koramangala</p>
              <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>Mon–Sat: 6 AM – 9 PM</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: '20px 24px', textAlign: 'center', background: T.cream }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600 }}>Skill · Strength · Sanctuary</p>
          <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>© 2026 Namma Combat. All rights reserved.</p>
        </div>

        {/* Floating WhatsApp */}
        <a href="https://wa.me/917770087700" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, background: '#25D366', color: '#fff', borderRadius: 28, padding: '12px 22px', fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(37,211,102,0.25)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.312-.726-5.994-1.956l-.42-.312-2.643.886.886-2.643-.312-.42A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          WhatsApp us
        </a>
      </div>
    </>
  );
}
