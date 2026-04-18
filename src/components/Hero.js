'use client';
import { Reveal, PrimaryBtn, GhostBtn, PhotoBox } from './ui';

export default function Hero({ onCta }) {
  return (
    <section className="nc-hero" style={{ background: 'var(--cream)', paddingTop: 40 }}>
      <div className="nc-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0', display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
        <div style={{ maxWidth: 620 }}>
          <Reveal>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 3, color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12, background: 'rgba(227,199,104,0.12)', display: 'inline-block', padding: '6px 14px', borderRadius: 3 }}>
              Skill · Strength · Sanctuary
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.05, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>The Institute<br/>of Mastery.</h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 2.2vw, 21px)', color: 'var(--text-light)', lineHeight: 1.55, margin: '12px 0 0', fontStyle: 'italic', maxWidth: 480 }}>
              India&apos;s premier combat sports &amp; conditioning academy.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65, margin: '16px 0 32px', maxWidth: 440 }}>
              Elite coaching from national medalists. Zero intimidation.
              A sanctuary for the everyday professional, the empowered woman,
              and the aspiring athlete.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <PrimaryBtn onClick={onCta} style={{ padding: '16px 36px', fontSize: 15 }}>Book your free trial</PrimaryBtn>
              <GhostBtn onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>How it works</GhostBtn>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
              {[['National medalist', 'coaches'], ['4,200 sq ft', 'dual-floor facility'], ['Injury-free', 'mandate']].map(([big, small], i) => (
                <div key={i} style={{ minWidth: 100 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{big}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{small}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <PhotoBox label="Namma Combat" h={480} style={{ borderRadius: 10, minHeight: 380 }} />
        </Reveal>
      </div>
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--gold) 0%, rgba(227,199,104,0.27) 100%)', marginTop: 40 }} />
      <style jsx global>{`@media(min-width:900px){.nc-hero-grid{grid-template-columns:1fr 1fr!important;align-items:center}}`}</style>
    </section>
  );
}
