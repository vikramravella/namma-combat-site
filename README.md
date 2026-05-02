# Namma Combat Website — Project Documentation

**Last updated: May 3, 2026**

Founded by Vinod Karuturi. Built solo after firing the previous dev team. All accounts under Vinod's control.

---

## ▶ TOMORROW MORNING — RESUME HERE (May 3, 2026 late night)

**Big decision tonight:** building NCC's own admin platform to replace Zoho dependency. Zoho stays running untouched — we build in parallel and migrate piece by piece.

### Why
- Zoho is too confusing — 18 Deluge functions, 27 fields, v6/v8 endpoint inconsistency, function source not API-readable, 3-product UI sprawl (CRM/Books/Forms). Even with API access, key things require manual UI clicks
- Monthly cost (~₹3-8k saved) recovered into our own infra
- Vinod is going to build a member booking app eventually anyway — this platform IS that app's backend, no throwaway work
- Vinod's quote: *"this zoho is too confusing... instead of being dependent on third party and pay them monthly this is the best way"*

### Phase 1 MVP scope (THIS WEEK — 3-4 days focused build)
**Admin-only back-office tool.** No member-facing stuff yet.
- Vinod's login (1-2 staff later)
- Add/edit member records (mirror Zoho Trials/Members fields)
- Create memberships (tier, billing cycle, dates, payment status, freeze tracking — match Zoho Deals model)
- Generate GST-compliant PDF invoices: CGST 2.5% + SGST 2.5%, SAC 999723, GSTIN 29AHXPV9545M2ZR, sequential numbering
- Send invoice as link via email/WhatsApp (manual share initially)
- Basic dashboard: today's revenue, active members, expiring this week

### Architecture (locked in)
- **Repo:** fold platform into existing `namma-combat-site` repo as `/admin` (staff) and later `/portal` (members) routes. Marketing site stays at root. One deploy, shared auth.
- **Stack:** Next.js 14 + Postgres (Supabase or Vercel Postgres) + Tailwind/shadcn + Prisma + NextAuth (or similar) for staff
- **Dual-write:** every action writes to BOTH new DB AND Zoho during transition (use existing Zoho API access at `~/.zoho/credentials`) so nothing breaks

### Two unblocks needed from Vinod tomorrow morning (~15 min total)
1. **Subdomain pick:** `app.nammacombat.com` / `portal.nammacombat.com` / `members.nammacombat.com` — or "you pick"
2. **Database:** sign up free at supabase.com (Google login, 2 min) → create project `namma-combat` → paste connection string. OR say "you pick" → use Vercel Postgres (zero setup)

Everything else (Razorpay, MSG91, Resend, WhatsApp via Meta) wired later as needed.

### Phased roadmap (parallel-run with Zoho throughout)
- **Week 1:** Phase 1 MVP above (admin login + member CRUD + invoicing)
- **Weeks 3-5:** Phase 2 — Member portal (login, see status, freeze), public trial booking form replacing Zoho Forms
- **Weeks 3-5:** Phase 3 — Membership lifecycle automation (renewal, freeze, expiry) + WhatsApp/SMS via Meta Business API + MSG91
- **Weeks 6-8:** Phase 4 — Full Books replacement (parallel-run for 1 month, CA review, then cut over)
- **Weeks 9+:** Phase 5 — Decommission Zoho CRM (optionally keep Books as 1-quarter safety net)

### Lead form migration (free win during Phase 2)
~18 lead forms across the site (homepage + 14 discipline landings + 3 coach pages) currently POST to Zoho. New API route `/api/leads` will dual-write. One PR switches them all over.

### Cost while building
₹0. Vercel free tier + Supabase free tier handles everything until ~50k members.

### Vinod's schedule
Committed (May 3) to 6 hrs sleep/day going forward. Default to "you pick" in choices, batch decisions, async-friendly handoffs.

---

## Quick Start

```bash
cd ~/Downloads/namma-combat-site
npm install
npm run dev
# Site runs at http://localhost:3000
```

---

## Deployment

- **Hosting:** Vercel (free) — auto-deploys on push to GitHub main
- **GitHub:** github.com/vikramravella/namma-combat-site
- **Vercel account:** vi@nammacombat.com
- **Vercel project:** namma-combat-site

### Live domains (all serve the same site)
- **nammacombat.com** ✅ primary
- **www.nammacombat.com** ✅
- **academy.nammacombat.com** ✅ (kept because early flyers used this URL)

### Domain registrar
- **Namecheap** (login: vinodkaruturi)
- **Nameservers:** ns1.vercel-dns.com, ns2.vercel-dns.com

### DNS records on Vercel
- A @ → 216.198.79.1
- CNAME www → 40017a59b7045eeb.vercel-dns-017.com
- CNAME academy → cname.vercel-dns.com
- TXT _vercel → verification (added to claim domain)

### Domain recovery history
Old developer's Vercel account (developers@nammacombat.com) originally held the domain. Recovered on April 18, 2026 via Vercel support. Old account no longer blocks the domain.

---

## How to make changes

1. `cd ~/Downloads/namma-combat-site`
2. Edit via `sed` / `python3` commands OR download updated files from Claude and `cp` them in
3. `git add . && git commit -m "description" && git push`
4. Vercel auto-deploys in ~30 seconds

Harmless shell warnings to ignore:
- `zsh: command not found: #` → from inline comment lines, ignore
- `zsh: number expected` → from `<<` in Python heredocs, ignore

---

## Tech Stack

- **Framework:** Next.js 14.2 (App Router), React
- **Styling:** Inline styles + CSS variables in `src/app/globals.css` (no Tailwind)
- **Font:** Materia Pro Bold (`public/fonts/MateriaPro-Bold.otf`)
- **Fallback font:** Archivo Black
- **Brand Colors:** Rust #9A3520, Gold #E3C768, Cream #FEF8EE, Warm #F5F0E8
- **Tagline:** Skill · Strength · Sanctuary
- **Positioning:** "India's premier combat sports academy"

