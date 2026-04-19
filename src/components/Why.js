'use client';
import { Reveal, Section, Eyebrow, Heading, Body, GoldBar } from './ui';

export default function Why() {
  return (
    <Section id="why" bg="var(--cream)">
      <Reveal>
        <div style={{ maxWidth: 760 }}>
          <Eyebrow>Why Namma Combat exists</Eyebrow>
          <Heading>India deserved better.</Heading>
          <GoldBar />
          <Body style={{ marginTop: 18 }}>
            Most combat academies in India are dark, gritty rooms with no ventilation, no BLS-trained staff, and no science behind the training.
          </Body>
          <Body>
            Most fancy fitness centres skip safety entirely and push you into personal training you don&apos;t need.
          </Body>
          <Body style={{ fontStyle: 'italic', color: 'var(--text)', fontWeight: 500 }}>
            Neither of these is what combat sports deserve. And neither is what you deserve.
          </Body>
          <Body style={{ marginTop: 18 }}>
            We built Namma Combat to be different. Every member starts with a <strong>postural assessment</strong> — the kind of service most centres charge separately for, included in your membership. Every member has access to <strong>Animal Flow</strong> — because joint health, mobility, and longevity matter as much as strength. Every class, from beginner to elite, is structured to feel personal.
          </Body>
          <Body style={{ color: 'var(--text)' }}>
            No upsell pressure. No hidden tiers. No &ldquo;pay extra&rdquo; for things that should have been part of your training from day one.
          </Body>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--rust)', margin: '24px 0 0', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            The place we&apos;d want to walk into as members.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
