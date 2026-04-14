'use client';
import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, PrimaryBtn, PhotoBox } from './ui';

export default function Journey({ onCta }) {
  const steps = [
    { num: '01', title: 'Free trial class', label: 'Trial', desc: 'Experience the space, meet the coaches, feel the vibe. No commitment, no pressure. This is your first step — come see if we\'re the right fit for you.' },
    { num: '02', title: 'Postural assessment', label: 'Assess', desc: 'Once you join, we begin with a comprehensive postural assessment — not a quick glance, but a thorough evaluation of your body\'s imbalances, strengths, and weaknesses. This is typically charged ₹7,000 elsewhere. It\'s included with every membership.' },
    { num: '03', title: 'Your structured plan', label: 'Plan', desc: 'Based on your assessment and goals, we build you a personalised training plan. No guesswork, no generic programs. Your coaches know exactly where you\'re starting and where you need to go.' },
    { num: '04', title: 'The foundation phase', label: 'Foundation', desc: 'For beginners, we strongly recommend starting with 8 S&C sessions including Animal Flow and 4 combat classes in your first two weeks. This builds the athletic base your body needs — joint strength, mobility, and conditioning — so you can train hard and stay injury-free for years. Most gyms skip this. We don\'t.' },
    { num: '05', title: 'Train with freedom', label: 'Mastery', desc: 'Once your foundation is set, your membership is wide open. Box in the morning, wrestle in the evening, hit the Technogym Skill Row at lunch. Every 3 months, we reassess your posture, review your progress, and recalibrate your training. Your growth is tracked, not assumed.' },
  ];

  return (
    <Section id="journey" bg="var(--warm)">
      <Reveal>
        <Eyebrow>Your journey</Eyebrow>
        <Heading>We don&apos;t just hand you a membership card.</Heading>
        <SubHeading>From your first visit to your hundredth session, every step is structured.</SubHeading>
        <GoldBar />
      </Reveal>
      <div style={{ marginTop: 8 }}>
        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="nc-journey-step" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, padding: '32px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>{step.num}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{step.title}</h3>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7, margin: 0, maxWidth: 560 }}>{step.desc}</p>
              </div>
              <PhotoBox label={step.label} h={180} />
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.4}>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <PrimaryBtn onClick={onCta} style={{ padding: '16px 40px', fontSize: 15 }}>Start with a free trial</PrimaryBtn>
        </div>
      </Reveal>
      <style jsx global>{`@media(min-width:800px){.nc-journey-step{grid-template-columns:1fr 320px!important}}`}</style>
    </Section>
  );
}