---

## File Structure

```
src/
  app/
    page.js                           — Homepage (assembles all sections)
    layout.js                         — SEO meta, viewport, GA4, fonts, LocalBusiness JSON-LD
    globals.css                       — CSS variables + mobile CSS + gold accent styles
    loading.js                        — Gold page transition loader
    robots.js                         — robots.txt generator (App Router pattern)
    sitemap.js                        — sitemap.xml generator (19 URLs)

    # Combat sports (each split into server + client for SEO metadata)
    boxing/page.js + BoxingLanding.jsx
    kickboxing/page.js + KickboxingLanding.jsx
    mma/page.js + MMALanding.jsx
    bjj/page.js + BJJLanding.jsx
    wrestling/page.js + WrestlingLanding.jsx
    judo/page.js + JudoLanding.jsx

    # S&C specialties (each split)
    strength/page.js + StrengthLanding.jsx
    animal-flow/page.js + AnimalFlowLanding.jsx
    hiit/page.js + HIITLanding.jsx
    olympic-lifting/page.js + OlympicLiftingLanding.jsx

    # Audience-specific (each split)
    womens/page.js + WomensLanding.jsx
    corporate/page.js + CorporateLanding.jsx
    kids/page.js + KidsLanding.jsx
    trial/page.js + TrialLanding.jsx

    # Information (split)
    faq/page.js + FAQLanding.jsx

    # Legal (each split)
    privacy/page.js + PrivacyPolicyPage.jsx
    terms/page.js + TermsOfServicePage.jsx
    refunds/page.js + RefundPolicyPage.jsx
    shipping/page.js + ShippingPolicyPage.jsx

    schedule/page.js                  — Redirects to /#schedule

  components/
    Nav.js            — Sticky nav, active-section gold highlight, mobile menu with X icon
    Hero.js           — Hero with "Institute of Mastery" + CTA
    Welcome.js        — "Your morning treadmill is boring"
    Why.js            — Closer section ("India deserved better")
    Journey.js        — 5-step onboarding section
    Arena.js          — Combat sports overview (hover = gold border + gold arrow)
    Sanctuary.js      — S&C overview ("Build the Machine")
    Schedule.js       — Arena + Sanctuary timetables with coaches
    Sections.js       — Kids, Team, Memberships (responsive split),
                        Facility, Testimonials, Contact, LeadForm,
                        Footer, FloatingWA, ReadingProgress, ScrollToTop
    ui.js             — Reveal, Section wrapper, Eyebrow, Heading,
                        Body, PrimaryBtn, GhostBtn, PhotoBox, GoldBar

public/
  logo.svg                    — Wordmark logo (nav)
  seal.svg                    — Seal/monogram (footer, favicon)
  favicon.svg                 — Browser tab icon
  og-image.png                — Social sharing preview (1200x630)
  fonts/MateriaPro-Bold.otf   — Brand display font
```

### Server/Client split pattern (adopted Apr 20)

Every page.js is now a server component that exports SEO metadata. The interactive client UI lives in a sibling `<Name>Landing.jsx` (or `<Name>Page.jsx` for legal pages).

**Why:** Next.js App Router requires server components for per-page metadata. Pages with `'use client'` cannot export metadata directly. Splitting lets every page have unique SEO title/description/keywords while keeping all interactivity intact.

**Template pattern for a new page:**
```js
// src/app/new-page/page.js (server component)
import NewPageLanding from './NewPageLanding';

export const metadata = {
  title: 'Page title | Namma Combat',
  description: '...',
  keywords: '...',
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://nammacombat.com/new-page',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/new-page',
  },
};

export default function Page() {
  return <NewPageLanding />;
}
```

---

## Homepage Section Order

Hero → Welcome → Journey → Arena → Sanctuary → Kids → **Team → Facility → Schedule → Memberships** → Testimonials → Contact → Footer

Logic: Who → Where → When → How much → Proof → CTA

Nav: Your Journey, The Arena, The Sanctuary, Team, Facility, Schedule, Memberships, Contact

---

## Pages & URLs

