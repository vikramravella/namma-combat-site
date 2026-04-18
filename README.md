# Namma Combat Website — Project Documentation

**Last updated: April 18, 2026**

## Quick Start
## Deployment & Domains
- **Hosting:** Vercel (auto-deploys from GitHub push)
- **GitHub:** github.com/vikramravella/namma-combat-site
- **Vercel account:** vi@nammacombat.com
- **Vercel project:** namma-combat-site

### Live domains (all serve the same site)
- **nammacombat.com** ✅ primary
- **www.nammacombat.com** ✅
- **academy.nammacombat.com** ✅ (kept because flyers were printed with this URL)

### Domain registrar
- **Namecheap** (login: vinodkaruturi)
- **Nameservers:** ns1.vercel-dns.com, ns2.vercel-dns.com

### DNS records on Vercel (nammacombat.com domain)
- A @ → 216.198.79.1
- CNAME www → 40017a59b7045eeb.vercel-dns-017.com
- CNAME academy → cname.vercel-dns.com
- TXT _vercel → (verification — added to claim domain)

### Domain recovery history
Old developer's Vercel account (developers@nammacombat.com) originally claimed the domain. We recovered it on April 18, 2026 via Vercel support. Old account no longer blocks the domain.

## How to make changes
1. Open Terminal and cd into the project: `cd ~/Downloads/namma-combat-site`
2. Make changes directly via `sed` / `python3` commands, OR download updated files from Claude and copy them in
3. Run: `git add . && git commit -m "description" && git push`
4. Vercel auto-deploys in 30 seconds

## Tech Stack
- **Framework:** Next.js (React) — App Router
- **Font:** Materia Pro Bold (custom brand font from Pretty/Ugly Design) — file at `public/fonts/MateriaPro-Bold.otf`
- **Fallback font:** Archivo Black
- **Brand Colors:** Rust #9A3520, Gold #E3C768, Cream #FEF8EE, Warm #F5F0E8
- **Tagline:** Skill · Strength · Sanctuary
- **Positioning:** "India's premier combat sports academy"

## File Structure
## Pages & URLs (11 landing pages + homepage = 12 total)
| Page | URL | Purpose | Pre-selected interest |
|------|-----|---------|----------------------|
| Homepage | / | Main site — organic/SEO traffic | — |
| General Trial | /trial | Ad landing — general | (none) |
| Boxing | /boxing | Ad landing — boxing | Boxing |
| Kickboxing | /kickboxing | Ad landing — kickboxing | Kickboxing |
| MMA | /mma | Ad landing — MMA | MMA - Mixed Martial Arts |
| Wrestling | /wrestling | Ad landing — wrestling | Wrestling |
| Judo | /judo | Ad landing — judo | Judo |
| S&C | /strength | Ad landing — strength | S&C - Strength & Conditioning |
| Animal Flow | /animal-flow | Ad landing — animal flow | Animal Flow |
| Women's | /womens | Ad landing — women's safety | (none) |
| Corporate | /corporate | Ad landing — corporate wellness | (none) |
| Kids | /kids | Ad landing — kids/youth | Kids / Youth Program |

**IMPORTANT:** The pre-selected value MUST exactly match one of the dropdown options, or it falls back to "Boxing" (first option). Dropdown options:
`Boxing, Kickboxing, MMA - Mixed Martial Arts, Wrestling, Judo, S&C - Strength & Conditioning, Animal Flow, Kids / Youth Program, Not sure — help me decide`

## Zoho CRM Integration
- **Endpoint:** https://crm.zoho.in/crm/WebToLeadForm
- **Method:** Hidden iframe form submission (not fetch API — fetch hits CORS)
- **Form ID:** webform1242297000001060922
- **Fields sent:** First Name, Last Name, Phone, Lead Source (auto: "Website"), LEADCF14 (Interested In)
- **Return URL after submit:** https://nammacombat.com/trial

### Current hidden keys (regenerated when form is edited in Zoho)
- **xnQsjsdp:** `7f86d216d021c558ef213f9f58487a514e5c706d4eaccbc094e22e3fc4da61d2`
- **xmIwtLD:** `cca4493149c188cf2f9842a325ca8ef7dfc26845273560ab6e7d2278d5c513b5e7eb5e760e03184a103077105dc14280`

### Form Location URL whitelist (in Zoho)
- https://nammacombat.com
- https://www.nammacombat.com
- https://academy.nammacombat.com

### If Zoho keys change (happens when you edit the web form)
Use sed to update all 11 files:
```bash
find src -type f -name "*.js" -exec sed -i '' "s|'xnQsjsdp': '[a-f0-9]*'|'xnQsjsdp': 'NEW_KEY_HERE'|g" {} \;
find src -type f -name "*.js" -exec sed -i '' "s|'xmIwtLD': '[a-f0-9]*'|'xmIwtLD': 'NEW_KEY_HERE'|g" {} \;
```

## Analytics & SEO
- **Google Analytics 4:** G-WLF5WZ9HRS (in layout.js)
- **Meta Pixel:** not installed (Facebook Business Manager access pending)
- **Open Graph image:** /og-image.png (21KB, 1200x630) — rust/gold/cream brand card with "Skill · Strength · Sanctuary"
- **Twitter card:** summary_large_image using same og-image.png
- **SEO keywords in layout.js:** "gym koramangala" kept intentionally — people search for it even though site never uses the word

