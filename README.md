# Namma Combat Website — Project Documentation

## Quick Start
```
cd ~/Downloads/namma-combat-site
npm install
npm run dev
# Site runs at http://localhost:3000
```

## Deployment
- **Hosting:** Vercel (free) — auto-deploys when you push to GitHub
- **GitHub:** github.com/vikramravella/namma-combat-site
- **Vercel URL:** namma-combat-site.vercel.app
- **Domain:** nammacombat.com (pending — Vercel support ticket to release from old developer's account)
- **Domain Registrar:** Namecheap (login: vinodkaruturi)
- **Nameservers:** ns1.vercel-dns.com, ns2.vercel-dns.com

## How to make changes
1. Download updated file from Claude
2. Copy it to the right location in ~/Downloads/namma-combat-site/
3. Run: `cd ~/Downloads/namma-combat-site && git add . && git commit -m "description" && git push`
4. Vercel auto-deploys in 30 seconds

## Tech Stack
- **Framework:** Next.js (React)
- **Font:** Materia Pro Bold (custom brand font from Pretty/Ugly Design) — file at public/fonts/MateriaPro-Bold.otf
- **Fallback font:** Archivo Black
- **Brand Colors:** Rust #9A3520, Gold #E3C768, Cream #FEF8EE
- **Tagline:** Skill | Strength | Sanctuary

## File Structure
```
src/
  app/
    page.js          — Homepage (assembles all sections)
    layout.js         — SEO meta tags, fonts, global styles
    globals.css       — CSS variables, font-face, base styles
    trial/page.js     — General trial landing page
    boxing/page.js    — Boxing landing page
    kickboxing/page.js — Kickboxing landing page
    mma/page.js       — MMA landing page
    wrestling/page.js — Wrestling landing page
    judo/page.js      — Judo landing page
    strength/page.js  — S&C landing page
    womens/page.js    — Women's self-defence landing page
    corporate/page.js — Corporate wellness landing page
    kids/page.js      — Kids & youth landing page
  components/
    Nav.js            — Sticky navigation bar with logo
    Hero.js           — Hero section with CTA
    Welcome.js        — "Welcome to the Sanctuary" positioning section
    Journey.js        — "Your Journey" 5-step onboarding section
    Arena.js          — Combat sports overview (6 disciplines)
    Sanctuary.js      — S&C disciplines overview
    Sections.js       — Kids, Team, Memberships, Facility, Testimonials, Contact, LeadForm, Footer, FloatingWA
    ui.js             — Shared UI components (Reveal, Section, Eyebrow, Heading, Body, PrimaryBtn, PhotoBox)
public/
  logo.svg            — Wordmark logo (nav)
  seal.svg            — Seal/monogram logo (footer, favicon)
  favicon.svg         — Browser tab icon
  fonts/MateriaPro-Bold.otf — Brand display font
```

## Pages & URLs
| Page | URL Path | Purpose |
|------|----------|---------|
| Homepage | / | Main site — organic/SEO traffic |
| General Trial | /trial | Ad landing page — general campaigns |
| Boxing | /boxing | Ad landing page — boxing campaigns |
| Kickboxing | /kickboxing | Ad landing page — kickboxing campaigns |
| MMA | /mma | Ad landing page — MMA campaigns |
| Wrestling | /wrestling | Ad landing page — wrestling campaigns |
| Judo | /judo | Ad landing page — judo campaigns |
| S&C | /strength | Ad landing page — strength & conditioning |
| Women's | /womens | Ad landing page — women's safety/fitness |
| Corporate | /corporate | Ad landing page — corporate wellness |
| Kids | /kids | Ad landing page — kids/youth programs |

## Zoho CRM Integration
- **Form endpoint:** https://crm.zoho.in/crm/WebToLeadForm
- **Method:** Hidden iframe form submission (not fetch API)
- **Form ID:** webform1242297000001060922
- **Hidden field xnQsjsdp:** 99653fdcad80d5ed508b1cbc2fb6734aa3b626c08882e43a3d49ae09e4d44988
- **Hidden field xmIwtLD:** e37346fd7bac7aecec0937355410b4181a99c63b0b93668a95d3dcd0791c2a00afffb244e0a9b96c06a13bb8c8bd5cab
- **Fields sent:** First Name, Last Name, Phone, Lead Source (auto: "Website"), LEADCF14 (Interested In)
- **Form Location URL whitelist:** namma-combat-site.vercel.app (add nammacombat.com when domain is live)
- **Lead form exists in:** Sections.js (homepage modal) + all 10 landing pages (inline form)
- **Zoho Web Forms:** Setup → Channels → Web Forms → "Website Lead Form"

## Coaches (current)
1. Kantharaj Agasa — Co-founder & Head Coach (MMA, Judo, BJJ)
2. Mohammed Naeem — Co-founder & Head of S&C (MSc Performance Coaching, Setanta College)
3. Packiarajan — Boxing Lead (NIS Patiala certified, national gold medalist)
4. Venkatesh A — Wrestling Coach (NIS Patiala certified, Master's in Sports Management)
5. Spoorthi Nagraj — S&C & Women's Health (Animal Flow L1 certified)

## Testimonials (current)
### Homepage (6 testimonials):
1. Lochen Raj GM — Beginner, 1 month training
2. Hindesh Akash — Training since October 2025
3. Raktim Singha — MMA Coach & Gym Owner
4. Sai Anjana G — Athlete (female)
5. Karthik Eashwar — Parent
6. Shubham — Trained across India

### Landing pages (tailored per discipline):
- Boxing → Shubham
- Kickboxing → Nitish R
- MMA → Raktim Singha
- Wrestling → Dhruv P
- Judo → Gopinath Kannan
- S&C → Hindesh Akash
- Women's → Amrutha Gowda
- Corporate → Yashwanth Kumar S
- Kids → Karthik Eashwar
- General Trial → Raktim Singha

## Business Details
- **Address:** 10, 80 Feet Road, 4th Block, Koramangala, Bangalore
- **Phone:** 77700 87700
- **WhatsApp:** wa.me/917770087700
- **Hours:** Mon–Sat: 6 AM – 9 PM
- **Facility:** 4,200 sq ft, 2 floors (The Arena + The Sanctuary)
- **Equipment:** Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom SS racks
- **Memberships:** Silver (one floor) / Gold (both floors, recommended) / Platinum (Gold + 2 PT sessions + 2 guest passes)
- **No prices on website** — leads must enquire (drives form submissions)

## Key Design Decisions
- Warm, bright, cream background — NOT dark/moody
- "Institute of Mastery" / "Modern Stoic Mentor" personality
- No prices shown — forces enquiry (better for lead gen)
- Founder (Vinod) never featured on site
- Landing pages: no navigation, one CTA, conversion-focused
- Photos: currently using branded dark placeholders — swap with real photos when ready
- Success message: "We'll call you soon" — no mention of postural assessment (that's post-membership)

## Photos — When Ready
Replace PhotoBox components with <img> tags. Placeholder labels tell you what to shoot:
- Hero: action shot in ring area
- Discipline cards: one action shot per sport
- Coach portraits: individual, arms crossed, beige wall backdrop
- Facility: wide shots of each floor
- Kids: group session shot
- Journey: posture assessment, coaching, Animal Flow class

## Pending Items
- [ ] Domain: nammacombat.com transfer from old Vercel account (support ticket submitted)
- [ ] Google Analytics 4: add Measurement ID to layout.js
- [ ] Meta Pixel: add when Facebook access recovered
- [ ] Open Graph image: for WhatsApp/social sharing previews
- [ ] Photos: swap placeholders when shot
- [ ] Add nammacombat.com to Zoho Form Location URL whitelist when domain is live

## Important Notes
- All accounts are under Vinod's control: GitHub (vikramravella), Vercel (vi@nammacombat.com), Namecheap (vinodkaruturi)
- Old developer's Vercel account (developers@nammacombat.com) has domain locked — support ticket pending
- When updating Zoho web form, it regenerates hidden field values — update xnQsjsdp and xmIwtLD in ALL files
- BJJ is NOT offered currently — excluded from all landing pages
