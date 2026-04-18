'use client';
import { useState, useEffect } from 'react';
import { PrimaryBtn } from './ui';

export default function Nav({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const go = (id) => {
    setMob(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  const links = [['journey', 'Your Journey'], ['arena', 'The Arena'], ['sanctuary', 'The Sanctuary'], ['team', 'Team'], ['facility', 'Facility'], ['schedule', 'Schedule'], ['memberships', 'Memberships'], ['contact', 'Contact']];
  
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(254,248,238,0.97)' : 'rgba(254,248,238,0.85)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`, transition: 'all 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 24px' }}>
          <img src="/logo.svg" alt="Namma Combat" style={{ height: 36, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <div className="nc-desk" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {links.map(([id, label]) => (
              <span key={id} onClick={() => go(id)} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-light)', cursor: 'pointer', fontWeight: 400 }}>{label}</span>
            ))}
            <PrimaryBtn onClick={onCta} style={{ padding: '10px 22px', fontSize: 12 }}>Book free trial</PrimaryBtn>
          </div>
          <div className="nc-mob-btn" onClick={() => setMob(!mob)} style={{ display: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ width: 18, height: 2, background: 'var(--text)', transition: 'all 0.3s', transform: mob ? 'rotate(45deg) translateY(3.5px)' : 'none' }} />
            <span style={{ width: 18, height: 2, background: 'var(--text)', transition: 'all 0.3s', opacity: mob ? 0 : 1 }} />
            <span style={{ width: 18, height: 2, background: 'var(--text)', transition: 'all 0.3s', transform: mob ? 'rotate(-45deg) translateY(-3.5px)' : 'none' }} />
          </div>
        </div>
        {mob && (
          <div style={{ background: 'var(--cream)', padding: '16px 24px 24px', borderTop: '1px solid var(--border)' }}>
            {links.map(([id, label]) => (
              <div key={id} onClick={() => go(id)} style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)', padding: '10px 0', cursor: 'pointer', borderBottom: '0.5px solid var(--border)' }}>{label}</div>
            ))}
            <PrimaryBtn onClick={() => { setMob(false); onCta(); }} style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>Book free trial</PrimaryBtn>
          </div>
        )}
      </nav>
      <style jsx global>{`
        @media(max-width:768px){.nc-desk{display:none!important}.nc-mob-btn{display:flex!important}}
      `}</style>
    </>
  );
}