## Coaches (current)
1. Kantharaj Agasa — Co-founder & Head Coach (MMA, Judo, BJJ)
2. Mohammed Naeem — Co-founder & Head of S&C (MSc Performance Coaching, Setanta College — the institution behind Premier League, International Rugby, NBA practitioners)
3. Packiarajan (Raj Anna) — Boxing Lead (NIS Patiala certified, national medalist, ex-army)
4. Venkatesh A — Wrestling Coach (NIS Patiala certified, Master's in Sports Management)
5. Spoorthi Nagraj — S&C & Women's Health (Animal Flow L1 certified)
6. Lal — Muay Thai coach

## Testimonials
### Homepage (6 testimonials):
1. Lochen Raj GM — Beginner, 1 month training
2. Hindesh Akash — Training since October 2025
3. Raktim Singha — MMA Coach & Academy Owner
4. Sai Anjana G — Athlete (female)
5. Karthik Eashwar — Parent
6. Shubham — Trained across India

### Landing pages (best-match per discipline):
- Boxing → Shubham
- Kickboxing → Nitish R
- MMA → Raktim Singha
- Wrestling → Dhruv P
- Judo → Gopinath Kannan
- S&C → Hindesh Akash
- Animal Flow → Hindesh Akash (inherited from strength template)
- Women's → Amrutha Gowda
- Corporate → Yashwanth Kumar S
- Kids → Karthik Eashwar
- General Trial → Raktim Singha

## Business Details
- **Address:** 10, 80 Feet Road, 4th Block, Koramangala, Bangalore
- **Phone:** 77700 87700
- **WhatsApp:** wa.me/917770087700
- **Hours:** Mon–Sat: 6 AM – 9 PM
- **Facility:** 4,200 sq ft, 2 floors (The Arena = combat, The Sanctuary = S&C)
- **Equipment:** Technogym Skill Row & Skill Ski, Hammer Strength air bikes, custom stainless steel squat racks
- **Memberships:** Silver (one floor) / Gold (both floors, recommended) / Platinum (Gold + 2 PT sessions + 2 guest passes)
- **No prices on website** — forces enquiry (drives form submissions)

## Programs Offered
Combat (The Arena): Boxing, Kickboxing, MMA, BJJ, Wrestling, Judo, Muay Thai
Strength (The Sanctuary): S&C, Animal Flow, HIIT, Olympic Lifting, Technogym open floor

## Brand Rules (CRITICAL)
- **NEVER use the word "gym"** — use "academy," "fitness centre," "studio," "institute," or "sanctuary"
- Exception: "Technogym" (equipment brand name) is fine — that's not the word "gym"
- Exception: Hidden SEO keyword "gym koramangala" in layout.js metadata — invisible to visitors, helps Google searches
- Positioning is "India's premier" (not "Bangalore's premier") — we're the best nationally
- Landing page eyebrows keep "in Bangalore" for local SEO/Google Ads intent

## Key Design Decisions
- Warm, bright, cream background — NOT dark/moody
- "Institute of Mastery" / "Modern Stoic Mentor" personality
- No prices shown — forces enquiry
- Founder (Vinod) never featured on site
- Landing pages: no navigation, one CTA, conversion-focused
- Photos: currently using branded placeholders — swap with real photos when ready
- Success message: "We'll call you soon" — NO mention of postural assessment (that's post-membership only)
- Journey + Welcome sections cover all skill levels (beginner, intermediate, competitive)

## Photos — When Ready
Replace PhotoBox components with <img> tags. Placeholder labels tell you what to shoot:
- Hero: action shot in ring area
- Discipline cards: one action shot per sport
- Coach portraits: individual, arms crossed, beige wall backdrop
- Facility: wide shots of each floor
- Kids: group session shot
- Journey: posture assessment, coaching, Animal Flow class

## Pending Items
- [ ] Meta Pixel: add when Facebook Business Manager access recovered
- [ ] Photos: swap placeholders when shot
- [ ] Gateway page at nammacombat.com (Academy / Community Coming Soon switcher) — build when community app launches
- [ ] mail.nammacombat.com redirect to Gmail (optional, low priority)

## Completed (Apr 18, 2026 session)
- [x] Domain recovered from old developer's Vercel account
- [x] nammacombat.com + www.nammacombat.com + academy.nammacombat.com all live
- [x] Open Graph image created and deployed
- [x] Twitter card metadata added
- [x] Animal Flow landing page created (11th landing page)
- [x] MMA & Strength pre-select fixed (was falling back to Boxing)
- [x] All "gym" references removed from visible site
- [x] Zoho keys updated + returnURL switched to nammacombat.com
- [x] Journey.js rewritten to cover all skill levels
- [x] Welcome.js injury-free mandate expanded to all levels
- [x] "India's premier" positioning across SEO + trial + hero
- [x] Naeem's credentials updated to MSc Setanta College

## Account Ownership (all under Vinod's control)
- GitHub: vikramravella
- Vercel: vi@nammacombat.com
- Namecheap: vinodkaruturi
- Google Workspace admin: Vinod
- Google Analytics: Vinod
- Zoho CRM: Vinod

## Notes for Future Chats
- If you lose this chat, start a new one and paste this README as context
- Website is fully functional at nammacombat.com with Zoho + GA4 running
- Separate chat is active for the community app (Phase 1 of the NC ecosystem)
- Next priority items: photos, Meta Pixel, gateway page

