'use client';
import { submitMarketingLead } from '@/lib/marketing-lead';
import { useState, useEffect } from 'react';
import { PhotoBox } from '../../../components/ui';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

const PrimaryBtn = ({ children, onClick, style }) => { const [h, setH] = useState(false); return (<button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.cream, background: h ? '#7A2A18' : T.rust, border: 'none', padding: '14px 32px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5, ...style }}>{children}</button>); };

const cleanPhone = (s) => { const d = (s || '').replace(/\D/g, ''); return d.length === 12 && d.startsWith('91') ? d.slice(2) : d; };

function InlineForm({ coachName, defaultInterest }) {
  const [fd, setFd] = useState({ name: '', phone: '', interest: defaultInterest || '', notes: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!fd.name || !fd.phone) return;
    setLoading(true);
    await submitMarketingLead(fd);
    if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', 'generate_lead', { 'source': window.location.pathname, 'interest': fd.interest || 'general' }); }
    setDone(true);
    setLoading(false);
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(154,53,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: 26, color: T.rust }}>✓</span>
        </div>
        <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, color: T.text, margin: '0 0 10px', textTransform: 'uppercase' }}>We&apos;ll call you soon.</h3>
        <p style={{ fontFamily: T.fontBody, fontSize: 15, color: T.textLight, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>Our team will call you to schedule your complimentary trial class.</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[
        { k: 'name', l: 'Full name *', t: 'text', p: 'Your name' },
        { k: 'phone', l: 'Phone number *', t: 'tel', p: 'XXXXXXXXXX' },
      ].map(({ k, l, t, p }) => (
        <div key={k}>
          <label style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text, display: 'block', marginBottom: 4 }}>{l}</label>
          <input type={t} inputMode={t === 'tel' ? 'tel' : 'text'} autoComplete={t === 'tel' ? 'tel-national' : k === 'name' ? 'name' : 'off'} placeholder={p} value={fd[k]} onChange={e => setFd({ ...fd, [k]: e.target.value })}
            style={{ width: '100%', padding: '13px 14px', fontFamily: T.fontBody, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', color: T.text, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      ))}
      <div>
        <label style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text, display: 'block', marginBottom: 4 }}>Interested in</label>
        <select value={fd.interest} onChange={e => setFd({ ...fd, interest: e.target.value })}
          style={{ width: '100%', padding: '13px 14px', fontFamily: T.fontBody, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', color: T.text, outline: 'none', boxSizing: 'border-box' }}>
          {['', 'Boxing', 'Kickboxing', 'MMA - Mixed Martial Arts', 'BJJ - Brazilian Jiu-Jitsu', 'Wrestling', 'Judo', 'S&C - Strength & Conditioning', 'Animal Flow', 'Kids / Youth Program', 'Not sure — help me decide'].map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
        </select>
      </div>
      <PrimaryBtn onClick={submit} style={{ width: '100%', textAlign: 'center', padding: 16, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Submitting...' : 'Book my free trial'}
      </PrimaryBtn>
      <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, textAlign: 'center', margin: 0 }}>Or WhatsApp us directly at 77700 87700</p>
    </div>
  );
}

export default function CoachClientPage({ coach }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);
  const defaultInterest = coach.classes[0]?.label === 'BJJ' ? 'BJJ - Brazilian Jiu-Jitsu' : coach.classes[0]?.label === 'MMA' ? 'MMA - Mixed Martial Arts' : coach.classes[0]?.label || '';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');
        @font-face { font-family: 'Materia Pro'; src: url('/fonts/MateriaPro-Bold.otf') format('opentype'); font-weight: 700; font-style: normal; font-display: swap; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.cream}; color: ${T.text}; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.cream }}>

        {/* TOP BAR */}
        <div style={{ background: T.cream, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <a href="/" style={{ display: 'inline-flex' }}><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a>
          <a href="/#team" style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.textLight, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1.5 }}>&larr; All coaches</a>
        </div>

        {/* HERO */}
        <div style={{ padding: '40px 16px 32px', maxWidth: 1100, margin: '0 auto', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>{coach.role}</p>
              <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: T.text, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>{coach.name}</h1>
              {coach.subhead && (
                <p style={{ fontFamily: T.fontSerif, fontSize: 17, color: T.textLight, lineHeight: 1.5, fontStyle: 'italic', margin: 0, maxWidth: 460 }}>{coach.subhead}</p>
              )}
            </div>
            <PhotoBox label={(coach.firstName || coach.name.split(' ')[0])} h={320} />
          </div>
        </div>

        {/* MAIN CONTENT — bio + form */}
        <div style={{ padding: '0 16px 60px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>

            {/* LEFT — Bio + credentials + competition + classes */}
            <div>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 16px' }}>About</p>
              {coach.bio.map((p, i) => (
                <p key={i} style={{ fontFamily: T.fontBody, fontSize: 15, color: T.text, lineHeight: 1.7, margin: '0 0 16px' }}>{p}</p>
              ))}

              {coach.coachingCredentials && coach.coachingCredentials.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 14px' }}>Coaching credentials</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {coach.coachingCredentials.map((c, i) => (
                      <li key={i} style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text, lineHeight: 1.6, paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {coach.competitionRecord && coach.competitionRecord.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 14px' }}>Competition record</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {coach.competitionRecord.map((c, i) => (
                      <li key={i} style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text, lineHeight: 1.6, display: 'grid', gridTemplateColumns: typeof c === 'object' ? '52px 1fr' : '1fr', gap: 10, paddingLeft: typeof c === 'object' ? 0 : 16, position: 'relative' }}>
                        {typeof c === 'object' ? (
                          <>
                            <span style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.rust, fontWeight: 700, letterSpacing: 0.5 }}>{c.year}</span>
                            <span>{c.title}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                            {c}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  {coach.competitionFooter && (
                    <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, fontStyle: 'italic', margin: '14px 0 0' }}>{coach.competitionFooter}</p>
                  )}
                </div>
              )}

              {coach.professionalExperience && coach.professionalExperience.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 14px' }}>Professional experience</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {coach.professionalExperience.map((e, i) => (
                      <li key={i} style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text, lineHeight: 1.6, paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {coach.classes && coach.classes.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 14px' }}>Train with {(coach.firstName || coach.name.split(' ')[0])}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {coach.classes.map(c => (
                      <a key={c.label} href={c.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 999, fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = T.warm; }} onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#fff'; }}>
                        {c.label} <span style={{ color: T.rust, fontSize: 11 }}>&rarr;</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Trial form */}
            <div style={{ background: '#fff', padding: '28px 24px', borderRadius: 8, border: `1px solid ${T.border}`, position: 'sticky', top: 20 }}>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 6px' }}>Complimentary trial class</p>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.text, margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Train with {(coach.firstName || coach.name.split(' ')[0])}</h2>
              <InlineForm coachName={coach.name} defaultInterest={defaultInterest} />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: '28px 24px', textAlign: 'center', background: T.warm }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, margin: '0 0 6px' }}>Namma Combat · Koramangala, Bangalore</p>
          <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>WhatsApp 77700 87700 · <a href="/" style={{ color: T.rust, textDecoration: 'none' }}>Back to home</a></p>
        </div>

      </div>
    </>
  );
}
