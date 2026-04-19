'use client';
import { Reveal, Section, Eyebrow, Heading, Body, GoldBar } from './ui';

export default function Why() {
  return (
    <Section id="why" bg="var(--cream)">
      <Reveal>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow>Why Namma Combat exists</Eyebrow>
          <Heading>India deserved better.</Heading>
          <GoldBar />
          <Body style={{ marginTop: 18 }}>
            Dark, gritty rooms with no science. Fancy fitness centres that skip safety entirely.
          </Body>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 600, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5, margin: '18px 0' }}>
            Neither of these is what combat sports deserve. And neither is what you deserve.
          </p>
          <Body>
            We built Namma Combat to be the place we&apos;d want to walk into as members.
          </Body>
          <div style={{ margin: '24px 0', padding: '20px 24px', background: 'var(--warm)', borderLeft: '3px solid var(--gold)', borderRadius: 4 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.5 }}>
              <strong>Postural assessment, included.</strong> <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>(Not an upsell.)</span>
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.5 }}>
              <strong>Animal Flow, included.</strong> <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>(Not a premium tier.)</span>
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
              <strong>Every class, beginner to elite, structured to feel personal.</strong>
            </p>
          </div>
          <Body>
            No upsell pressure. No hidden tiers. No &ldquo;pay extra&rdquo; for what should have always been part of the deal.
          </Body>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--rust)', margin: '24px 0 0', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            The place we&apos;d want to walk into as members.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
