import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, Body } from './ui';

export default function Welcome() {
  return (
    <Section bg="var(--cream)">
      <div style={{ maxWidth: 800 }}>
        <Reveal>
          <Eyebrow>Welcome to Namma Combat</Eyebrow>
          <Heading>Your morning treadmill is boring.</Heading>
          <SubHeading>It&apos;s time to build a capable body and a focused mind.</SubHeading>
          <GoldBar />
          <Body>
            Elite pedigree meets professional safety standards. Built for the everyday professional, the empowered woman, and the aspiring athlete.
          </Body>
        </Reveal>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 8 }}>
        {[
          ['The injury-free mandate', 'Safety is non-negotiable at every level. Structured training, proper load management, and technique correction — designed to keep you performing for years, not weeks.'],
          ['Holistic unity', 'Combat sports and strength & conditioning under one roof. Animal Flow, HIIT, Olympic lifting — all included.'],
          ['Inclusive excellence', 'Premium, welcoming space for every age, gender, and experience level. From self-defence to fight camp.'],
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
