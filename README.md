# Namma Combat Website — Project Documentation

**Last updated: April 18, 2026**

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

- **Framework:** Next.js (App Router), React
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
    page.js                 — Homepage (assembles all sections)
    layout.js               — SEO meta, viewport, GA4, fonts
    globals.css             — CSS variables + mobile CSS
    trial/page.js           — General trial landing page
    boxing/page.js          — Boxing landing page
    kickboxing/page.js      — Kickboxing landing page
    mma/page.js             — MMA landing page
    wrestling/page.js       — Wrestling landing page
    judo/page.js            — Judo landing page
    strength/page.js        — S&C landing page
    animal-flow/page.js     — Animal Flow landing page
    womens/page.js          — Women's landing page
    corporate/page.js       — Corporate wellness landing page
    kids/page.js            — Kids & youth landing page
    schedule/page.js        — Redirects to /#schedule
  components/
    Nav.js                  — Sticky nav (desktop) + mobile menu with X icon
    Hero.js                 — Hero with "Institute of Mastery" + CTA
    Welcome.js              — "Your morning treadmill is boring"
    Journey.js              — 5-step onboarding section
    Arena.js                — Combat sports overview
    Sanctuary.js            — S&C overview ("Build the Machine")
    Schedule.js             — Arena + Sanctuary timetables with coaches
    Sections.js             — Kids, Team, Memberships, Facility,
                              Testimonials, Contact, LeadForm, Footer, FloatingWA
    ui.js                   — Reveal, Section wrapper, Eyebrow, Heading,
                              Body, PrimaryBtn, GhostBtn, PhotoBox, GoldBar
