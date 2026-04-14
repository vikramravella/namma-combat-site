'use client';
import { useState } from 'react';
import { Reveal, Section, Eyebrow, Heading, Body, PhotoBox } from './ui';

function DCard({ name, tagline, delay = 0 }) {
  const [h, setH] = useState(false);
  return (
    <Reveal delay={delay}>
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--cream)',
        cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s',
        transform: h ? 'translateY(-3px)' : 'none', boxShadow: h ? '0 6px 20px rgba(44,35,24,0.06)' : 'none',
      }}>
        <PhotoBox label={name} h={160} style={{ borderRadius: 0, borderBottom: '1px solid rgba(224,214,200,0.3)' }} />
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>{tagline}</p>
        </div>
      </div>
    </Reveal>
  );
}

export default function Arena() {
  const d = [
    ['Boxing', 'The sweet science. Footwork, mechanics, and ultimate stress relief.'],
    ['Kickboxing', 'Dynamic striking. Cardiovascular endurance and flexibility.'],
    ['MMA', 'The ultimate integration of all combat ranges.'],
    ['Brazilian Jiu-Jitsu', 'Human chess. Leverage allows a smaller person to control a larger opponent.'],
    ['Wrestling', 'Immense functional strength, mental toughness, and positional control.'],
    ['Judo', 'The gentle way. Throws, sweeps, and balance mastery.'],
  ];
  return (
    <Section id="arena" bg="var(--cream)">
      <Reveal><Eyebrow>The arena · combat floor</Eyebrow><Heading>Master the skill.</Heading>
        <Body style={{ maxWidth: 560 }}>Premium hybrid mats and a full-size fight ring. Safe for a beginner&apos;s first day and rigorous enough for a pro&apos;s fight camp.</Body>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {d.map(([n, t], i) => <DCard key={n} name={n} tagline={t} delay={i * 0.05} />)}
      </div>
    </Section>
  );
}
