'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

export default function PrivacyPolicyPage() {
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
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: '0 0 36px', fontStyle: 'italic' }}>Last updated: 20 April 2026</p>
        <div className="policy-body">
          <p>Namma Combat (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) values your privacy. This Privacy Policy explains what personal information we collect from visitors to nammacombat.com, how we use it, and the choices you have. Please read this carefully before using our website or submitting any form.</p>
          <h2>1. Who we are</h2>
          <p>Namma Combat is a combat sports and strength training academy operating as a sole proprietorship, located at 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034, Karnataka, India. You can reach us at privacy@nammacombat.com or 77700 87700.</p>
          <h2>2. What information we collect</h2>
          <p>When you book a trial class or fill out any enquiry form on our website, we collect:</p>
          <ul>
            <li>Your full name</li>
            <li>Your phone number</li>
            <li>Your area of interest (Boxing, Kickboxing, MMA, BJJ, Wrestling, Judo, S&amp;C, Animal Flow, Kids program, or other disciplines we offer)</li>
            <li>The page or source through which you reached us</li>
            <li>The date and time of submission</li>
          </ul>
          <p>We do not collect financial information, government identification numbers, health records, passwords, or any other sensitive personal data through this website.</p>
          <p>When you browse our website, we automatically collect basic analytics information such as device type, browser, pages viewed, and approximate location (city-level only). This is handled through Google Analytics 4.</p>
          <h2>3. How we collect information</h2>
          <p>Information is collected only when you actively submit a form on our website or when your browser loads our analytics code as you browse. We do not use tracking pixels, advertising cookies, or third-party trackers beyond Google Analytics.</p>
          <h2>4. Why we use your information</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Contact you to schedule your trial class or respond to your enquiry</li>
            <li>Inform you about relevant classes, schedules, or program updates if you sign up as a member</li>
            <li>Improve our website and understand how visitors use our content</li>
            <li>Meet our legal and regulatory obligations</li>
          </ul>
          <p>We do not sell, rent, or trade your personal information to any third party for marketing purposes.</p>
          <h2>5. Who we share information with</h2>
          <p>We share limited information only with:</p>
          <ul>
            <li><strong>Hosting and infrastructure providers</strong> (Vercel Inc., Supabase Inc.) &mdash; our website and database run on these platforms; they process your information solely to keep our services operating.</li>
            <li><strong>Google Analytics 4</strong> (Google LLC) &mdash; we use Google Analytics to understand website traffic. Google may process this data outside India.</li>
            <li><strong>Service providers and authorities</strong> &mdash; if required by law, court order, or government regulation.</li>
          </ul>
          <p>We do not share your information with advertisers, marketers, or any party not listed above.</p>
          <h2>6. How long we keep your information</h2>
          <ul>
            <li><strong>Unconverted leads:</strong> 24 months from the date of submission, after which we delete or anonymise the data.</li>
            <li><strong>Active members:</strong> for the duration of your membership plus 3 years, to meet record-keeping and legal obligations.</li>
            <li><strong>Website analytics:</strong> Google Analytics retains aggregated data for a maximum of 14 months.</li>
          </ul>
          <h2>7. Your rights</h2>
          <p>Under India&apos;s Digital Personal Data Protection Act, 2023 and other applicable laws, you have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct or update inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Withdraw consent for processing</li>
            <li>Receive a copy of your information in a portable format</li>
            <li>Nominate another person to exercise these rights on your behalf</li>
            <li>Lodge a grievance with our Grievance Officer or the Data Protection Board of India</li>
          </ul>
          <p>To exercise any of these rights, email us at privacy@nammacombat.com. We will respond within 30 days.</p>
          <h2>8. Cookies</h2>
          <p>Our website uses only essential functional cookies and Google Analytics cookies. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though some features of the website may not work as expected if you do.</p>
          <h2>9. Data security</h2>
          <p>We take reasonable technical and organisational measures to protect your information, including secure transmission (HTTPS), restricted internal access, and use of reputable service providers. However, no system is completely secure, and we cannot guarantee absolute security.</p>
          <h2>10. Children</h2>
          <p>Our website is intended for use by adults. If you are under 18, please do not submit any personal information without the involvement of a parent or guardian. Our kids program enrolment is handled by parents directly.</p>
          <h2>11. Grievance Officer</h2>
          <p>In accordance with India&apos;s Digital Personal Data Protection Act, 2023, you may contact our Grievance Officer regarding any concerns about your personal data:</p>
          <p><strong>Grievance Officer &mdash; Namma Combat</strong><br/>Email: privacy@nammacombat.com<br/>Address: 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>
          <h2>12. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. When we do, we will change the &quot;Last updated&quot; date at the top. If the changes are significant, we will notify you by email or a prominent notice on the website.</p>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '28px 24px 20px', textAlign: 'center', background: T.cream }}>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Terms</a>
          <a href="/refunds" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Refunds</a>
          <a href="/shipping" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>Shipping</a>
        </div>
        <img src="/seal.svg" alt="Namma Combat" style={{ width: 56, height: 56, margin: '0 auto 12px', display: 'block' }} /><p style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: 3, color: T.rust, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600 }}>Skill &middot; Strength &middot; Sanctuary</p>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>&copy; 2026 Namma Combat. All rights reserved.</p>
      </div>
    </div></>
  );
}
