'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

export default function TermsOfServicePage() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(true); }, []);
  return (
    <><style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap');@font-face{font-family:'Materia Pro';src:url('/fonts/MateriaPro-Bold.otf') format('opentype');font-weight:700;font-style:normal;font-display:swap;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:${T.cream};color:${T.text};-webkit-font-smoothing:antialiased;}.policy-body h2{font-family:${T.fontDisplay};font-size:22px;font-weight:900;color:${T.text};text-transform:uppercase;letter-spacing:0.5px;margin:40px 0 14px;}.policy-body h3{font-family:${T.fontDisplay};font-size:15px;font-weight:900;color:${T.rust};text-transform:uppercase;letter-spacing:1px;margin:28px 0 10px;}.policy-body p{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 14px;}.policy-body ul{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 18px 20px;padding:0;}.policy-body li{margin-bottom:6px;}.policy-body strong{color:${T.text};font-weight:600;}.policy-body a{color:${T.rust};text-decoration:underline;}.policy-body table{width:100%;border-collapse:collapse;margin:12px 0 22px;font-family:${T.fontBody};font-size:14px;}.policy-body th{text-align:left;padding:10px 14px;background:${T.warm};color:${T.text};font-weight:700;border:1px solid ${T.border};}.policy-body td{padding:10px 14px;color:${T.textLight};border:1px solid ${T.border};}`}</style>
    <div style={{ minHeight: '100vh', background: T.cream }}>
      <div style={{ background: T.cream, padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center' }}><a href="/" style={{ display: 'inline-flex' }}><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a></div>
      <div style={{ padding: '48px 24px 64px', maxWidth: 760, margin: '0 auto', opacity: v?1:0, transform: v?'translateY(0)':'translateY(20px)', transition: 'all 0.6s ease' }}>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>Legal</p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>Terms of Service</h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: '0 0 36px', fontStyle: 'italic' }}>Last updated: 20 April 2026</p>
        <div className="policy-body">
          <p>These Terms of Service (&quot;Terms&quot;) govern your use of nammacombat.com and the services offered through it. By using this website, you agree to these Terms. If you do not agree, please do not use the website.</p>
          <h2>1. Who we are</h2>
          <p>Namma Combat is a combat sports and strength training academy operated as a sole proprietorship, based at 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034.</p>
          <h2>2. Use of the website</h2>
          <p>This website is provided for informational and booking purposes. You may browse our content, read about our programs, and submit forms to book trial classes or make enquiries. You agree to use the website only for lawful purposes and not to:</p>
          <ul>
            <li>Use automated tools to scrape, copy, or download our content</li>
            <li>Interfere with or disrupt the website or its servers</li>
            <li>Submit false, misleading, or harmful information through our forms</li>
            <li>Impersonate any person or entity</li>
          </ul>
          <h2>3. Trial classes and enrolment</h2>
          <p>Submitting a trial class request through our website is not a guarantee of enrolment. Our team will contact you to schedule your class based on availability. Actual enrolment as a member is subject to a separate in-person process, including a health declaration, and payment of membership fees as per our price list at the time of enrolment.</p>
          <h2>4. Intellectual property</h2>
          <p>All content on this website, including text, images, logos, photographs, videos, graphic design, and curriculum descriptions, is owned by Namma Combat or used with permission. You may not copy, reproduce, distribute, or create derivative works from our content without our written consent, except for personal, non-commercial use.</p>
          <p>The &quot;Namma Combat&quot; name, logo, and brand identity are trademarks of our business.</p>
          <h2>5. Third-party services</h2>
          <p>Our website uses third-party services including Zoho CRM, Google Analytics, Google Fonts, WhatsApp, and others. When you interact with these services through our website, the respective provider&apos;s terms and privacy policies also apply. We are not responsible for the practices of third-party services.</p>
          <h2>6. Safety and fitness to train</h2>
          <p>Combat sports and strength training carry inherent physical risks. Content on this website is for informational purposes only and does not constitute medical advice. Before starting any training program, we recommend consulting a qualified medical professional, especially if you have any pre-existing conditions. Every member completes a health declaration at the time of enrolment, and training is subject to a separate safety and liability agreement signed in person.</p>
          <h2>7. Disclaimers</h2>
          <p>The website is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee that the website will be uninterrupted, error-free, or free of viruses. Training outcomes, fitness improvements, or skill development described on our landing pages are illustrative and vary from person to person.</p>
          <h2>8. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Namma Combat is not liable for any indirect, incidental, consequential, or special damages arising from your use of this website. Our total liability for any claim related to this website is limited to &#8377;10,000 or the amount you have paid us (if any), whichever is lower.</p>
          <h2>9. Governing law and jurisdiction</h2>
          <p>These Terms are governed by the laws of India. Any disputes arising from your use of this website shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
          <h2>10. Changes to these Terms</h2>
          <p>We may revise these Terms from time to time. The most current version will always be posted on this page with the updated date. Continued use of the website after changes means you accept the updated Terms.</p>
          <h2>11. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>Email: privacy@nammacombat.com<br/>Phone: 77700 87700<br/>Address: 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>
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
