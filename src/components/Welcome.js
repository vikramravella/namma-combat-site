import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, Body } from './ui';

export default function Welcome() {
  return (
    <Section bg="var(--cream)">
      <div style={{ maxWidth: 800 }}>
        <Reveal>
          <Eyebrow>Welcome to Namma Combat</Eyebrow>
          <Heading>Trade vanity for capability.</Heading>
          <SubHeading>The same hour at a gym builds a reflection. Here, it builds a skill.</SubHeading>
          <GoldBar />
          <Body>
            Most fitness centres train you to look better. We train you to <em>be</em> better. Skill. Power. Confidence. A capable body that shows up in real life — not just in the mirror.
          </Body>
        </Reveal>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 8 }}>
        {[
          ['A skill that stays with you', 'Boxing, wrestling, jiu-jitsu — combat sports build capability you carry for life. Your body remembers. Your confidence compounds.'],
          ['Strength built with science', 'Animal Flow, Olympic lifting, structured S&C — power and mobility designed by coaches who understand how bodies actually work.'],
          ['Built for every body', 'Premium space for every age, gender, and starting point. From your first session to your hundredth — you belong here.'],
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
