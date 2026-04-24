# Shared page template
TEMPLATE = '''\'use client\';
import { useState, useEffect } from \'react\';

const T = { rust: \'#9A3520\', gold: \'#E3C768\', cream: \'#FEF8EE\', warm: \'#F5F0E8\', text: \'#2C2318\', textLight: \'#6B5D4F\', textMuted: \'#9B8E80\', border: \'rgba(224,214,200,0.5)\', fontDisplay: "\'Materia Pro\', \'Archivo Black\', sans-serif", fontSerif: "\'Playfair Display\', Georgia, serif", fontBody: "\'DM Sans\', sans-serif" };

export default function __PAGE_NAME__() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(true); }, []);
  return (
    <><style jsx global>{`@import url(\'https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital@0;1&display=swap\');@font-face{font-family:\'Materia Pro\';src:url(\'/fonts/MateriaPro-Bold.otf\') format(\'opentype\');font-weight:700;font-style:normal;font-display:swap;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:${T.cream};color:${T.text};-webkit-font-smoothing:antialiased;}.policy-body h2{font-family:${T.fontDisplay};font-size:22px;font-weight:900;color:${T.text};text-transform:uppercase;letter-spacing:0.5px;margin:40px 0 14px;}.policy-body h3{font-family:${T.fontDisplay};font-size:15px;font-weight:900;color:${T.rust};text-transform:uppercase;letter-spacing:1px;margin:28px 0 10px;}.policy-body p{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 14px;}.policy-body ul{font-family:${T.fontBody};font-size:15px;color:${T.textLight};line-height:1.7;margin:0 0 18px 20px;padding:0;}.policy-body li{margin-bottom:6px;}.policy-body strong{color:${T.text};font-weight:600;}.policy-body a{color:${T.rust};text-decoration:underline;}.policy-body table{width:100%;border-collapse:collapse;margin:12px 0 22px;font-family:${T.fontBody};font-size:14px;}.policy-body th{text-align:left;padding:10px 14px;background:${T.warm};color:${T.text};font-weight:700;border:1px solid ${T.border};}.policy-body td{padding:10px 14px;color:${T.textLight};border:1px solid ${T.border};}`}</style>
    <div style={{ minHeight: \'100vh\', background: T.cream }}>
      <div style={{ background: T.cream, padding: \'14px 24px\', borderBottom: `1px solid ${T.border}`, display: \'flex\', justifyContent: \'center\' }}><a href="/" style={{ display: \'inline-flex\' }}><img src="/logo.svg" alt="Namma Combat" style={{ height: 28 }} /></a></div>
      <div style={{ padding: \'48px 24px 64px\', maxWidth: 760, margin: \'0 auto\', opacity: v?1:0, transform: v?\'translateY(0)\':\'translateY(20px)\', transition: \'all 0.6s ease\' }}>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, letterSpacing: 3, color: T.rust, textTransform: \'uppercase\', fontWeight: 600, margin: \'0 0 12px\' }}>__EYEBROW__</p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: \'clamp(30px, 5vw, 44px)\', fontWeight: 900, color: T.text, lineHeight: 1.1, textTransform: \'uppercase\', letterSpacing: 1, margin: \'0 0 18px\' }}>__TITLE__</h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: \'0 0 36px\', fontStyle: \'italic\' }}>Last updated: 20 April 2026</p>
        <div className="policy-body">
__CONTENT__
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: \'28px 24px 20px\', textAlign: \'center\', background: T.cream }}>
        <div style={{ marginBottom: 14, display: \'flex\', justifyContent: \'center\', gap: 20, flexWrap: \'wrap\' }}>
          <a href="/privacy" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: \'none\' }}>Privacy</a>
          <a href="/terms" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: \'none\' }}>Terms</a>
          <a href="/refunds" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: \'none\' }}>Refunds</a>
          <a href="/shipping" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textDecoration: \'none\' }}>Shipping</a>
        </div>
        <p style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: 3, color: T.rust, textTransform: \'uppercase\', margin: \'0 0 4px\', fontWeight: 600 }}>Skill &middot; Strength &middot; Sanctuary</p>
        <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>&copy; 2026 Namma Combat. All rights reserved.</p>
      </div>
    </div></>
  );
}
'''

