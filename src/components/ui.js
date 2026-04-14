'use client';
import { useState, useEffect, useRef } from 'react';

/* ─── Scroll Reveal ─── */
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style,
    }}>{children}</div>
  );
}

/* ─── Typography ─── */
export function GoldBar() {
  return <div style={{ width: 48, height: 3, background: 'var(--gold)', margin: '14px 0 20px', borderRadius: 2 }} />;
}

export function Eyebrow({ children, style = {} }) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 3, color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 8px', ...style }}>{children}</p>;
}

export function Heading({ children, style = {} }) {
  return <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1, ...style }}>{children}</h2>;
}

export function SubHeading({ children, style = {} }) {
  return <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-light)', lineHeight: 1.5, margin: '0 0 8px', fontStyle: 'italic', fontWeight: 400, ...style }}>{children}</p>;
}

export function Body({ children, style = {} }) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-light)', lineHeight: 1.7, margin: '0 0 20px', ...style }}>{children}</p>;
}

/* ─── Buttons ─── */
export function PrimaryBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, background: h ? 'var(--rust-hover)' : 'var(--rust)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 4, cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.25s ease', transform: h ? 'translateY(-1px)' : 'none', ...style }}>{children}</button>
  );
}

export function GhostBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, background: h ? 'rgba(154,53,32,0.06)' : 'transparent', color: 'var(--rust)', border: '1.5px solid var(--rust)', padding: '12px 24px', borderRadius: 4, cursor: 'pointer', letterSpacing: 0.3, transition: 'all 0.25s ease', ...style }}>{children} →</button>
  );
}

/* ─── Photo Placeholder ─── */
export function PhotoBox({ label, h = 200, style = {} }) {
  return (
    <div style={{
      height: h, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(145deg, #2C2318 0%, #3D2E1F 50%, #2C2318 100%)', ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(227,199,104,0.5) 20px, rgba(227,199,104,0.5) 21px)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {label && <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 3vw, 28px)', color: 'rgba(227,199,104,0.2)', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 8px', fontWeight: 900 }}>{label}</p>}
        <div style={{ width: 32, height: 1, background: 'rgba(227,199,104,0.2)', margin: '0 auto' }} />
      </div>
    </div>
  );
}

/* ─── Section Wrapper ─── */
export function Section({ children, id, bg = 'var(--cream)', style = {} }) {
  return (
    <section id={id} style={{ background: bg, padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>
    </section>
  );
}