public/
  logo.svg                  — Wordmark logo (nav)
  seal.svg                  — Seal/monogram (footer, favicon)
  favicon.svg               — Browser tab icon
  og-image.png              — Social sharing preview (1200x630)
  fonts/MateriaPro-Bold.otf — Brand display font
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
| Wrestling | /wrestling | Wrestling |
| Judo | /judo | Judo |
| S&C | /strength | S&C - Strength & Conditioning |
| Animal Flow | /animal-flow | Animal Flow |
| Women's | /womens | — (user picks) |
| Corporate | /corporate | — (user picks) |
| Kids | /kids | Kids / Youth Program |
| Schedule | /schedule | (redirects to /#schedule) |

**Dropdown options** (MUST match exactly or will fall back to first item):
- Boxing
- Kickboxing
- MMA - Mixed Martial Arts
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
- Boxing → Coach Rajan
- Kickboxing → Coach Kantharaj
- Jiu-Jitsu → Coach Kantharaj
- Wrestling → Coach Venkatesh
- Judo → Coach Kantharaj
- MMA → Coach Kantharaj
- Elite Combat/MMA → Kantharaj, Rajan & Venkatesh
- All Sanctuary classes → Spoorthi or Manoj (either/or, not both)
- Evening Elite S&C (8 PM) → Naeem, Spoorthi or Manoj

**Notes on page:**
- Elite classes and Open Mat are 90 minutes
- Saturday Elite classes held outdoors
- Workshops not part of any membership
- Schedule may adjust for holidays — WhatsApp to confirm

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

### To update keys across all 11+ files:
```bash
find src -type f -name "*.js" -exec sed -i '' "s|'xnQsjsdp': '[a-f0-9]*'|'xnQsjsdp': 'NEW_KEY_HERE'|g" {} \;
find src -type f -name "*.js" -exec sed -i '' "s|'xmIwtLD': '[a-f0-9]*'|'xmIwtLD': 'NEW_KEY_HERE'|g" {} \;
```

---

## Analytics & Tracking

- **Google Analytics GA4:** `G-WLF5WZ9HRS` (set in `src/app/layout.js`)
- **Meta Pixel:** Pending (waiting on Facebook Business Manager access recovery)

---

## Coaches (current)

1. **Kantharaj Agasa** — Co-founder & Head Coach (MMA, Judo, BJJ, Kickboxing, Jiu-Jitsu). Indian MMA Pioneer, 12 professional wins, NIS Patiala certified.
2. **Mohammed Naeem** — Co-founder & Head of S&C. MSc Performance Coaching, Setanta College (institution behind Premier League + NBA practitioners).
3. **Rajan** — Boxing Lead. NIS Patiala, national medalist, ex-army.
4. **Venkatesh A** — Wrestling Coach. NIS Patiala, Master's in Sports Management.
5. **Spoorthi Nagraj** — S&C & Women's Health. Animal Flow L1 certified.
6. **Manoj Kumar** — S&C Coach. Skill India certified in Strength & Conditioning. Former state-level hockey athlete (Karnataka League winner, School Games winner, South Zone University finalist). Specialises in coaching beginners through fundamentals — patient, detail-oriented, teacher-focused.

**Not on the team:**
- Coach Lal left the academy — do not reference.
- BJJ is still offered, taught by Kantharaj.

---

## Testimonials

### Homepage (6)
Lochen Raj, Hindesh Akash, Raktim Singha, Sai Anjana G, Karthik Eashwar, Shubham

### Landing pages (tailored per discipline)
- Boxing → Shubham
- Kickboxing → Nitish R
- MMA → Raktim Singha
- Wrestling → Dhruv P
- Judo → Gopinath Kannan
- S&C → Hindesh Akash
- Animal Flow → Hindesh Akash
- Women's → Amrutha Gowda
- Corporate → Yashwanth Kumar S
- Kids → Karthik Eashwar
- Trial → Raktim Singha

---

## Business Details

- **Address:** 10, 80 Feet Road, 4th Block, Koramangala, Bangalore
- **Phone / WhatsApp:** 77700 87700 (wa.me/917770087700)
- **Hours:** Mon–Sat: 6 AM – 9 PM
- **Facility:** 4,200 sq ft, 2 floors (The Arena + The Sanctuary)
- **Equipment:** Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom SS racks
- **Memberships:** Silver (one floor) / Gold (both floors, recommended) / Platinum (Gold + 2 PT + 2 guest passes)
- **NO prices on website** — forces enquiry, drives form submissions

---

## Brand & Copy Rules (CRITICAL)

- NEVER use "gym" in visible copy — use academy / fitness centre / studio / institute / sanctuary / open floor
- Exception: "Technogym" (brand name) is fine
- Exception: Hidden SEO keyword "gym koramangala" in `layout.js` meta keywords (invisible to visitors)
- "India's premier" in primary positioning (not "Bangalore's")
- Landing page eyebrows keep "in Bangalore" for local SEO
- Success message: "We'll call you soon" — NO postural assessment mention (that's post-membership only)
- No prices anywhere
- Founder (Vinod) never featured on site
- Journey + Welcome cover all skill levels (beginner → intermediate → competitive)
- "Build the Machine" (not "Build the Engine") on Sanctuary

---

## Mobile Optimizations (shipped Apr 18)

- Viewport meta tag via Next.js viewport export
- Tighter section padding: 36px mobile, 56px desktop
- Mobile hero: 24px top, 16px horizontal
- Mobile nav: "Book trial" button + hamburger visible (not buried)
- Clean ✕ icon when mobile menu is open (not rotated hamburger)
- Phone inputs: `type="tel"` + `inputMode="tel"` + `autoComplete="tel"` → numeric keypad
- Name inputs: `autoComplete="name"` → name autofill
- Schedule swipe hint: "← Swipe to see all days →" shown on mobile only
- Smooth scroll offset: JS-based `-64px` to land heading directly below nav
- Contact + Footer tightened to fit together in one viewport on desktop

---

## Completed (April 18, 2026 session)

- [x] Domain nammacombat.com recovered from old Vercel account
- [x] nammacombat.com + www + academy subdomains all live
- [x] Open Graph image created, deployed (WhatsApp preview confirmed)
- [x] Twitter card metadata added
- [x] Animal Flow landing page created (11th landing page)
- [x] MMA + Strength pre-select fixed (were falling back to Boxing)
- [x] All "gym" references removed from visible site
- [x] Zoho keys regenerated + returnURL switched to nammacombat.com
- [x] Journey + Welcome cover all skill levels
- [x] "India's premier" positioning across SEO + hero + trial
- [x] Naeem credentials updated: MSc Setanta College
- [x] Schedule component built with both tables, embedded on homepage + /schedule redirect
- [x] Coach assignments correct: "Spoorthi or Manoj" (not &), evening Elite S&C includes Naeem
- [x] Section order: Team → Facility → Schedule → Memberships
- [x] Sanctuary heading: "Build the Engine" → "Build the Machine"
- [x] Mobile: viewport, nav CTA, clean X icon, tel keypad, swipe hint
- [x] Spacing cleanup across all sections, landing pages, desktop + mobile
- [x] Smooth scroll offset so nav links land at headings cleanly
- [x] Contact + Footer fit together in viewport
- [x] Packiarajan renamed to Rajan (pronunciation clarity)
- [x] Sunday schedule merged into single WORKSHOP cell (both floors)
- [x] GA4 lead tracking added (generate_lead event on all forms)
- [x] Zoho CRM confirmed receiving leads in <20 seconds
- [x] Manoj Kumar added to Team section

---

## Pending Items

- [ ] **Photos** — swap PhotoBox placeholders (hero action shot, discipline cards, coach portraits with arms crossed on beige wall, facility wide shots, kids group, Journey sequence)
- [ ] **Meta Pixel** when Facebook Business Manager access restored
- [ ] **Gateway page** at nammacombat.com (Academy/Community switcher) — build when community app launches
- [ ] **mail.nammacombat.com** redirect to Gmail (low priority)

---


## Pending Photoshoot Decisions (Apr 19 — revisit next week)

When Vinod shoots photos for the site, the following layout decisions need to be made:

- **Why section** (`src/components/Why.js`) — currently text-only, full-width. Layout was briefly made 2-column (text + photo box) but reverted because it broke consistency with other narrative sections (Welcome).
  - **Decision needed:** Add visuals in one of two ways:
    - **Option A:** Single wide horizontal photo below the closer line (facility interior, empty, architectural). Full-section width, matches Facility section pattern.
    - **Option B:** Row of 3 small supporting images below the closer — one per differentiator (postural assessment / Animal Flow / group class). Matches Arena/Sanctuary card-grid pattern.
  - **Recommendation on shot:** Empty facility interior — the Sanctuary floor with Technogym, or Arena with ring. No people. This section is about *the space*, not people using it (coaches are in Team, action is in Arena/Sanctuary).
  - **Priority:** This section currently feels text-heavy without a visual. Photo unlocks it.

- **Hero right side** (`src/components/Hero.js`) — currently a dark PhotoBox placeholder. Was debated: Option A (branded pattern + seal), Option B (silhouette), Option C (bold typography). Decided to wait until Vinod shoots.
  - **Decision needed:** Replace with a striking action shot (someone mid-training, sweat, intensity). Hero photo should land in under 2 seconds and sell the brand before visitor reads anything.

- **All PhotoBox placeholders across the site** need to be swapped for real photos:
  - Hero action shot (right side)
  - Journey step visuals (×5)
  - Arena discipline cards (Boxing, Kickboxing, MMA, BJJ, Wrestling, Judo)
  - Sanctuary discipline cards (S&C, Animal Flow, HIIT, Olympic Lifting)
  - Coach portraits (×6 — Kantharaj, Naeem, Rajan, Venkatesh, Spoorthi, Manoj)
  - Facility interior wide shot
  - Kids group training photo


## Photo Specifications (for shoot day)

**Camera:** Leica SL3 (60MP full-frame, native 6000×4000 4:3)
**Shoot in DNG (RAW)** — gives maximum flexibility in post for cropping + color grading.

### Shooting principles (Leica SL3-specific)
- Use **electronic shutter for silent capture** — coaches and athletes won't flinch mid-movement
- **ISO 100-800 ideal**; SL3 handles up to ISO 6400 cleanly if indoor lighting is mixed
- Shoot **slightly overexposed** (+0.3 to +0.7 EV) for the warm cream / beige aesthetic — easier to preserve highlights in Leica DNG than recover shadows
- Use **APO-Summicron 35mm f/2** or **50mm f/2 SL** for environmental shots
- **90mm f/2 SL** or **75mm** for coach portraits (flattering compression)
- Avoid overly wide lenses (21mm, 24mm) — distortion feels generic-fitness, not premium

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

Leica SL3 native 6000×4000 RAW gives plenty of room to crop to any of these.

### Export settings for web
- **Format:** JPEG, quality 85 (balances file size + sharpness)
- **Color profile:** sRGB (not Adobe RGB) — web browsers render sRGB correctly
- **Max longest edge:** 1920px (any bigger = bloat without visible gain on most screens)
- **Target file size:** 200-400KB per image (keeps site fast-loading)

### Journey section (5 shots, horizontal 2.67:1)
Rhythm across 5 steps — don't shoot 5 similar actions:
1. **Trial** — architectural / entrance shot (empty, moody)
2. **Assess** — close-up detail (hands on posture chart, tablet)
3. **Plan** — planning moment (whiteboard, training plan being written)
4. **Train** — wide group action shot (multiple people training)
5. **Mastery** — signature hero moment (single fighter mid-technique, wide environmental)

### Coach portraits (6 shots, square 1:1)
Consistency is the key:
- **Same warm beige wall** for all 6 portraits
- **Same lighting direction** (one window source camera-left works well in SL3's natural rendering)
- **Same pose language** — arms crossed OR standing relaxed, looking into lens
- **Coaches to shoot:** Kantharaj, Naeem, Rajan, Venkatesh, Spoorthi, Manoj
- **Leica note:** SL3's color science handles skin tones especially well — you may not need heavy grading

### Hero image (1 shot, ~6:5)
Right side of hero. Striking action moment — sweat, intensity, movement.
Options: a fighter mid-punch on a bag, a wrestler mid-takedown, a coach on pads with an athlete.
**Not a portrait** — this needs energy. Shoot at wider aspect and crop in.

### Discipline cards (10 shots, 4:3)
One signature visual per discipline:
- **Boxing** — hand wraps + gloves, or a glove striking a pad
- **Kickboxing** — kick mid-air
- **MMA** — cage / mat grappling shot
- **BJJ** — two athletes in a guard position, dark/moody
- **Wrestling** — takedown moment
- **Judo** — throw mid-air (dynamic)
- **S&C** — athlete under a barbell or on Technogym equipment
- **Animal Flow** — low ground-movement, athlete in a beast position
- **HIIT** — athlete mid-burpee or on air bike (fast energy)
- **Olympic Weightlifting** — snatch or clean catch moment

### Facility wide shot (1 shot, 16:7)
Empty or near-empty interior. Architectural. Shows premium equipment without people blocking it.
**Best time to shoot:** early morning, before first class, with natural light through windows.

### Kids group (1 shot, 3:4 vertical)
Coached environment, kids in rows or a drill. **Parental consent required for every child visible.**

### Total minimum shoot list: **19 photos**
Budget: half-day shoot at the academy should cover this if well-planned.

### Shot list priority (in case of time constraints)
1. 6 coach portraits (highest priority — identity of the academy)
2. Hero image (first impression)
3. Facility wide shot (quality of space)
4. 6 Arena discipline cards (the product)
5. 4 Sanctuary discipline cards (the product)
6. 5 Journey horizontal shots (nice to have)
7. Kids group shot (only if parental consent is fast)


## Account Ownership (all under Vinod's control)

- GitHub: vikramravella
- Vercel: vi@nammacombat.com
- Namecheap: vinodkaruturi
- Google Workspace admin: Vinod
- Google Analytics: Vinod
- Zoho CRM: Vinod

---

## Separate Workstreams (not in this repo)

- **Community app Phase 1** — Separate chat. React Native, phone OTP login, member feed, booking in 2 months. PRD: `NAMMA_COMBAT_APP_PRD_v1.2.pdf`.
- **Brand ecosystem:** Academy (current) + Community (app, building) + Namma Fight league (future)

---

## Notes for Future Chats

- If context is lost, start a new chat and paste this README
- Website is fully functional at nammacombat.com with Zoho + GA4 live
- Next priorities: photos, Meta Pixel, Manoj bio, gateway page
- Vinod is non-technical but comfortable with Terminal/Git after this project
- Prefers `sed`/`python3` in-place edits over downloading whole files when possible
- Form pre-select values MUST exactly match dropdown options or they fall back to first option
- Zoho regenerates hidden keys on every form edit — must propagate across all 11+ files
- `&` in sed replacements breaks regex — use python3 `.replace()` instead
