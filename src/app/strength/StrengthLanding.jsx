'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

const PrimaryBtn = ({ children, onClick, style }) => { const [h, setH] = useState(false); return (<button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.cream, background: h ? '#7A2A18' : T.rust, border: 'none', padding: '14px 32px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5, ...style }}>{children}</button>); };

function InlineForm() {
  const [fd, setFd] = useState({ name: '', phone: '', interest: 'S&C - Strength & Conditioning', notes: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = () => {
    if (!fd.name || !fd.phone) return;
    setLoading(true);
    const nameParts = fd.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '-';
    let iframe = document.getElementById('zoho_iframe');
    if (!iframe) { iframe = document.createElement('iframe'); iframe.id = 'zoho_iframe'; iframe.name = 'zoho_iframe'; iframe.style.display = 'none'; document.body.appendChild(iframe); }
    const form = document.createElement('form');
    form.method = 'POST'; form.action = 'https://crm.zoho.in/crm/WebToLeadForm'; form.target = 'zoho_iframe'; form.acceptCharset = 'UTF-8';
    const fields = { 'xnQsjsdp': '46046e1b1518a2e1c8335abc6c416cc060d54010509945e0354e8c12064719fe', 'zc_gad': '', 'xmIwtLD': 'a9a1d770007ff6c74947f678d63c2e80373d35aa1e34f909ded5b4cb6df9af52dcdb4166291a626a499d63089a7299d9', 'actionType': 'TGVhZHM=', 'returnURL': 'https://nammacombat.com/trial', 'First Name': firstName, 'Last Name': lastName, 'Phone': fd.phone, 'Lead Source': 'Website' };
    if (fd.interest) fields['LEADCF14'] = fd.interest;
    Object.entries(fields).forEach(([key, value]) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = value; form.appendChild(input); });
    document.body.appendChild(form); form.submit(); document.body.removeChild(form); if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', 'generate_lead', { 'source': window.location.pathname, 'interest': fd.interest || 'general' }); }
    setTimeout(() => { setDone(true); setLoading(false); }, 1000);
  };
  if (done) return (<div style={{ textAlign: 'center', padding: '40px 20px' }}><div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(154,53,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><span style={{ fontSize: 26, color: T.rust }}>✓</span></div><h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, color: T.text, margin: '0 0 10px', textTransform: 'uppercase' }}>We&apos;ll call you soon.</h3><p style={{ fontFamily: T.fontBody, fontSize: 15, color: T.textLight, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>Our team will call you soon to schedule your complimentary trial class.</p></div>);
  return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{[{ k: 'name', l: 'Full name *', t: 'text', p: 'Your name' }, { k: 'phone', l: 'Phone number *', t: 'tel', p: 'XXXXXXXXXX' }].map(({ k, l, t, p }) => (<div key={k}><label style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text, display: 'block', marginBottom: 4 }}>{l}</label><input type={t} inputMode={t === 'tel' ? 'tel' : 'text'} autoComplete={t === 'tel' ? 'tel' : k === 'name' ? 'name' : 'off'} placeholder={p} value={fd[k]} onChange={e => setFd({ ...fd, [k]: e.target.value })} style={{ width: '100%', padding: '13px 14px', fontFamily: T.fontBody, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', color: T.text, outline: 'none', boxSizing: 'border-box' }} /></div>))}<div><label style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text, display: 'block', marginBottom: 4 }}>Interested in</label><select value={fd.interest} onChange={e => setFd({ ...fd, interest: e.target.value })} style={{ width: '100%', padding: '13px 14px', fontFamily: T.fontBody, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 6, background: '#fff', color: T.text, outline: 'none', boxSizing: 'border-box' }}>{['Boxing','Kickboxing','MMA - Mixed Martial Arts','Wrestling','Judo','S&C - Strength & Conditioning','Animal Flow','Kids / Youth Program','Not sure — help me decide'].map(o => <option key={o} value={o}>{o}</option>)}</select></div><PrimaryBtn onClick={submit} style={{ width: '100%', textAlign: 'center', padding: 16, marginTop: 4, opacity: loading ? 0.7 : 1 }}>{loading ? 'Submitting...' : 'Book my free trial'}</PrimaryBtn><p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, textAlign: 'center', margin: 0 }}>Or WhatsApp us directly at 77700 87700</p></div>);
}

export default function StrengthLanding() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(true); }, []);
  const levels = [
    {
      label: 'For the Lifestyle Athlete',
      intro: 'You want to feel stronger, move better, age well.',
      items: [
        'Postural assessment before you touch a weight — we never load bad movement',
        'Fundamental patterns — squat, hinge, push, pull, carry, rotate',
        'Mobility and flexibility as core work, not an afterthought',
        'Progressive programming — not random workouts, not CrossFit chaos',
        'Lifestyle integration — sleep, stress, energy, body composition',
      ],
    },
    {
      label: 'For the Intermediate',
      intro: "You've trained before. Now we get serious about progression.",
      items: [
        'Structured periodisation — accumulation, intensification, peaking blocks',
        'Olympic lifting — snatch, clean & jerk taught from the ground up',
        'Power development — plyometrics, jumps, throws, ballistic work',
        'Sport-specific conditioning (for your hobby sport or goal)',
        'Body composition done right — not random, not extreme',
      ],
    },
    {
      label: 'For the Athlete',
      intro: 'You compete. You need to perform and recover.',
      items: [
        'Sport-specific S&C — boxing S&C ≠ wrestling S&C ≠ runner S&C',
        'Energy system training matched to your sport (ATP-PC, glycolytic, oxidative)',
        'Injury prevention through imbalance correction and tissue work',
        'In-season vs off-season programming',
        'Recovery protocols — HRV, sleep, soft tissue, modalities',
      ],
    },
  ];
  return (
    <><style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');@font-face{font-family:'Materia Pro';src:url('/fonts/MateriaPro-Bold.otf') format('opentype');font-weight:700;font-style:normal;font-display:swap;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:${T.cream};color:${T.text};-webkit-font-smoothing:antialiased;}`}</style>
    <div style={{ minHeight: '100vh', background: T.cream }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: 'none' }} id="nc-progress-wrap"><div id="nc-progress-bar" style={{ height: '100%', width: '0%', background: T.gold, transition: 'width 0.1s linear' }} /></div>
      <button aria-label="Scroll to top" onClick={() => window.scrollTo({top:0, behavior:'smooth'})} id="nc-scroll-top" style={{ position: 'fixed', bottom: 92, right: 24, zIndex: 89, width: 44, height: 44, borderRadius: '50%', background: T.gold, color: T.text, border: 'none', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(227,199,104,0.35)', transition: 'all 0.2s ease' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
      <script dangerouslySetInnerHTML={{ __html: `if(typeof window!=='undefined'){window.addEventListener('scroll',function(){var h=document.documentElement;var t=h.scrollHeight-h.clientHeight;var p=t>0?(h.scrollTop/t)*100:0;var bar=document.getElementById('nc-progress-bar');if(bar)bar.style.width=p+'%';var btn=document.getElementById('nc-scroll-top');if(btn)btn.style.display=h.scrollTop>500?'flex':'none';});}` }} />
      <div style={{ background: T.cream, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center' }}><a href="/" style={{ display: 'inline-flex' }}><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a></div>
      <div style={{ padding: '32px 16px 28px', maxWidth: 960, margin: '0 auto', opacity: v?1:0, transform: v?'translateY(0)':'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div className="nc-landing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>
          <div>
            <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>Strength &amp; conditioning in Bangalore</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px' }}>Strength that<br/>serves a purpose.</h1>
            <p style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textLight, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 480 }}>Not a regular fitness centre. A structured S&amp;C program designed by a performance coach with an MSc from Setanta College — the institution behind Premier League and NBA practitioners. Animal Flow, HIIT, Olympic Lifting, and premium equipment.</p>
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 8px' }}>What we teach</p>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 900, color: T.text, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Performance at every level.</h2>
              <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textLight, lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic' }}>This is not a lifting gym. This is performance training.</p>
              {levels.map((lvl, i) => (
                <div key={i} style={{ marginBottom: 28, opacity: v?1:0, transform: v?'translateY(0)':'translateY(10px)', transition: `all 0.5s ease ${0.2+i*0.1}s` }}>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 900, color: T.rust, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{lvl.label}</h3>
                  <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text, fontWeight: 500, margin: '0 0 10px', fontStyle: 'italic' }}>{lvl.intro}</p>
                  {lvl.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.gold, fontWeight: 700, marginTop: 2, flexShrink: 0 }}>•</span>
                      <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, lineHeight: 1.5, margin: 0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 24, padding: '18px 22px', background: 'rgba(227,199,104,0.12)', borderLeft: `3px solid ${T.gold}`, borderRadius: 4 }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 900, color: T.text, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>Animal Flow &mdash; Movement as Skill</h3>
                <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, lineHeight: 1.6, margin: 0 }}>Included in every S&C membership. Level 1 (beginner): base poses, form-specific movements, ground mastery. Level 2 (intermediate): flows, transitions, call-and-response. Level 3 (advanced): complex flows, creative expression, athletic performance.</p>
              </div>
              <div style={{ marginTop: 16, padding: '18px 22px', background: T.warm, borderLeft: `3px solid ${T.rust}`, borderRadius: 4 }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 900, color: T.text, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>Who teaches you</h3>
                <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, lineHeight: 1.6, margin: 0 }}><strong style={{ color: T.text }}>Coach Mohammed Naeem</strong> &mdash; MSc Performance Coaching (Setanta College), former professional Indian Hockey player, 8+ years building athletes. Supported by <strong style={{ color: T.text }}>Coach Spoorthi</strong> (Animal Flow L1 certified, women's health specialist) and <strong style={{ color: T.text }}>Coach Manoj</strong> (Skill India certified, beginner specialist).</p>
              </div>
            </div>
            <div style={{ padding: '20px 24px', background: T.warm, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 24, color: T.gold, lineHeight: 1, marginBottom: 4, opacity: 0.6 }}>&ldquo;</div>
              <p style={{ fontFamily: T.fontSerif, fontSize: 15, color: T.text, lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 10px' }}>I have seen myself transforming mentally and physically. Coaches teach you every tiny detail to correct your form and posture. I would highly recommend this place.</p>
              <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, fontWeight: 600, margin: '0 0 2px' }}>— Hindesh Akash</p>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>Training since October 2025</p>
            </div>
          </div>
          <div style={{ position: 'sticky', top: 24, opacity: v?1:0, transform: v?'translateY(0)':'translateY(20px)', transition: 'all 0.6s ease 0.3s' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: `1px solid ${T.border}`, boxShadow: '0 4px 24px rgba(44,35,24,0.06)' }}>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 8px' }}>Book your free trial</p>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, color: T.text, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Start your journey.</h2>
              <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textLight, margin: '0 0 24px' }}>We&apos;ll call to schedule your complimentary S&amp;C trial.</p>
              <InlineForm />
            </div>
            <div style={{ marginTop: 16, padding: '16px 20px', background: T.warm, borderRadius: 8, border: `1px solid ${T.border}`, display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ fontSize: 20 }}>📍</span><div><p style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, margin: '0 0 2px' }}>10, 80 Feet Road, 4th Block Koramangala</p><p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>Mon–Sat: 6 AM – 9 PM</p></div></div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '20px 24px', textAlign: 'center', background: T.cream }}><img src="/seal.svg" alt="Namma Combat" style={{ width: 56, height: 56, margin: '0 auto 12px', display: 'block' }} /><p style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600 }}>Skill · Strength · Sanctuary</p><p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>© 2026 Namma Combat. All rights reserved.</p></div>
      <a href="https://wa.me/917770087700" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, background: '#25D366', color: '#fff', borderRadius: 28, padding: '12px 22px', fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(37,211,102,0.25)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.312-.726-5.994-1.956l-.42-.312-2.643.886.886-2.643-.312-.42A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>WhatsApp us</a>
    </div></>
  );
}