# Content for each page (valid JSX inside the content div)
PRIVACY_CONTENT = '''          <p>Namma Combat (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) values your privacy. This Privacy Policy explains what personal information we collect from visitors to nammacombat.com, how we use it, and the choices you have. Please read this carefully before using our website or submitting any form.</p>
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
            <li><strong>Zoho CRM</strong> (Zoho Corporation, India) &mdash; we use Zoho to store and manage lead information submitted through our forms. Zoho acts as our data processor and is bound by its own data protection standards.</li>
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
          <p>We may update this Privacy Policy from time to time. When we do, we will change the &quot;Last updated&quot; date at the top. If the changes are significant, we will notify you by email or a prominent notice on the website.</p>'''

TERMS_CONTENT = '''          <p>These Terms of Service (&quot;Terms&quot;) govern your use of nammacombat.com and the services offered through it. By using this website, you agree to these Terms. If you do not agree, please do not use the website.</p>
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
          <p>Email: privacy@nammacombat.com<br/>Phone: 77700 87700<br/>Address: 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>'''

REFUNDS_CONTENT = '''          <p>This Refund &amp; Cancellation Policy explains the terms under which Namma Combat handles cancellations, refunds, and membership changes. By booking a trial class, purchasing a membership, or making any payment to Namma Combat, you agree to this policy.</p>
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
          <p>We may update this Refund &amp; Cancellation Policy from time to time. The most current version will always be posted on this page with the updated date. Changes apply only to transactions made after the update date.</p>'''

SHIPPING_CONTENT = '''          <p>Namma Combat is a combat sports and strength training academy. We provide <strong>services</strong> (training classes, personal coaching, memberships) at our physical facility in Koramangala, Bangalore. We do not sell, ship, or deliver any physical products through this website.</p>
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
          <p><strong>Email:</strong> privacy@nammacombat.com<br/><strong>Phone:</strong> 77700 87700<br/><strong>Address:</strong> 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034</p>'''

# Generate each page
pages = [
    ('privacy', 'PrivacyPolicyPage', 'Legal', 'Privacy Policy', PRIVACY_CONTENT),
    ('terms', 'TermsOfServicePage', 'Legal', 'Terms of Service', TERMS_CONTENT),
    ('refunds', 'RefundPolicyPage', 'Legal', 'Refund & Cancellation Policy', REFUNDS_CONTENT),
    ('shipping', 'ShippingPolicyPage', 'Legal', 'Shipping & Delivery Policy', SHIPPING_CONTENT),
]

import os
for folder, page_name, eyebrow, title, content in pages:
    os.makedirs(f'src/app/{folder}', exist_ok=True)
    code = TEMPLATE.replace('__PAGE_NAME__', page_name).replace('__EYEBROW__', eyebrow).replace('__TITLE__', title).replace('__CONTENT__', content)
    with open(f'src/app/{folder}/page.js', 'w') as f:
        f.write(code)
    print(f'Created src/app/{folder}/page.js')

# Update homepage Footer in Sections.js
sections_path = 'src/components/Sections.js'
c = open(sections_path).read()

OLD_FOOTER = '''      <img src="/logo.svg" alt="Namma Combat" style={{ height: 28, margin: '8px auto 16px', display: 'block' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>© 2026 Namma Combat. All rights reserved.</p>'''

NEW_FOOTER = '''      <img src="/logo.svg" alt="Namma Combat" style={{ height: 28, margin: '8px auto 16px', display: 'block' }} />
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        <a href="/privacy" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
        <a href="/terms" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        <a href="/refunds" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Refunds</a>
        <a href="/shipping" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Shipping</a>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>© 2026 Namma Combat. All rights reserved.</p>'''

if OLD_FOOTER in c:
    c = c.replace(OLD_FOOTER, NEW_FOOTER)
    open(sections_path, 'w').write(c)
    print('Updated homepage Footer with policy links')
else:
    print('WARNING: Homepage footer pattern not matched - check manually')

print('Done!')
