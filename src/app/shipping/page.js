'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

export default function ShippingPolicyPage() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(true); }, []);
  return (
    <><style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');@font-face{font-family:'Materia Pro';src:url('/fonts/MateriaPro-Bold.otf') format('opentype');font-weight:700;font-style:normal;font-display:swap;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:${T.cream};color:${T.text};-webkit-font-smoothing:antialiased;}.policy-body h2{font-family:${T.fontDisplay};font-size:22px;font-weight:900;color:${T.text};text-transform:uppercase;letter-spacing:0.5px;margin:40px 0 14px;}.policy-body h3{font-family:${T.fontDisplay};font-size:15px;font-weight:900;color:${T.rust};text-transform:uppercase;letter-spacing:1px;margin:28px 0 10px;}.policy-body p{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 14px;}.policy-body ul{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 18px 20px;padding:0;}.policy-body li{margin-bottom:6px;}.policy-body strong{color:${T.text};font-weight:600;}.policy-body a{color:${T.rust};text-decoration:underline;}.policy-body table{width:100%;border-collapse:collapse;margin:12px 0 22px;font-family:${T.fontBody};font-size:14px;}.policy-body th{text-align:left;padding:10px 14px;background:${T.warm};color:${T.text};font-weight:700;border:1px solid ${T.border};}.policy-body td{padding:10px 14px;color:${T.textLight};border:1px solid ${T.border};}`}</style>
    <div style={{ minHeight: '100vh', background: T.cream }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: 'none' }} id="nc-progress-wrap"><div id="nc-progress-bar" style={{ height: '100%', width: '0%', background: T.gold, transition: 'width 0.1s linear' }} /></div>
      <button aria-label="Scroll to top" onClick={() => window.scrollTo({top:0, behavior:'smooth'})} id="nc-scroll-top" style={{ position: 'fixed', bottom: 92, right: 24, zIndex: 89, width: 44, height: 44, borderRadius: '50%', background: T.gold, color: T.text, border: 'none', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(227,199,104,0.35)', transition: 'all 0.2s ease' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
      <script dangerouslySetInnerHTML={{ __html: `if(typeof window!=='undefined'){window.addEventListener('scroll',function(){var h=document.documentElement;var t=h.scrollHeight-h.clientHeight;var p=t>0?(h.scrollTop/t)*100:0;var bar=document.getElementById('nc-progress-bar');if(bar)bar.style.width=p+'%';var btn=document.getElementById('nc-scroll-top');if(btn)btn.style.display=h.scrollTop>500?'flex':'none';});}` }} />
      <div style={{ background: T.cream, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center' }}><a href="/" style={{ display: 'inline-flex' }}><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a></div>
      <div style={{ padding: '48px 24px 64px', maxWidth: 760, margin: '0 auto', opacity: v?1:0, transform: v?'translateY(0)':'translateY(20px)', transition: 'all 0.6s ease' }}>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>Legal</p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>Shipping & Delivery Policy</h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: '0 0 36px', fontStyle: 'italic' }}>Last updated: 20 April 2026</p>
        <div className="policy-body">
          <p>Namma Combat is a combat sports and strength training academy. We provide <strong>services</strong> (training classes, personal coaching, memberships) at our physical facility in Koramangala, Bangalore. We do not sell, ship, or deliver any physical products through this website.</p>
          <h2>Service delivery</h2>
          <ul>
            <li><strong>Trial classes and memberships</strong> are delivered in person at our facility: 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034.</li>
            <li><strong>Access to your membership</strong> is activated on the first day of your training, or on the start date specified in your membership agreement, whichever is earlier.</li>
            <li><strong>Personal training sessions and class packages</strong> are scheduled and delivered in person at the same address.</li>
            <li><strong>Digital confirmations</strong> (class bookings, payment receipts, membership activations) are sent to your registered email and phone number typically within a few minutes of payment confirmation, and in any case within 24 hours.</li>
          </ul>
          <h2>No physical shipping</h2>
          <p>Because we do not sell physical goods, no shipping, courier, or delivery charges apply to any transaction with Namma Combat.</p>
          <h2>Contact</h2>
          <p>For questions about service delivery or any issue with activation:</p>
          <p><strong>Email:</strong> privacy@nammacombat.com<br/><strong>Phone:</strong> 77700 87700<br/><strong>Address:</strong> 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '28px 24px 20px', textAlign: 'center', background: T.cream }}>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Terms</a>
          <a href="/refunds" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Refunds</a>
          <a href="/shipping" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Shipping</a>
        </div>
        <p style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600 }}>Skill &middot; Strength &middot; Sanctuary</p>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>&copy; 2026 Namma Combat. All rights reserved.</p>
      </div>
    </div></>
  );
}
