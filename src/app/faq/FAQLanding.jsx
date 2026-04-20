'use client';
import { useState } from 'react';

const T = {
  rust: '#9A3520',
  rustHover: '#7D2A18',
  gold: '#E3C768',
  cream: '#FEF8EE',
  warm: '#F5F0E8',
  text: '#2C2318',
  textLight: '#5A4A38',
  textMuted: '#8A7C68',
  border: '#E0D6C8',
  fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
};

const FAQ_DATA = [
  {
    category: 'Getting started',
    items: [
      {
        q: "I've never trained combat sports before. Is this the right place for me?",
        a: "Yes. More than half our members start as complete beginners. Every class has structured progressions and no one is thrown into sparring on day one. Your first step is always the free trial class.",
      },
      {
        q: 'Do I need to be fit to start?',
        a: 'No. Fitness is the result of training, not the prerequisite. Your postural assessment (worth ₹7,000, included in every membership) establishes your current baseline, and your coach structures the program around that.',
      },
      {
        q: "I'm worried about getting injured or hurt.",
        a: 'We take injury prevention seriously. Every member starts with a postural assessment. Coaches are NIS Patiala and internationally certified. Sparring intensity is always progressive and matched to your level. All our coaches are BLS (Basic Life Support) trained.',
      },
      {
        q: 'What should I wear to my first class?',
        a: "Comfortable workout clothes you can move in — shorts or athletic pants, a t-shirt, and indoor training shoes (or go barefoot on the mats). For Judo and BJJ, we'll lend you a gi for your first few classes.",
      },
    ],
  },
  {
    category: 'Pricing & memberships',
    items: [
      {
        q: 'How much does membership cost?',
        a: 'Transparent pricing is on our Memberships section. Silver starts at ₹5,775/month. Gold (our most popular tier — both floors unlimited) is ₹7,875/month. Platinum (Gold + PT + guests) is ₹12,600/month. All prices include 5% GST. Every membership includes a postural assessment worth ₹7,000.',
      },
      {
        q: 'Do you offer a student discount?',
        a: 'Yes. Our Student tier offers Gold-tier benefits (both floors, unlimited classes) at Silver pricing (₹5,775/month). Valid school / college / university ID required. Age-appropriate classes — kids train with kids, adults with adults.',
      },
      {
        q: 'Can I try before I commit?',
        a: 'Absolutely. Every lead gets a complimentary trial class before signing up. Book via the form on our Trial page or WhatsApp us.',
      },
      {
        q: 'Can I freeze my membership if I travel or get injured?',
        a: 'Yes. Freeze allowances: Monthly up to 7 days, Quarterly up to 21 days, Semi-annual up to 28 days, Annual up to 35 days. Medical pause up to 90 days (extendable with a medical certificate).',
      },
      {
        q: 'Do memberships auto-renew?',
        a: "No. Memberships don't auto-renew. You renew actively when your current plan ends.",
      },
      {
        q: 'Are memberships refundable?',
        a: 'Memberships are non-refundable. If circumstances prevent you from training, we offer credit or transfer options. See our Refund & Cancellation Policy for details.',
      },
    ],
  },
  {
    category: 'Classes & schedule',
    items: [
      {
        q: 'What disciplines do you teach?',
        a: 'Six combat sports: Boxing, Kickboxing, MMA, BJJ (Brazilian Jiu-Jitsu), Wrestling, and Judo. Four strength & conditioning specialties: S&C, Animal Flow, HIIT, and Olympic Weightlifting. Kids programs and women\'s-focused classes also available.',
      },
      {
        q: 'How many classes per day can I attend?',
        a: 'Unlimited on all tiers. Morning class + evening class + Animal Flow at lunch — if you have the energy, we have the sessions.',
      },
      {
        q: 'What are your hours?',
        a: 'Weekdays (Mon–Fri): 6 AM – 9 PM. Saturday: 6 AM – 8 AM morning, then evening classes only. No S&C classes on Saturday afternoon. Sunday: workshops only.',
      },
      {
        q: "What's the class size?",
        a: 'Class sizes vary by time of day — we cap peak classes to ensure coach attention. Smaller classes mean better technique correction.',
      },
      {
        q: 'Can I drop in for a single class?',
        a: 'Yes. Single class passes: ₹788 regular / ₹1,050 elite 90-minute. Good for travelers or members from other academies trying us out.',
      },
    ],
  },
  {
    category: 'Facility & safety',
    items: [
      {
        q: 'Where are you located?',
        a: '10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034. Five minutes from Forum Mall.',
      },
      {
        q: 'Is there parking?',
        a: 'Street parking is available near the academy. We recommend arriving 10 minutes before class.',
      },
      {
        q: 'Do you have changing rooms and showers?',
        a: 'Yes. Separate changing areas for men and women, plus showers. Lockers are available.',
      },
      {
        q: 'What equipment do you have?',
        a: 'Two dedicated floors — The Arena (ring, heavy bags, mats) and The Sanctuary (Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom stainless steel squat racks, Olympic platforms).',
      },
      {
        q: 'Are the coaches certified?',
        a: 'Yes. Our head coach Kantharaj is NIS Patiala certified and an Indian MMA Pioneer with 13 professional wins. Coach Naeem holds an MSc in Performance Coaching from Setanta College. Our boxing and wrestling coaches are NIS Patiala certified with national medals. All coaches are BLS (Basic Life Support) trained.',
      },
    ],
  },
  {
    category: 'Kids, Women & Corporate',
    items: [
      {
        q: 'Do you have a kids program?',
        a: 'Yes. Ages 6–15, with separate age-appropriate programs for 6–8, 9–12, and 13–15 year olds. See our Kids page for details.',
      },
      {
        q: 'Are there women-only classes?',
        a: "We offer women's-health-informed coaching and women's-focused sessions. Coach Spoorthi Nagraj specialises in women's health and Animal Flow. See our Women's page for specific programs.",
      },
      {
        q: 'Do you offer corporate wellness?',
        a: 'Yes. Group memberships, leadership cohorts, and team-building events. See our Corporate page for details.',
      },
    ],
  },
  {
    category: 'Practical',
    items: [
      {
        q: 'How do I book a class?',
        a: 'Members book via the scheduling system provided on joining. New leads book their trial class via the form on our Trial page or WhatsApp us directly.',
      },
      {
        q: "What's the cancellation policy for booked classes?",
        a: '12-hour notice for regular classes. 24-hour notice for Elite / 90-minute sessions.',
      },
      {
        q: 'Can I bring a guest?',
        a: 'Every membership includes Saturdays as friends-and-family day — bring one person free. Platinum members also get 2 guest passes per month on weekdays. Three or more guests? WhatsApp us in advance.',
      },
      {
        q: 'How do I contact you?',
        a: 'Phone / WhatsApp: 77700 87700. We respond within 24 hours.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '20px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: T.fontBody,
          fontSize: 16,
          fontWeight: 600,
          color: T.text,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{ flex: 1, lineHeight: 1.4 }}>{item.q}</span>
        <span
          style={{
            fontSize: 22,
            color: isOpen ? T.gold : T.textMuted,
            fontWeight: 400,
            transition: 'transform 0.25s ease, color 0.25s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, padding 0.3s ease',
          paddingBottom: isOpen ? 20 : 0,
        }}
      >
        <p
          style={{
            fontFamily: T.fontBody,
            fontSize: 15,
            color: T.textLight,
            lineHeight: 1.7,
            margin: 0,
            paddingRight: 40,
          }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQLanding() {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (categoryIdx, itemIdx) => {
    const key = `${categoryIdx}-${itemIdx}`;
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');
        @font-face {
          font-family: 'Materia Pro';
          src: url('/fonts/MateriaPro-Bold.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.cream}; color: ${T.text}; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.cream }}>
        {/* Gold progress bar */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: 'none' }} id="nc-progress-wrap">
          <div id="nc-progress-bar" style={{ height: '100%', width: '0%', background: T.gold, transition: 'width 0.1s linear' }} />
        </div>
        <button
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          id="nc-scroll-top"
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            zIndex: 89,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: T.gold,
            color: T.text,
            border: 'none',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(227,199,104,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(typeof window!=='undefined'){window.addEventListener('scroll',function(){var h=document.documentElement;var t=h.scrollHeight-h.clientHeight;var p=t>0?(h.scrollTop/t)*100:0;var bar=document.getElementById('nc-progress-bar');if(bar)bar.style.width=p+'%';var btn=document.getElementById('nc-scroll-top');if(btn)btn.style.display=h.scrollTop>500?'flex':'none';});}`,
          }}
        />

        {/* Logo header */}
        <div style={{ background: T.cream, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center' }}>
          <a href="/"><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a>
        </div>

        {/* Hero */}
        <div style={{ padding: '64px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 2, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 14px' }}>
            Frequently asked
          </p>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 44, fontWeight: 900, color: T.text, lineHeight: 1.1, margin: '0 0 18px', letterSpacing: -0.5 }}>
            Questions before you commit.<br />We've got you.
          </h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textLight, lineHeight: 1.6, margin: 0, maxWidth: 580 }}>
            Everything people usually ask before booking a trial — pricing, programs, schedule, safety. If your question isn't here, WhatsApp us on 77700 87700 and we'll answer directly.
          </p>
        </div>

        {/* FAQ Content */}
        <div style={{ padding: '24px 24px 80px', maxWidth: 760, margin: '0 auto' }}>
          {FAQ_DATA.map((cat, ci) => (
            <div key={cat.category} style={{ marginBottom: 48 }}>
              <h2 style={{
                fontFamily: T.fontBody,
                fontSize: 11,
                letterSpacing: 2,
                color: T.rust,
                textTransform: 'uppercase',
                fontWeight: 700,
                margin: '0 0 12px',
                paddingBottom: 12,
                borderBottom: `2px solid ${T.gold}`,
              }}>
                {cat.category}
              </h2>
              <div>
                {cat.items.map((item, ii) => (
                  <AccordionItem
                    key={ii}
                    item={item}
                    isOpen={openKey === `${ci}-${ii}`}
                    onToggle={() => toggle(ci, ii)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div style={{ marginTop: 64, padding: '32px 28px', background: T.warm, borderLeft: `3px solid ${T.gold}`, borderRadius: 4 }}>
            <p style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text, margin: '0 0 8px' }}>
              Didn't find your answer?
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textLight, lineHeight: 1.6, margin: '0 0 18px' }}>
              WhatsApp us on 77700 87700 or book a free trial class. We'll walk you through anything specific to your goals.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/917770087700"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: T.fontBody,
                  fontSize: 14,
                  fontWeight: 600,
                  background: T.rust,
                  color: '#fff',
                  padding: '12px 28px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  letterSpacing: 0.5,
                }}
              >
                WhatsApp us
              </a>
              <a
                href="/trial"
                style={{
                  fontFamily: T.fontBody,
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  color: T.text,
                  padding: '12px 28px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  letterSpacing: 0.5,
                  border: `1px solid ${T.border}`,
                }}
              >
                Book a free trial
              </a>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: '0 0 8px' }}>
              <a href="/privacy" style={{ color: T.textMuted, textDecoration: 'none', marginRight: 16 }}>Privacy</a>
              <a href="/terms" style={{ color: T.textMuted, textDecoration: 'none', marginRight: 16 }}>Terms</a>
              <a href="/refunds" style={{ color: T.textMuted, textDecoration: 'none', marginRight: 16 }}>Refunds</a>
              <a href="/shipping" style={{ color: T.textMuted, textDecoration: 'none' }}>Shipping</a>
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>
              © Namma Combat — Skill · Strength · Sanctuary
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
