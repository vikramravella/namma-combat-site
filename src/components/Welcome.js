import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, Body } from './ui';

export default function Welcome() {
  return (
    <Section bg="var(--cream)">
      <div style={{ maxWidth: 800 }}>
        <Reveal>
          <Eyebrow>Welcome to the sanctuary</Eyebrow>
          <Heading>Your morning treadmill is boring.</Heading>
          <SubHeading>It&apos;s time to build a capable body and a focused mind.</SubHeading>
          <GoldBar />
          <Body>
            Namma Combat bridges the gap between elite fighting pedigree and professional
            safety standards. An ego-free institute designed for the everyday professional,
            the empowered woman, and the aspiring athlete.
          </Body>
        </Reveal>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 8 }}>
        {[
          ['The injury-free mandate', 'Safety is non-negotiable — at every level. Beginners build their foundation with structured S&C and combat sessions before intensity increases. Intermediate and advanced athletes train with proper load management, periodisation, and technique correction. Every training plan is designed to keep you performing for years, not weeks.'],
          ['Holistic unity', 'Combat sports and strength & conditioning under one roof. Animal Flow, HIIT, Olympic lifting — all included in your membership, not charged as extras like other places.'],
          ['Inclusive excellence', 'A premium, welcoming space for all ages, genders, and experience levels. From a mother learning self-defence to a pro fighter in camp.'],
        ].map(([t, d], i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{ padding: 24, background: 'var(--warm)', borderRadius: 8, borderLeft: '3px solid var(--rust)', minHeight: 120 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 900, color: 'var(--rust)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
