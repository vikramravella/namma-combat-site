# Namma Combat Website — Project Documentation

**Last updated: April 20, 2026**

Founded by Vinod Karuturi. Built solo after firing the previous dev team. All accounts under Vinod's control.

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
- `xnQsjsdp`: `7f86d216d021c558ef213f9f58487a514e5c706d4eaccbc094e22e3fc4da61d2`
- `xmIwtLD`: `cca4493149c188cf2f9842a325ca8ef7dfc26845273560ab6e7d2278d5c513b5e7eb5e760e03184a103077105dc14280`

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

### Commits shipped today: 30+

---

## Pending Items

### Immediate
- [ ] Set up privacy@nammacombat.com alias in Google Workspace (admin → Users → Add alternate email)
- [ ] Collect detailed trainer bios / quotes from Kantharaj, Naeem, Bhagyarajan
- [ ] Rework coach cards with role-based framing (Pattern B) once bios are in

### This week
- [ ] Photoshoot (Leica SL3) — see spec below
- [ ] Replace all PhotoBox placeholders after photoshoot
- [ ] Google reviews campaign — ask first 20 members (offer free PT for review)
- [ ] Instagram training footage content

### Medium-term
- [ ] Create /coach/[name] individual pages (needs data + photos first)
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

### Working pattern
- ONE change at a time. Surgical, verified, committed.
- Don't batch across multiple files if uncertain — scripts fail silently.
- Use Boxing v2 as known-good template for new landing page rewrites.
- When Vinod pushes back ("dumb!", "not accepted", "generic"), trust the pushback. He's been right every time.
