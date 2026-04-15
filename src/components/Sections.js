'use client';
import { useState } from 'react';
import { Reveal, Section, Eyebrow, Heading, Body, PrimaryBtn, PhotoBox } from './ui';

/* ═══ KIDS ═══ */
export function Kids() {
  const sports = ['Kids Boxing', 'Kids Judo', 'Kids Wrestling', 'Kids S&C', 'Kids Animal Flow'];
  return (
    <Section bg="var(--cream)">
      <Reveal><Eyebrow>Next generation</Eyebrow><Heading>Kids &amp; youth programs</Heading>
        <Body style={{ maxWidth: 520 }}>Discipline, focus, and self-protection in a safe, supervised environment. BLS-trained coaches. All ages welcome.</Body>
      </Reveal>
      <Reveal delay={0.1}><PhotoBox label="Next Generation" h={240} /></Reveal>
      <Reveal delay={0.15}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
          {sports.map(s => (
            <span key={s} style={{ fontFamily: 'var(--font-body)', fontSize: 13, padding: '8px 20px', background: 'var(--gold-soft)', color: 'var(--text)', borderRadius: 24, fontWeight: 500, border: '1px solid rgba(227,199,104,0.3)' }}>{s}</span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ═══ TEAM ═══ */
export function Team() {
  const coaches = [
    ['Kantharaj Agasa', 'Co-founder & Head Coach', 'Indian MMA Pioneer with 12 professional wins. National-level wrestler. NIS Patiala certified Judo coach. Gold medals in BJJ and Judo.'],
    ['Mohammed Naeem', 'Co-founder & Head of S&C', 'Former professional Indian Hockey player. MSc in Performance Coaching (Setanta College). 8+ years building athletes. Known for sustainable, elite transformations.'],
    ['Packiarajan', 'Boxing Lead', 'NIS Patiala certified Boxing Coach. Multiple national Gold + Best Boxer awards. Former international competitor with decades of ring experience.'],
    ['Venkatesh A', 'Wrestling Coach', 'NIS Patiala certified Wrestling Coach. Master\'s in Sports Management. University-level coaching and certified wrestling official.'],
    ['Spoorthi Nagraj', 'S&C & Women\'s Health', 'Certified S&C Coach specialising in women\'s health, functional movement, and running performance. Animal Flow Level 1 certified.'],
  ];
  return (
    <Section id="team" bg="var(--warm)">
      <Reveal>
        <Eyebrow>Safety comes from expertise</Eyebrow>
        <Heading>Not just coaches. Educators.</Heading>
        <Body style={{ maxWidth: 600 }}>
          Being a great athlete doesn&apos;t make you a great teacher. That&apos;s why we set the bar higher than anyone else. Our hiring standard: compete at the national level, then study at the National Institute of Sports to learn <em>how</em> to teach, then coach at Sports Authority of India, state, or army teams. Only then do they join Namma Combat. This pedigree is your safety guarantee.
        </Body>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {coaches.map(([name, role, creds], i) => (
          <Reveal key={name} delay={i * 0.04}>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--cream)' }}>
              <PhotoBox label={name.split(' ')[0]} h={210} style={{ borderRadius: 0, borderBottom: '1px solid rgba(224,214,200,0.3)' }} />
              <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{name}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--rust)', margin: '0 0 6px' }}>{role}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>{creds}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══ MEMBERSHIPS ═══ */
export function Memberships({ onCta }) {
  const tiers = [
    { name: 'Silver', sub: 'The specialist', desc: 'One floor — your choice',
      story: 'Silver exists because members asked for it. Some already have an S&C routine elsewhere and want combat only. Others want pure strength work without combat. You\'re restricted between floors, but never within your floor — attend every class, every program, as many sessions as you want.',
      features: ['Choose The Arena (all combat sports) or The Sanctuary (all S&C + Animal Flow)', 'Unlimited sessions — no caps, no restrictions within your floor', 'Postural assessment included (valued at ₹7,000 elsewhere)', 'Structured beginner plan to build your foundation safely', 'Saturdays — bring a guest along to train with you'] },
    { name: 'Gold', sub: 'The athlete', desc: 'Both floors — zero limitations', popular: true,
      story: 'This is what we genuinely recommend. Boxing in the morning, S&C in the evening, Animal Flow on the weekend, open gym on the Technogym Skill Row at lunch — Gold gives you complete freedom across both floors with no restrictions whatsoever.',
      features: ['Full access to every combat sport — Boxing, Kickboxing, MMA, BJJ, Wrestling, Judo', 'Full access to the entire strength floor — all equipment, all S&C programs', 'Animal Flow, HIIT, Olympic Lifting — all included, not extra', 'Open gym — Technogym Skill Row, Skill Ski, Hammer Strength air bikes anytime', 'Postural assessment included (valued at ₹7,000 elsewhere)', 'Structured beginner plan + quarterly progress reviews', 'Saturdays — bring a guest along to train with you'] },
    { name: 'Platinum', sub: 'The elite', desc: 'Gold + personal coaching + guests',
      story: 'Everything in Gold, plus dedicated 1-on-1 coaching to accelerate your progress. Whether it\'s technique work, specialised sessions like Yoga or Dance, or focused fight preparation — Platinum gives you the personal attention to reach your goals faster.',
      features: ['Everything in Gold — full access, zero limitations', '2 Personal Training sessions per month (any format you choose)', '2 Guest Passes per month (weekdays)', 'Specialised sessions — Yoga, Dance, or any program via PT', 'Postural assessment + quarterly reviews + personalised programming', 'Saturdays — bring a guest along to train with you'] },
  ];
  return (
    <Section id="memberships" bg="var(--cream)">
      <Reveal><Eyebrow>Commitment to mastery</Eyebrow><Heading>Choose your path.</Heading>
        <Body style={{ maxWidth: 580 }}>Every membership includes a comprehensive postural assessment, a structured beginner plan, and quarterly progress reviews. Monthly, quarterly, semi-annual, and annual packages available.</Body>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <div style={{ borderRadius: 8, border: t.popular ? '2px solid var(--gold)' : '1px solid var(--border)', padding: '28px 24px', background: t.popular ? 'rgba(227,199,104,0.04)' : 'var(--warm)', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {t.popular && <span style={{ position: 'absolute', top: -12, left: 24, background: 'var(--gold)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>Most popular</span>}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 1 }}>{t.name}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--rust)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>{t.sub}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: '0 0 12px' }}>{t.desc}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', lineHeight: 1.65, margin: '0 0 18px', fontStyle: 'italic' }}>{t.story}</p>
              <div style={{ flex: 1 }}>
                {t.features.map((f, j) => (
                  <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, margin: '0 0 8px', paddingLeft: 20, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--rust)', fontWeight: 700 }}>✓</span>{f}
                  </p>
                ))}
              </div>
              <PrimaryBtn onClick={onCta} style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>Enquire now</PrimaryBtn>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.3}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
          Quarterly, semi-annual &amp; annual packages available with significant savings. Single class passes and personal training also available.
        </p>
      </Reveal>
    </Section>
  );
}

/* ═══ FACILITY ═══ */
export function Facility() {
  const items = [
    ['4,200 sq ft', 'Two dedicated floors with modular hybrid flooring — mats for combat, polished wood for Animal Flow'],
    ['AED on-site', 'BLS-certified staff. Every coach is a trained first responder.'],
    ['Pristine hygiene', 'Daily deep-cleaning. Open storage system — no forgotten gear smell, no clutter.'],
    ['Premium equipment', 'Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom stainless steel squat racks'],
    ['Yamaha audio', 'Immersive sound system designed to energise your session. Not background noise.'],
    ['Safety first', 'Separate changing areas for men and women. 24/7 CCTV. Fire safety compliant.'],
  ];
  return (
    <Section bg="var(--warm)">
      <Reveal><Eyebrow>Uncompromising standards</Eyebrow><Heading>Your environment matters.</Heading>
        <Body style={{ maxWidth: 540 }}>This is a sanctuary, not a dungeon. Premium infrastructure, pristine hygiene, and a space where a corporate executive feels as comfortable as a pro athlete.</Body>
      </Reveal>
      <Reveal delay={0.1}><PhotoBox label="The Sanctuary Standard" h={280} style={{ marginBottom: 24 }} /></Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {items.map(([t, d], i) => (
          <Reveal key={i} delay={i * 0.04}>
            <div style={{ padding: '18px 20px', background: 'var(--cream)', borderRadius: 8, borderLeft: '3px solid var(--gold)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t}</h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══ TESTIMONIALS ═══ */
export function Testimonials() {
  const q = [
    ['"As a complete beginner, my experience has been absolutely amazing. The training is customized to suit each individual\'s strengths. The gym is top-notch with world-class trainers — the standards here have far exceeded my expectations."', 'Lochen Raj GM', 'Beginner · 1 month training'],
    ['"I have seen myself transforming mentally and physically. Coaches teach you every tiny detail to correct your form and posture. Overall my experience is really good and I would highly recommend this place."', 'Hindesh Akash', 'Training since October 2025'],
    ['"I run my own MMA gym and was looking to increase my knowledge base. If you are planning to compete professionally, Namma Combat is the place to be. The training is professional and next level. Trust me, this gym is going to produce a lot of champions."', 'Raktim Singha', 'MMA Coach & Gym Owner'],
    ['"One of the best things unique to this academy is their approach towards holistic development of an athlete. From the best coaches to the strength and conditioning program, every aspect is well planned to provide all the support an athlete would require."', 'Sai Anjana G', 'Athlete'],
    ['"I\'ve seen clear improvement in my kids\' stamina, technique, and mindset since joining. If you want professional combat training with world-class coaching, Namma Combat is easily the best in Koramangala."', 'Karthik Eashwar', 'Parent'],
    ['"I have trained under multiple coaches across India but I can say that Coach Bhagyarajan is the best coach I am training under and I have started feeling very confident in just 2 months of training."', 'Shubham', 'Trained across India'],
  ];
  return (
    <Section bg="var(--cream)">
      <Reveal><Eyebrow>What members say</Eyebrow><Heading>Don&apos;t take our word for it.</Heading></Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 20 }}>
        {q.map(([quote, name, tag], i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{ background: 'var(--warm)', borderRadius: 8, padding: 28, border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, color: 'var(--gold)', lineHeight: 1, position: 'absolute', top: 12, left: 20, opacity: 0.5 }}>&ldquo;</div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic', margin: '12px 0 16px', position: 'relative' }}>{quote}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', fontWeight: 600, margin: '0 0 2px' }}>— {name}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>{tag}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══ CONTACT ═══ */
export function Contact({ onCta }) {
  return (
    <Section id="contact" bg="var(--warm)">
      <Reveal><Eyebrow>Find us</Eyebrow><Heading>Your training starts here.</Heading>
        <Body style={{ maxWidth: 480 }}>Whether your goal is to drop weight, learn self-defence, or find an hour of absolute focus — you belong in the Sanctuary.</Body>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
        <Reveal delay={0.1}>
          <div>
            {[['Call / WhatsApp', '77700 87700'], ['Address', '10, 80 Feet Road, 4th Block\nKoramangala, Bangalore'], ['Hours', 'Mon–Sat: 6 AM – 9 PM']].map(([l, v], i) => (
              <div key={i} style={{ marginBottom: 22 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 4px', fontWeight: 600 }}>{l}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>{v}</p>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <PrimaryBtn onClick={onCta}>Book your free trial</PrimaryBtn>
              <a href="https://wa.me/917770087700" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#25D366', border: '1.5px solid #25D366', padding: '12px 24px', borderRadius: 4, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>WhatsApp us</a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.597900076407!2d77.62831337496758!3d12.933545587378346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae153352767a41%3A0xe303dd18a38a359d!2sNamma%20Combat!5e0!3m2!1sen!2sin!4v1776177011564!5m2!1sen!2sin"
            width="100%" height="280" style={{ border: 0, borderRadius: 8 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </Section>
  );
}

/* ═══ LEAD FORM ═══ */
export function LeadForm({ isOpen, onClose }) {
  const [fd, setFd] = useState({ name: '', phone: '', interest: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const submit = () => {
    if (!fd.name || !fd.phone) return;
    setLoading(true);
    const nameParts = fd.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '-';

    // Create hidden iframe to receive form response
    let iframe = document.getElementById('zoho_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'zoho_iframe';
      iframe.name = 'zoho_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create and submit a real HTML form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://crm.zoho.in/crm/WebToLeadForm';
    form.target = 'zoho_iframe';
    form.acceptCharset = 'UTF-8';

    const fields = {
      'xnQsjsdp': '99653fdcad80d5ed508b1cbc2fb6734aa3b626c08882e43a3d49ae09e4d44988',
      'zc_gad': '',
      'xmIwtLD': 'e37346fd7bac7aecec0937355410b4181a99c63b0b93668a95d3dcd0791c2a00afffb244e0a9b96c06a13bb8c8bd5cab',
      'actionType': 'TGVhZHM=',
      'returnURL': 'https://namma-combat-site.vercel.app/trial',
      'First Name': firstName,
      'Last Name': lastName,
      'Phone': fd.phone, 'Lead Source': 'Website',
    };
    if (fd.interest) fields['LEADCF14'] = fd.interest;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setTimeout(() => {
      setDone(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(44,35,24,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--cream)', borderRadius: 12, padding: '36px 32px', maxWidth: 440, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(154,53,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: 22, color: 'var(--rust)' }}>✓</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)', margin: '0 0 8px', textTransform: 'uppercase' }}>We&apos;ll call you soon.</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6 }}>Our team will call you soon to schedule your complimentary trial class.</p>
            <PrimaryBtn onClick={onClose} style={{ marginTop: 20 }}>Done</PrimaryBtn>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 3, color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 8px' }}>Book your free trial</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Start your journey.</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', margin: '0 0 24px' }}>We&apos;ll call to schedule your complimentary trial class.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ k: 'name', l: 'Full name *', t: 'text', p: 'Your name' }, { k: 'phone', l: 'Phone number *', t: 'tel', p: '+91...' }].map(({ k, l, t, p }) => (
                <div key={k}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type={t} placeholder={p} value={fd[k]} onChange={e => setFd({ ...fd, [k]: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>Interested in</label>
                <select value={fd.interest} onChange={e => setFd({ ...fd, interest: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', color: fd.interest ? 'var(--text)' : 'var(--text-muted)', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select...</option>
                  {['Boxing','Kickboxing','MMA - Mixed Martial Arts','Wrestling','Judo','S&C - Strength & Conditioning','Animal Flow','Kids / Youth Program','Not sure — help me decide'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <PrimaryBtn onClick={submit} style={{ width: '100%', textAlign: 'center', marginTop: 4, padding: 16, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting...' : 'Submit — we\'ll call you'}
              </PrimaryBtn>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Or WhatsApp us directly at 77700 87700</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══ FOOTER ═══ */
export function Footer() {
  return (
    <footer style={{ background: 'var(--cream)', padding: '48px 24px 32px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
      <img src="/seal.svg" alt="Namma Combat" style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 3, color: 'var(--rust)', textTransform: 'uppercase', margin: '0 0 6px', fontWeight: 600 }}>Skill · Strength · Sanctuary</p>
      <img src="/logo.svg" alt="Namma Combat" style={{ height: 28, margin: '8px auto 16px', display: 'block' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>© 2026 Namma Combat. All rights reserved.</p>
    </footer>
  );
}

/* ═══ FLOATING WHATSAPP ═══ */
export function FloatingWA() {
  const [h, setH] = useState(false);
  return (
    <a href="https://wa.me/917770087700" target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, background: '#25D366', color: '#fff', borderRadius: 28, padding: '12px 22px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s', transform: h ? 'scale(1.05)' : 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.25)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.312-.726-5.994-1.956l-.42-.312-2.643.886.886-2.643-.312-.42A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
      WhatsApp us
    </a>
  );
}
