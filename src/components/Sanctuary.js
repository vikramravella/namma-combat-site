'use client';
import { useState } from 'react';
import { Reveal, Section, Eyebrow, Heading, Body, PhotoBox } from './ui';

function DCard({ name, tagline, href, delay = 0 }) {
  const [h, setH] = useState(false);
  return (
    <Reveal delay={delay}>
      <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        display: 'block', textDecoration: 'none', color: 'inherit',
        borderRadius: 8, overflow: 'hidden', border: h ? '1px solid var(--gold)' : '1px solid var(--border)', background: 'var(--cream)',
        cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
        transform: h ? 'translateY(-3px)' : 'none', boxShadow: h ? '0 8px 24px rgba(44,35,24,0.08)' : 'none',
        position: 'relative',
      }}>
        <PhotoBox label={name} h={160} style={{ borderRadius: 0, borderBottom: '1px solid rgba(224,214,200,0.3)' }} />
        <div style={{ padding: '14px 16px', minHeight: 88 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>{tagline}</p>
        </div>
        <span style={{ position: 'absolute', top: 12, right: 14, fontSize: 18, color: 'var(--gold)', opacity: h ? 1 : 0, transform: h ? 'translateX(0)' : 'translateX(-6px)', transition: 'all 0.3s ease' }}>→</span>
      </a>
    </Reveal>
  );
}

export default function Sanctuary() {
  const d = [
    ['Strength & Conditioning', 'Sport-specific lifting for explosive power, longevity, and lasting athletic performance.', '/strength'],
    ['Animal Flow', 'Ground-based movement. Joint health, mobility, and full-body coordination.', '/animal-flow'],
    ['HIIT', 'Short, sharp bursts on Hammer Strength air bikes and Technogym rowers.', '/hiit'],
    ['Olympic Weightlifting', 'Snatch and clean & jerk. Explosive coordination at the highest level.', '/olympic-lifting'],
  ];
  return (
    <Section id="sanctuary" bg="var(--warm)">
      <Reveal><Eyebrow>The sanctuary · strength floor</Eyebrow><Heading>Build the machine.</Heading>
        <Body style={{ maxWidth: 560 }}>Technogym Skill Row, Skill Ski, Hammer Strength air bikes, custom stainless steel squat racks — equipment you won&apos;t find in a typical combat academy. Open floor access included with every membership.</Body>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {d.map(([n, t, href], i) => <DCard key={n} name={n} tagline={t} href={href} delay={i * 0.05} />)}
      </div>
    </Section>
  );
}