| Page | URL Path | Pre-selected Interest |
|------|----------|-----------------------|
| Homepage | / | — |
| General Trial | /trial | — (user picks) |
| Boxing | /boxing | Boxing |
| Kickboxing | /kickboxing | Kickboxing |
| MMA | /mma | MMA - Mixed Martial Arts |
| BJJ | /bjj | BJJ - Brazilian Jiu-Jitsu |
| Wrestling | /wrestling | Wrestling |
| Judo | /judo | Judo |
| S&C | /strength | S&C - Strength & Conditioning |
| Animal Flow | /animal-flow | Animal Flow |
| HIIT | /hiit | S&C - Strength & Conditioning |
| Olympic Lifting | /olympic-lifting | S&C - Strength & Conditioning |
| Women's | /womens | — (user picks) |
| Corporate | /corporate | — (user picks) |
| Kids | /kids | Kids / Youth Program |
| FAQ | /faq | (information) |
| Privacy | /privacy | (legal) |
| Terms | /terms | (legal) |
| Refunds | /refunds | (legal) |
| Shipping | /shipping | (legal) |
| Schedule | /schedule | (redirects to /#schedule) |

**Dropdown options** (MUST match exactly or will fall back to first item):
- Boxing
- Kickboxing
- MMA - Mixed Martial Arts
- BJJ - Brazilian Jiu-Jitsu
- Wrestling
- Judo
- S&C - Strength & Conditioning
- Animal Flow
- Kids / Youth Program
- Not sure — help me decide

---

## Schedule Page

Two tables rendered on homepage + standalone `/schedule` redirects to section.

**The Arena (Combat):**
- 6 AM – 9 AM morning block
- Afternoon break
- 4 PM – 8 PM evening block
- Mon–Sat active; Sun is Workshop only; Sat afternoon no sessions
- Elite Combat/MMA 8 PM (Mon–Fri) marked "Advanced"

**The Sanctuary (S&C):**
- Same block structure
- Saturdays: Reset & Play
- Elite S&C 9 AM + 8 PM

**Coach assignments:**
- Boxing → Coach Bhagyarajan
- Kickboxing → Coach Kantharaj
- BJJ / Jiu-Jitsu → Coach Kantharaj
- Wrestling → Coach Venkatesh
- Judo → Coach Kantharaj
- MMA → Coach Kantharaj
- Elite Combat/MMA → Kantharaj, Bhagyarajan & Venkatesh
- All Sanctuary classes → Spoorthi or Manoj (either/or, not both)
- Evening Elite S&C (8 PM) → Naeem, Spoorthi or Manoj

**Notes on page:**
- Elite classes and Open Mat are 90 minutes
- Saturday Elite classes held outdoors
- Workshops not part of any membership
- Schedule may adjust for holidays — WhatsApp to confirm

---

## SEO Infrastructure (shipped Apr 20)

### Files
- `src/app/robots.js` → generates /robots.txt (Next.js App Router pattern)
- `src/app/sitemap.js` → generates /sitemap.xml (19 URLs with priority + changeFrequency)
- `src/app/layout.js` → contains LocalBusiness / SportsActivityLocation / ExerciseGym JSON-LD schema

### Per-page metadata (all 18 pages)
Every page exports its own metadata object with:
- Unique title: "[Sport] Classes in Koramangala, Bangalore | Namma Combat"
- Unique description tailored to the page
- Keywords targeting Bangalore + Koramangala local search
- OpenGraph tags (for WhatsApp / LinkedIn sharing previews)
- Canonical URL (prevents duplicate content penalties)

### Sitemap priorities
- Homepage: 1.0 (daily)
- Combat sports: 0.9 (weekly)
- S&C specialties: 0.85 (weekly)
- Audience pages: 0.8 (weekly)
- Legal pages: 0.3 (yearly)

### Google Search Console
- **Status:** Verified via domain method (DNS auto-verified through Google Workspace)
- **Sitemap submitted:** https://nammacombat.com/sitemap.xml
- **Discovered pages:** 19
- **Access:** search.google.com/search-console (logged in as vi@nammacombat.com)

---

## Gold Accent System (shipped Apr 20)

### Design language
- **Rust (#9A3520)** = Primary structure. Headings, body copy anchors, CTA buttons, CTA button hover.
- **Gold (#E3C768)** = Motion, activity, feedback. Appears only during interactions and state changes.

### Where gold appears
| Element | Behavior |
|---|---|
| Reading progress bar | 2px top bar, fills on scroll (all pages) |
| Scroll-to-top button | Gold circle, appears after 500px scroll |
| Form input focus | Gold border + soft shadow on focus |
| Active nav link | Gold underline (desktop) / gold left-border (mobile) |
| Page transition loader | Gold gradient bar (loading.js) |
| Arena/Sanctuary card hover | Gold border + gold arrow slides in |
| Curriculum bullets | Gold check marks on 12+ landing pages |
| Kids card hover | Gold border |

### Rule for future changes
If it's a CTA or a permanent anchor → rust.
If it's a transient feedback state → gold.

---

## Memberships (shipped Apr 20 — transparent pricing)

Previously prices were hidden. Now fully transparent to filter price-sensitive leads pre-call.

### Tiers (all inclusive of 5% GST)

| Tier | Monthly | Quarterly | Semi-Annual | Annual |
|---|---|---|---|---|
| Silver (one floor) | ₹5,775 | ₹15,750 | ₹29,400 | ₹47,250 |
| Student (both floors, valid ID) | ₹5,775 | ₹15,750 | ₹29,400 | ₹47,250 |
| Gold (both floors, most popular) | ₹7,875 | ₹21,525 | ₹39,900 | ₹63,000 |
| Platinum (+PT + guests) | ₹12,600 | ₹34,650 | ₹63,000 | ₹1,05,000 |

### Also available
- Single class pass: Regular ₹788 / Elite 90-min ₹1,050
- Personal training: ₹3,150 (1 person) / ₹4,200 (couple)
- Bulk packages available on request

### Value anchors shown on site
- Postural assessment worth ₹7,000 (included in every tier)
- Quarterly re-assessments (progress tracked, plan recalibrated)
- Goal-based programming
- Animal Flow unlimited (key differentiator — not a premium add-on)

### Responsive design (key architecture decision)
- **Desktop (≥768px):** Tabs [Monthly / Quarterly / Semi-Annual / Annual] + 4-card grid. Prices update per tab.
- **Mobile (<768px):** Editorial vertical stack. Each tier its own block with hairline divider, tier name + tagline + italic story + all 4 durations listed in warm-background box + features + tier-specific CTA ("Enquire about Gold" etc).
- Implementation: `className="nc-memberships-desktop"` / `className="nc-memberships-mobile"` + CSS media query.

### Student tier rules
- No age cap
- Valid school / college / university / institution ID required
- "Age-appropriate classes — kids train with kids, adults with adults" noted on card
- Same pricing across all durations as Silver

---

## Legal Pages (shipped Apr 20 — Razorpay + DPDP Act 2023)

Required for Razorpay KYC and Indian Digital Personal Data Protection Act 2023 compliance.

- `/privacy` — Privacy Policy (12 sections, DPDP Act compliant)
- `/terms` — Terms of Service (health declaration not medical clearance, ₹10,000 liability cap, Karnataka jurisdiction)
- `/refunds` — Refund & Cancellation Policy
  - Non-refundable memberships
  - Freeze matrix: 1mo → 7d / 3mo → 21d / 6mo → 28d / 12mo → 35d
  - Medical pause up to 90 days (extendable with certificate)
  - Credit/transfer in lieu of refund
- `/shipping` — Shipping & Delivery Policy (service-only business, no physical shipping — Razorpay KYC requirement)

### Contact for legal
- Email: privacy@nammacombat.com (Vinod needs to create this alias in Google Workspace)
- Title: "Grievance Officer, Namma Combat" (no personal name — Vinod's decision)
- All 4 pages accessible via footer links on homepage and all landing pages
- Last updated: 20 April 2026

---

## Zoho CRM Integration

- **Endpoint:** https://crm.zoho.in/crm/WebToLeadForm
- **Method:** Hidden iframe form submission (NOT fetch — CORS blocks)
- **Form ID:** webform1242297000001060922
- **Fields sent:** First Name, Last Name, Phone, Lead Source (auto: "Website"), LEADCF14 (Interested In)
- **returnURL:** https://nammacombat.com/trial
- **Form Location URL whitelist (in Zoho):** nammacombat.com, www.nammacombat.com, academy.nammacombat.com

### Current hidden keys (regenerate ALL files when form edited in Zoho)
- `xnQsjsdp`: `46046e1b1518a2e1c8335abc6c416cc060d54010509945e0354e8c12064719fe`
- `xmIwtLD`: `a9a1d770007ff6c74947f678d63c2e80373d35aa1e34f909ded5b4cb6df9af52dcdb4166291a626a499d63089a7299d9`
- **Last regenerated:** April 24, 2026

### To update keys across all files:
```bash
# Note: after Apr 20 split, client forms are in .jsx files, not .js
find src -type f -name "*.jsx" -exec sed -i '' "s|'xnQsjsdp': '[a-f0-9]*'|'xnQsjsdp': 'NEW_KEY_HERE'|g" {} \;
find src -type f -name "*.jsx" -exec sed -i '' "s|'xmIwtLD': '[a-f0-9]*'|'xmIwtLD': 'NEW_KEY_HERE'|g" {} \;
```

---

## Analytics & Tracking

- **Google Analytics GA4:** `G-WLF5WZ9HRS` (set in `src/app/layout.js`)
- **Google Search Console:** Verified, sitemap submitted, 19 pages discovered
- **Meta Pixel:** Pending (waiting on Facebook Business Manager access recovery)

---

## Coaches (current)

1. **Kantharaj Agasa** — Co-founder & Head Coach (MMA, Judo, BJJ, Kickboxing, Jiu-Jitsu). Indian MMA Pioneer, 13 professional wins, NIS Patiala certified.
2. **Mohammed Naeem** — Co-founder & Head of S&C. MSc Performance Coaching, Setanta College (institution behind Premier League + NBA practitioners).
3. **Bhagyarajan** — Boxing Lead. NIS Patiala, national medalist, ex-army. (Sometimes referred to as Rajan for pronunciation on site copy.)
4. **Venkatesh A** — Wrestling Coach. NIS Patiala, Master's in Sports Management.
5. **Spoorthi Nagraj** — S&C & Women's Health. Animal Flow L1 certified.
6. **Manoj Kumar** — S&C Coach. Skill India certified in Strength & Conditioning. Former state-level hockey athlete. Specialises in coaching beginners through fundamentals.

**Not on the team:**
- Coach Lal left the academy — do not reference.

**Pending:** Role-based coach card redesign (Pattern B) — waiting for full bios + quotes from trainer interviews before implementing.

---

## Testimonials

### Homepage (6)
Lochen Raj, Hindesh Akash, Raktim Singha, Sai Anjana G, Karthik Eashwar, Shubham

### Landing pages (tailored per discipline)
- Boxing → Shubham
- Kickboxing → Nitish R
- MMA → Raktim Singha
- BJJ → (generic — need specific)
- Wrestling → Dhruv P
- Judo → Gopinath Kannan
- S&C → Hindesh Akash
- Animal Flow → Hindesh Akash
- HIIT → (need specific)
- Olympic Lifting → (need specific)
- Women's → Amrutha Gowda
- Corporate → Yashwanth Kumar S
- Kids → Karthik Eashwar
- Trial → Raktim Singha

---

## Business Details

- **Address:** 10, 80 Feet Road, 4th Block, Koramangala, Bangalore 560034
- **Phone / WhatsApp:** 77700 87700 (wa.me/917770087700)
- **Hours:** Mon–Sat 6 AM – 9 PM
- **Facility:** 4,200 sq ft, 2 floors (The Arena + The Sanctuary)
- **Equipment:** Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom SS racks
- **Memberships:** Silver / Student / Gold (popular) / Platinum — transparent pricing live on site (Apr 20, 2026)

---

## Brand & Copy Rules (CRITICAL)

- NEVER use "gym" in visible copy — use academy / fitness centre / studio / institute / sanctuary / open floor
- Exception: "Technogym" (brand name) is fine
- Exception: Hidden SEO keyword "gym koramangala" in metadata (invisible to visitors)
- "India's premier" in primary positioning (not "Bangalore's")
- Landing page eyebrows keep "in Bangalore" for local SEO
- Success message: "We'll call you soon" — NO postural assessment mention in the form confirmation
- **Prices are now visible** (reversed Apr 20 — was "no prices anywhere" before)
- Founder (Vinod) never featured on site or in copy
- Journey + Welcome cover all skill levels (beginner → intermediate → competitive)
- "Build the Machine" (not "Build the Engine") on Sanctuary
- **Krav Maga Global partnership:** DO NOT mention on site until signed agreement in hand. Future announcement = big launch moment.

---

## Mobile Optimizations

- Viewport meta tag via Next.js viewport export
- Tighter section padding: 36px mobile, 56px desktop
- Mobile hero: 24px top, 16px horizontal
- Mobile nav: "Book trial" button + hamburger visible (not buried)
- Clean ✕ icon when mobile menu is open (not rotated hamburger)
- Phone inputs: `type="tel"` + `inputMode="tel"` + `autoComplete="tel"` → numeric keypad
- Name inputs: `autoComplete="name"` → name autofill
- Schedule swipe hint on mobile only
- Smooth scroll offset: JS-based `-64px` to land heading directly below nav
- **Memberships responsive split (Apr 20):** desktop = tabs + grid, mobile = editorial vertical stack

---

## Completed (April 20, 2026 session)

### Legal & Compliance
- [x] Privacy Policy (DPDP Act 2023 compliant, 12 sections)
- [x] Terms of Service (₹10,000 liability cap, Karnataka jurisdiction)
- [x] Refund & Cancellation Policy with freeze matrix
- [x] Shipping & Delivery Policy (service-only, Razorpay KYC)
- [x] Footer links on homepage + all landing pages

### Gold Accent System
- [x] Reading progress bar (2px gold, all pages)
- [x] Scroll-to-top button (gold circle, appears after 500px scroll)
- [x] Form input focus glow (gold border + soft shadow)
- [x] Active nav highlighting (gold underline desktop, gold left-border mobile)
- [x] Curriculum bullets → gold on 12+ pages
- [x] Discipline card arrows → gold
- [x] All card hover borders flipped rust → gold (Arena, Sanctuary, Kids, globals.css)
- [x] Page transition loader → gold gradient bar

### SEO Infrastructure
- [x] robots.js + sitemap.js (App Router pattern)
- [x] LocalBusiness JSON-LD schema on homepage
- [x] Split Boxing as pilot (server metadata + client UI)
- [x] Split 17 other pages into server+client via batch script
- [x] All 18 pages have unique SEO title/description/keywords/OG/canonical
- [x] Google Search Console verified (domain method)
- [x] Sitemap submitted (19 pages discovered)

### Memberships (major business decision)
- [x] Transparent pricing live on website (previously hidden)
- [x] 4 tiers: Silver / Student / Gold / Platinum
- [x] All 4 durations per tier: Monthly / Quarterly / Semi-annual / Annual
- [x] ₹7,000 postural assessment value callout
- [x] Animal Flow positioned as differentiator
- [x] Student tier with ID requirement + age-appropriate classes note
- [x] Desktop: tabs + 4-card grid (active gold underline)
- [x] Mobile: editorial vertical stack with tier-specific CTAs
- [x] Single class + PT pricing in "Also available" box

### Fixes
- [x] Women's page rewritten from Boxing v2 template (was broken)
- [x] BJJ added to CRM dropdown + BJJ landing page verified
- [x] Judo page rewritten from Boxing v2 template
- [x] Rust-on-hover borders flipped to gold for consistency

### FAQ page (late Apr 20)
- [x] /faq standalone page with 25 Q&A across 6 categories
- [x] Accordion UI with gold accent (open icon rotates + turns gold)
- [x] Categories: Getting started, Pricing, Classes, Facility, Kids/Women/Corporate, Practical
- [x] Footer CTA: WhatsApp us OR Book a free trial
- [x] Added to sitemap at priority 0.7
- [x] Linked from nav (desktop + mobile) between Contact and Book free trial CTA

### Coach credential fix
- [x] Kantharaj win count: 12 → 13 professional wins (fixed across 5 source files + README)

### Commits shipped today: 40+

---

## Completed (April 24, 2026 session)

### Trial form cleanup (Zoho data integrity)
- [x] Removed `+91...` placeholder from all 15 phone inputs
- [x] Set placeholder to `XXXXXXXXXX` across all 15 trial forms (universally recognized pattern, no `+91` ambiguity, shows 10-digit format)
- [x] Swept across: 14 Landing.jsx files (Boxing, Kickboxing, MMA, BJJ, Wrestling, Judo, Strength, Animal Flow, HIIT, Olympic Lifting, Womens, Corporate, Kids, Trial) + Sections.js homepage LeadForm

### Zoho webform re-link (critical fix — lead pipeline restored)
- [x] Diagnosed: leads had stopped reaching Zoho CRM after placeholder deploy. Email backup was still working, masking the issue.
- [x] Root cause: Zoho keys had silently regenerated (reason unclear — possibly related to form state, not our deploy)
- [x] Fix: re-saved form in Zoho to regenerate fresh `xnQsjsdp` + `xmIwtLD` keys
- [x] Updated both keys across all 15 files via sed sweep
- [x] Confirmed lead pipeline restored — test lead arrived in both Gmail AND Zoho CRM

### Commits shipped today:
- `05be8aa` — Remove +91 placeholder from trial forms — Zoho CRM data cleanup
- `bb82148` — Update Zoho webform keys after re-link — restores lead pipeline

### Known issue to investigate later (not critical)
- [ ] Zoho Webforms analytics shows 0 submissions / 0 leads under "Website Lead Form" even though leads ARE landing in the Leads module. Likely a tracking script / scope issue, not functional. Leads are flowing correctly. Do NOT touch the working form to fix — diagnose separately.

---

## Completed (April 27, 2026 session)

### Landing page navigation fix
- [x] **Header logo → homepage.** Wrapped `<img src="/logo.svg">` in `<a href="/" style={{ display: 'inline-flex' }}>...</a>` on the 14 sport/audience landing pages that previously had no link (boxing, kickboxing, mma, bjj, wrestling, judo, strength, animal-flow, hiit, olympic-lifting, womens, corporate, kids, trial). The 5 other pages (faq, privacy, terms, refunds, shipping) already had this. Visitors no longer need the browser back button to return home.

### NC seal in landing footers
- [x] Added `<img src="/seal.svg" alt="Namma Combat" style={{ width: 56, height: 56, margin: '0 auto 12px', display: 'block' }} />` above the "Skill · Strength · Sanctuary" tagline in the footer of all 19 landing/legal/faq pages.
- [x] Matches the homepage footer seal style (homepage uses 64×64 in `Sections.js`; landing footers use 56×56 to fit the tighter compact footer).
- [x] FAQ has a unique footer structure — seal inserted as first child of the `<footer>` element rather than via the tagline anchor.

### Convention going forward (for new landing pages)
- Header: wrap logo in `<a href="/" style={{ display: 'inline-flex' }}>` so clicking returns to homepage.
- Footer: include `<img src="/seal.svg" ... 56×56 ... />` above the tagline.
- Both already present in every existing landing page — copy from any of them when adding a new one.

### Commits shipped today:
- `30d7e28` — Landing pages: clickable logo + NC seal in footer
- `9807600` — README: document Apr 24 session — placeholder cleanup + Zoho key re-link

---

## Completed (May 2, 2026 session)

### Phone autofill fix (continuation of Apr 24 placeholder work)
- [x] Diagnosed: browsers were autofilling `+91` prefix into the phone field even after the placeholder cleanup, because `autoComplete="tel"` asks browsers for the **international** format
- [x] Fix: `autoComplete="tel"` → `autoComplete="tel-national"` across all 15 forms (14 Landing.jsx + `Sections.js` LeadForm). `tel-national` signals "national-only digits" so autofill returns just the 10 local digits
- [x] No Zoho reconfig needed — data shape unchanged (10 digits, no prefix)

### Coach profile pages — first 3 live
- [x] New dynamic route `src/app/coaches/[slug]/` (server `page.js` + client `CoachClientPage.jsx`)
- [x] Live: `/coaches/kantharaj`, `/coaches/bhagyarajan`, `/coaches/venkatesh`
- [x] Each page: hero (role + name + textured PhotoBox placeholder + achievement subhead), bio paragraphs, **Coaching credentials**, **Competition record** (year-prefixed list with optional footer summary), **Professional experience**, **Train with [name]** chips linking to sport landing pages, embedded trial form on the right
- [x] Trial form sets `Lead Source = "Coach Page - {Name}"` for Zoho attribution. No new Zoho field needed — easy to migrate to a dedicated `Coach_Source` custom field later
- [x] Bhagyarajan record sourced from his sponsorship resume PDF (NIS Kolkata Diploma, 21-year Indian Army Subedar, 19 Gold + 9 Silver + 4 Bronze, 5 Best Boxer Awards, post-army coaching at TN Police / Northern Command / pro academies)
- [x] Venkatesh record sourced from 38 pages of certificates (NIS Patiala Wrestling, 62nd Senior National Championship, twice All-India Inter-University, Indo-Bhutan international silver, MBA Sports Management)
- [x] Kantharaj record sourced from his Brave CF sponsorship deck (Indian MMA Pioneer, most international pro fights by any Indian fighter, BJJ South-East Asia Gold, Judo National Gold, NIS Patiala Judo, 7 years coaching at SAI)
- [x] Per Vinod: NIS batch years and exact scores **not** shown — "First Division" alone is enough in industry context, where most candidates just want the certificate

### Team section on homepage — clickable swatches
- [x] `CoachCard` component (in `Sections.js`) wraps card in `<a href="/coaches/{slug}">` if `slug` is set; adds "View profile →" arrow + hover lift
- [x] Clickable: Kantharaj, Bhagyarajan, Venkatesh. Non-clickable (until profile content lands): Naeem, Spoorthi, Manoj
- [x] Fixed an inherited error: Bhagyarajan was incorrectly shown as "NIS Patiala" — corrected to NIS Kolkata across both swatch and profile page
- [x] Kantha + Venkatesh card copy refreshed (no batch year, "First Division" only)
- [x] `firstName` field added to coach data so "D. Bhagyarajan" renders as "Bhagyarajan" in the PhotoBox label and "Train with [name]" form headline (was rendering as "D.")

### SEO
- [x] 3 coach routes added to `sitemap.js` at priority 0.85 / monthly
- [x] Each coach page exports its own `metadata` (title, description, keywords, OG, canonical)

### Brand-rule check
- [x] Scanned all new content: no "gym" in visible copy (only "Technogym" — the allowed exception), no "Bangalore's" positioning, no "premier" misuse, no "engine", no Krav Maga mention, no Vinod/founder feature, no postural-assessment in form confirmation. Clean.
- [x] Removed a "co-built the gym from the ground up" line from Kantha's bio — factually inaccurate per Vinod (Vinod's money + time built the place; Kantha's value-add is being the public face) and would have violated the no-gym rule anyway

### Zoho API access (parallel work — not site-related, but unlocks future site/CRM integration)
- [x] Self Client OAuth set up on `api-console.zoho.in` (India DC). Refresh token + client creds stored at `~/.zoho/credentials` (chmod 600). Refresh token doesn't expire
- [x] Current scope: `ZohoCRM.modules.ALL ZohoCRM.settings.READ` — full read/write on records, read-only on settings
- [x] Verified working: pulled 3 most recent Leads via `/crm/v6/Leads`. All entries clean — no `+91` prefixes in the most recent leads (consistent with Vinod's "1 in 15 leads" estimate of the autofill issue)
- [x] CRM module map captured: `Leads`, `Contacts` (renamed display: "Members"), `Deals` (renamed display: "Memberships"), `Trials` (custom), `Membership` (custom). Assessments module yet to be created
- [x] Books scopes errored during initial Self Client setup → deferred. Add later when needed for invoice/payment work

### Commits shipped today
- `843af95` — Phone autofill: switch tel → tel-national across 14 landing pages
- `d6bd95a` — Coach profile pages + Team section refresh

### Gotchas surfaced this session (worth knowing for future work)
- **Zoho API Console + Safari:** the "Select Portal" step (where you pick which Zoho service the OAuth grant applies to) is **hidden in Safari**, visible in Chrome. If a Self Client grant fails with "Invalid scope" in Safari, switch to Chrome — the same scope works.
- **Zoho region matters:** `api-console.zoho.in` for India DC accounts (NOT `.com`). Wrong region = `INVALID_TOKEN` errors that look mysterious.
- **Self Client "Error occurred" toast:** sometimes appears alongside a successful code generation. The "Code copied successfully" line below it is the real signal.
- **Books scopes:** stricter than CRM — if any single Books scope is invalid for your plan, the entire grant fails silently. Try CRM-only first, then add Books scopes one at a time.

---

## Completed (May 3, 2026 late-night session)

### Decision: build NCC's own admin platform (replace Zoho dependency)
- See **▶ TOMORROW MORNING — RESUME HERE** at top of this README for full context, asks, and roadmap
- Zoho stays running untouched in parallel — no rip-and-replace risk
- All Zoho extension/automation queue items (field typo, calculate_membership v0/v1 puzzle, Media_Consent wiring on form, Health/Consent dashboard) **PARKED** until further notice
- Cost saved: ~₹3-8k/month + escape from 18-function / 27-field / v6-vs-v8 sprawl

### Investigation done tonight (won't need to redo)
- Confirmed Zoho Form's CRM card has no "Connected" badge — Health Declaration form uses Webhooks (→ Deluge `update_trial_from_form`), NOT native CRM integration
- Confirmed `Media_Consent` field already exists on Trials module (`picklist`, label "OK to use photos/videos for marketing?") — was the missing wiring, not the missing field
- Confirmed Zoho Deluge function source is **not API-readable** at any scope — UI-only (this was the final straw)
- Confirmed function CREATE via API is blocked on `metadata` param — workaround was Python scripts for backfills, but it's friction we won't have on the new platform

### What we DON'T need to build from scratch (already there in the marketing site repo)
- Next.js 14 App Router project — `namma-combat-site` ready to extend
- Brand styling (rust / gold / cream + Materia Pro Bold)
- 18 lead forms with Zoho integration — migrate to dual-write `/api/leads` later
- SEO infrastructure, sitemap, GA4
- Vercel deploy pipeline + custom domain DNS

---

## Pending Items

### Immediate
- [ ] **Day 1 of platform build** — pick subdomain + database (see ▶ TOMORROW MORNING section at top)
- [ ] Set up privacy@nammacombat.com alias in Google Workspace (admin → Users → Add alternate email)
- [ ] Collect remaining trainer bios from Naeem, Spoorthi, Manoj (Kantha / Bhagyarajan / Venkatesh shipped May 2)
- [x] ~~Rework coach cards with role-based framing once bios are in~~ — shipped May 2 via clickable swatches + dedicated profile pages

### This week
- [ ] Photoshoot (Leica SL3) — see spec below
- [ ] Replace all PhotoBox placeholders after photoshoot
- [ ] Google reviews campaign — ask first 20 members (offer free PT for review)
- [ ] Instagram training footage content

### Medium-term
- [x] ~~Create /coach/[name] individual pages~~ — shipped May 2 at `/coaches/[slug]` for 3 coaches; photos still placeholder; remaining 3 coaches pending bio data
- [ ] Krav Maga Global workshops — announce ONLY after signed agreement
- [ ] MMA v2 depth (cage cutting, sprawl-and-brawl, fence wrestling)
- [ ] Judo v2 depth (IJF rules, gokyo no waza, tokui-waza)
- [ ] Numbers / social proof section on homepage (wait for real data)
- [ ] Meta Pixel (when Facebook Business Manager restored)

### 90-day review point
Review trial → member conversion rate after transparent pricing live.
- <20% conversion = real pricing problem
- 20–40% = consider entry tier
- >40% = pricing is right

### Low priority
- [ ] Gateway page at nammacombat.com (when community app launches)
- [ ] mail.nammacombat.com redirect to Gmail
- [ ] BJJ / HIIT / Olympic Lifting page-specific testimonials

---

## Photo Specifications (for shoot day)

**Camera:** Leica SL3 (60MP full-frame, native 6000×4000 4:3)
**Shoot in DNG (RAW)** — gives maximum flexibility in post for cropping + color grading.

### Shooting principles (Leica SL3-specific)
- Use electronic shutter for silent capture
- ISO 100-800 ideal; SL3 handles up to ISO 6400 cleanly if indoor lighting is mixed
- Shoot slightly overexposed (+0.3 to +0.7 EV) for the warm cream / beige aesthetic
- Use APO-Summicron 35mm f/2 or 50mm f/2 SL for environmental shots
- 90mm f/2 SL or 75mm for coach portraits
- Avoid overly wide lenses (21mm, 24mm) — distortion feels generic

### Aspect ratios needed (shoot wider, crop in post)

| Shot | Final aspect | Final size | Shoot at minimum |
|---|---|---|---|
| Hero right side | ~6:5 (slight vertical) | 600×500px | 3000×2500px |
| Journey steps (×5) | 2.67:1 (wide horizontal) | 320×120px | 1600×600px |
| Coach portraits (×6) | 1:1 (square) | 230×210px | 1500×1500px |
| Arena discipline cards (×6) | 4:3 | 320×240px | 1600×1200px |
| Sanctuary discipline cards (×4) | 4:3 | 320×240px | 1600×1200px |
| Facility wide shot | 16:7 panoramic | 1160×500px | 3500×1500px |
| Kids group | 3:4 vertical | 230×300px | 1200×1600px |

### Export settings for web
- Format: JPEG, quality 85
- Color profile: sRGB (not Adobe RGB)
- Max longest edge: 1920px
- Target file size: 200-400KB per image

### Total minimum shoot list: 19 photos

### Shot priority (if time-constrained)
1. 6 coach portraits (highest — identity of the academy)
2. Hero image (first impression)
3. Facility wide shot (quality of space)
4. 6 Arena discipline cards
5. 4 Sanctuary discipline cards
6. 5 Journey horizontal shots
7. Kids group shot (parental consent permitting)

---

## Account Ownership (all under Vinod's control)

- GitHub: vikramravella
- Vercel: vi@nammacombat.com
- Namecheap: vinodkaruturi
- Google Workspace admin: Vinod
- Google Analytics: Vinod
- Google Search Console: Vinod (vi@nammacombat.com)
- Zoho CRM: Vinod

---

## Security Posture

### Account 2FA — confirmed Apr 28, 2026
All major accounts (GitHub, Vercel, Namecheap, Google Workspace, Zoho CRM) have 2FA enabled. Worth occasionally verifying that critical accounts (Namecheap, Vercel, GitHub) use authenticator app or hardware key, NOT SMS — SIM-swap attacks bypass SMS-based 2FA.

### Email authentication — DMARC tightening in progress

Current DNS state on nammacombat.com (as of Apr 28, 2026):

| Record | Status | Value |
|---|---|---|
| MX | OK | Google Workspace (`smtp.google.com`) |
| SPF | OK | `v=spf1 include:_spf.google.com ~all` |
| DKIM | OK | Active (Google selector) |
| DMARC | partial | `v=DMARC1; p=none; rua=mailto:combatnamma@gmail.com` — monitoring only, reports to personal Gmail |

**Confirmed:** Google Workspace is the ONLY sender for `@nammacombat.com`. No Mailchimp, no Zoho campaigns, no Calendly, no other third-party senders. This means we can tighten DMARC aggressively without risk of breaking forgotten legit mail.

**Resume here next session — two decisions pending:**
1. Which `@nammacombat.com` address should receive DMARC reports? Options:
   - (a) reuse an existing inbox Vinod checks daily
   - (b) create `dmarc@nammacombat.com` Google Workspace alias (could create alongside still-pending `privacy@nammacombat.com`)
2. Rollout pace:
   - **Conservative (~6 weeks):** swap `rua` to `@nammacombat.com` address, keep `p=none` for 2 weeks, ramp to `p=quarantine; pct=10`, then `pct=100`, then `p=reject`. Watch reports each step.
   - **Faster:** jump directly to `p=quarantine` today since single-sender setup is confirmed.

Once a path is picked, the change is a single TXT record edit in Vercel DNS panel at host `_dmarc`.

### Security roadmap (tiered by blast radius)
1. **Done** — Account takeover prevention via 2FA on all critical accounts.
2. **In progress** — Email spoofing prevention via DMARC tightening.
3. **Pending** — Brand impersonation: trademark Namma Combat wordmark + seal in India (~₹4,500 govt fee + lawyer time). Legal protection against fake academies / impersonation pages.
4. **Pending** — DPDP Act compliance: create `privacy@nammacombat.com` alias (already noted in main Pending), document Zoho lead retention policy, plan for breach response.
5. **Pending** — Form spam: honeypot hidden field on all 15 trial forms; optional invisible hCaptcha if spam volume becomes real.
6. **Pending** — HTTP security headers via `next.config.js` or Vercel: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, Referrer-Policy. Defends against clickjacking + injection classes.
7. **Pending (low priority)** — Asset hardening: largely unsolvable since browser must download fonts/SVGs to render. Real levers are font licensing audit (verify Materia Pro Bold web-embed license) + photo watermarking post-shoot. Hotlink protection blocks other domains from embedding `/public` assets — small win.

---

## Separate Workstreams (not in this repo)

- **Community app Phase 1** — Separate chat. React Native, phone OTP login, member feed, booking in ~2 months. PRD: `NAMMA_COMBAT_APP_PRD_v1.2.pdf`.
- **Brand ecosystem:** Academy (current) + Community (app, building) + Namma Fight league (future)

---

## Notes for Future Chats

- If context is lost, start a new chat and paste this README
- Website is fully functional at nammacombat.com with Zoho + GA4 + Search Console live
- Vinod is non-technical but fluent in Terminal / Git after this project
- Prefers `python3` in-place edits via heredoc over downloading whole files

### Gotchas (learned the hard way)
- **Python regex `re.sub` breaks on `\u` escapes in template strings** — always use `.replace()` (string substitution), not `re.sub`, when the new content contains `\u20b9` (₹), `\u2014` (—), etc.
- **zsh: command not found: #** — inline `#` comments fail in terminal paste, ignore or skip
- **zsh: unknown file attribute: h** — from certain command flags, ignore
- **zsh: ! in history expansion** — escape with `\` or wrap in single quotes
- **Form pre-select values MUST exactly match dropdown options** or they fall back to first option
- **Zoho regenerates hidden keys on every form edit** — must propagate across all client Landing files (now .jsx, not .js)
- **`&` in sed replacements breaks regex** — use python3 `.replace()` instead
- **Always `npm run build 2>&1 | tail -5` before pushing** — catches errors without printing thousands of lines
- **For high-stakes changes (pricing, legal, irreversible UX), SHOW the code BEFORE running** — Vinod has strong design taste and catches issues pre-ship
- **Zoho keys silently regenerate when the form is edited in Zoho** — or occasionally for reasons unclear. Symptom: form submits successfully, email notification arrives, but no lead appears in Zoho CRM. The hidden `xnQsjsdp` and `xmIwtLD` keys become invalid, so Zoho silently rejects the POST. Fix: edit form in Zoho (any minor change + save), grab fresh embed code, sweep both keys across all 15 files, deploy. Always check Zoho Leads module directly for verification — the Webforms analytics view is unreliable.
- **Form field placeholders live in data objects, not JSX attributes** — trial forms use `{[{k,l,t,p}, ...]}` arrays with `placeholder={p}`. To find/replace placeholder text, search the single-quoted string inside the data object (`p: 'value'`), not `placeholder="value"`. Otherwise grep/sed will miss everything.
- **Email notification vs Zoho lead is NOT the same thing.** If "Notify Leads Owner" is enabled in Zoho, you'll get an email for every submission even when the actual lead insertion fails. Never use "got an email" as proof that the lead landed in Zoho. Always verify via the Leads module.
- **Test the full pipeline, not just the form submission.** After any change touching Zoho integration or trial forms: submit a test lead in incognito, confirm email arrived, AND confirm it appears in Zoho Leads module (filter by Created Date today). Don't rely on one signal.

### Working pattern
- ONE change at a time. Surgical, verified, committed.
- Don't batch across multiple files if uncertain — scripts fail silently.
- Use Boxing v2 as known-good template for new landing page rewrites.
- When Vinod pushes back ("dumb!", "not accepted", "generic"), trust the pushback. He's been right every time.
