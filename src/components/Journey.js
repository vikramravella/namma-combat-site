import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, PrimaryBtn, PhotoBox } from './ui';

export default function Journey({ onCta }) {
  const steps = [
    { num: '01', title: 'Free trial class', label: 'Trial', desc: 'Whether you\'ve never thrown a punch or you\'re a seasoned fighter looking for a new home — your first session is on us. Experience the space, meet the coaches, and see how we train. No commitment, no pressure.' },
    { num: '02', title: 'Postural assessment', label: 'Assess', desc: 'Once you join, every member — beginner or advanced — starts with a comprehensive postural assessment. We evaluate your body\'s imbalances, strengths, and movement patterns. This is typically charged ₹7,000 elsewhere. It\'s included with every membership. For experienced athletes, this reveals hidden imbalances that limit performance.' },
    { num: '03', title: 'Your structured plan', label: 'Plan', desc: 'Based on your assessment, experience level, and goals, we build a personalised training plan. A complete beginner gets a different path than an intermediate practitioner looking to compete. No guesswork, no generic programs — your coaches know exactly where you are and where you need to go.' },
    { num: '04', title: 'Train at your level', label: 'Train', desc: 'Beginners build their athletic base with S&C and Animal Flow before entering combat sessions — this prevents injuries and builds lasting foundations. Intermediate athletes sharpen technique and start structured sparring. Competitive fighters get match preparation, advanced drilling, and fight-ready conditioning. Every level trains with intention.' },
    { num: '05', title: 'Grow without limits', label: 'Mastery', desc: 'Your membership is wide open. Box in the morning, wrestle in the evening, hit the Technogym Skill Row at lunch. Every 3 months, we reassess your posture, review your progress, and recalibrate your training. Whether you\'re chasing your first milestone or preparing for a national competition — your growth is tracked, not assumed.' },
  ];

  return (
    <Section id="journey" bg="var(--warm)">
      <Reveal>
        <Eyebrow>Your journey</Eyebrow>
        <Heading>We don&apos;t just hand you a membership card.</Heading>
        <SubHeading>From your first visit to your hundredth session — beginners, intermediate athletes, and competitive fighters all train with structure and purpose.</SubHeading>
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
