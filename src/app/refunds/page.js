'use client';
import { useState, useEffect } from 'react';

const T = { rust: '#9A3520', gold: '#E3C768', cream: '#FEF8EE', warm: '#F5F0E8', text: '#2C2318', textLight: '#6B5D4F', textMuted: '#9B8E80', border: 'rgba(224,214,200,0.5)', fontDisplay: "'Materia Pro', 'Archivo Black', sans-serif", fontSerif: "'Playfair Display', Georgia, serif", fontBody: "'DM Sans', sans-serif" };

export default function RefundPolicyPage() {
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
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 18px' }}>Refund & Cancellation Policy</h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: '0 0 36px', fontStyle: 'italic' }}>Last updated: 20 April 2026</p>
        <div className="policy-body">
          <p>This Refund &amp; Cancellation Policy explains the terms under which Namma Combat handles cancellations, refunds, and membership changes. By booking a trial class, purchasing a membership, or making any payment to Namma Combat, you agree to this policy.</p>
          <h2>1. Trial classes</h2>
          <p>Trial classes are offered <strong>free of charge</strong> as an introduction to our academy. As no payment is made, trial classes are not eligible for any monetary refund.</p>
          <p>If you are unable to attend your scheduled trial class, please inform us at least 4 hours in advance at 77700 87700 or on WhatsApp. This allows us to offer the slot to another prospective member. No-shows or last-minute cancellations may affect our ability to offer you a rescheduled trial class.</p>
          <h2>2. Membership fees</h2>
          <p>All membership fees, whether monthly, quarterly, semi-annual, or annual, are <strong>non-refundable once the membership is activated</strong>. Activation occurs on the first day of access to our facility, or on the start date specified in your membership agreement, whichever is earlier.</p>
          <p>We believe in the quality of our coaching and facility. We strongly encourage every prospective member to take advantage of our complimentary trial class before purchasing a membership. This gives you the opportunity to experience our training, meet our coaches, and understand the programs before committing.</p>
          <h2>3. Credit and transfer in lieu of refund</h2>
          <p>While we do not issue refunds on activated memberships, in exceptional circumstances we may offer:</p>
          <ul>
            <li><strong>Credit:</strong> The unused portion of your membership may be converted to credit toward other services at Namma Combat (personal training, additional packages, or other programs) at our discretion.</li>
            <li><strong>Transfer:</strong> The unused portion of your membership may be transferred to an immediate family member, subject to our review and written approval. The recipient must complete our standard enrolment process.</li>
          </ul>
          <p>Credit and transfer are extended as a goodwill gesture and are not guaranteed. Any approved credit must be used within 12 months from the date of issue.</p>
          <h2>4. Membership freeze (voluntary)</h2>
          <p>We understand life gets in the way of training &mdash; travel, work, family commitments, exams. Every membership includes a built-in freeze allowance that lets you pause without losing days:</p>
          <table>
            <thead>
              <tr><th>Membership duration</th><th>Freeze allowance</th></tr>
            </thead>
            <tbody>
              <tr><td>1 month</td><td>7 days</td></tr>
              <tr><td>3 months</td><td>21 days</td></tr>
              <tr><td>6 months</td><td>28 days</td></tr>
              <tr><td>12 months (annual)</td><td>35 days</td></tr>
            </tbody>
          </table>
          <p><strong>How it works:</strong></p>
          <ul>
            <li>Your membership end date is extended by the freeze duration used.</li>
            <li>Freeze must be requested <strong>in advance</strong> via email or at the facility. It cannot be applied retroactively beyond 7 days from the request date.</li>
            <li>Freeze days can be taken in one block or broken into smaller periods within the same membership cycle.</li>
            <li>Unused freeze days do not carry over to a renewal or future membership.</li>
          </ul>
          <h2>5. Medical pause (separate from voluntary freeze)</h2>
          <p>In addition to the voluntary freeze allowance above, we grant a separate medical pause for documented health reasons.</p>
          <ul>
            <li>Medical pause requires a doctor&apos;s note or medical certificate specifying the recommended period of rest</li>
            <li>Standard medical pause is granted up to 90 days per membership year</li>
            <li>For serious injuries or prolonged medical conditions, pauses beyond 90 days may be granted on a case-by-case basis with a valid medical certificate and ongoing documentation</li>
            <li>Medical pause runs independently of your voluntary freeze allowance &mdash; you do not lose freeze days when using a medical pause</li>
            <li>Requested via email to privacy@nammacombat.com or in person</li>
          </ul>
          <p>Your membership end date is extended by the approved medical pause duration.</p>
          <h2>6. Personal training and package sessions</h2>
          <p>Personal training sessions and class packages (e.g., 10-class packs) purchased separately from a membership:</p>
          <ul>
            <li>Are non-refundable once purchased</li>
            <li>Must be used within 6 months from the date of purchase</li>
            <li>Cannot be carried over beyond the expiry period</li>
            <li>Can be transferred to another member within the same household, subject to our approval</li>
          </ul>
          <h2>7. Payment failures and duplicate payments</h2>
          <p>If your payment fails during the booking process but the amount is debited from your account, the amount will be automatically refunded to your original payment method within 5 to 7 business days by our payment processor. You do not need to contact us &mdash; this happens automatically.</p>
          <p>If a duplicate payment is made due to a technical error, please notify us at privacy@nammacombat.com within 7 days of the transaction with supporting details (transaction reference, bank statement). We will verify and process the refund within 10 business days.</p>
          <h2>8. Cancellation by Namma Combat</h2>
          <p>In rare circumstances, we may need to cancel a class, program, or membership due to reasons including but not limited to: public health directives, facility damage, natural events, or coach unavailability. In such cases:</p>
          <ul>
            <li>Affected classes will be rescheduled at no additional cost</li>
            <li>If we are unable to reschedule within a reasonable time, a pro-rated credit will be applied to your account</li>
            <li>Memberships that cannot be honoured at all will be refunded on a pro-rated basis</li>
          </ul>
          <h2>9. How to request</h2>
          <p>For all refund-related requests, medical pauses, transfers, or credits:</p>
          <p><strong>Email:</strong> privacy@nammacombat.com<br/><strong>Phone:</strong> 77700 87700<br/><strong>In person:</strong> 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>
          <p>Please include your full name, registered phone number, membership details, and the nature of your request. We will acknowledge within 2 business days and resolve within 10 business days.</p>
          <h2>10. Changes to this policy</h2>
          <p>We may update this Refund &amp; Cancellation Policy from time to time. The most current version will always be posted on this page with the updated date. Changes apply only to transactions made after the update date.</p>
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
