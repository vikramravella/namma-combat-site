import { Reveal, Section, Eyebrow, Heading, SubHeading, GoldBar, PrimaryBtn, PhotoBox } from './ui';

export default function Journey({ onCta }) {
  const steps = [
    { num: '01', title: 'Free trial class', label: 'Trial', desc: 'Your first session is on us. Meet the coaches, see the space, feel how we train. No commitment, no pressure.' },
    { num: '02', title: 'Postural assessment', label: 'Assess', desc: 'Every member starts here — a full-body evaluation of imbalances, movement, and readiness. A service most centres charge separately for. Yours is included.' },
    { num: '03', title: 'Your structured plan', label: 'Plan', desc: 'Your coaches build a personalised plan based on your assessment, level, and goals. No generic programs. No guesswork.' },
    { num: '04', title: 'Train at your level', label: 'Train', desc: 'Beginners build their foundation with S&C and Animal Flow. Intermediates sharpen technique and sparring. Fighters train for competition. Every level trains with intention.' },
    { num: '05', title: 'Grow without limits', label: 'Mastery', desc: 'Your membership is wide open — train across disciplines, across floors, any time. Every 3 months we reassess your posture and recalibrate your plan.' },
  ];

  return (
    <Section id="journey" bg="var(--warm)">
      <Reveal>
        <Eyebrow>Your journey</Eyebrow>
        <Heading>We don&apos;t just hand you a membership card.</Heading>
        <SubHeading>Every member — beginner to competitive fighter — trains with structure and purpose.</SubHeading>
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
