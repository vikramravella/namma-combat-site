// Namma Combat Academy — domain constants.
// Source-of-truth for picklists, pricing, and stage values.
// All money in PAISE (integer); convert to rupees only at display.

export const DESIGNATIONS = ['Mr', 'Mrs', 'Ms', 'Master', 'Miss', 'Dr'];

export const SOURCES = [
  { key: 'website', label: 'Website' },
  { key: 'walk_in', label: 'Walk-in' },
  { key: 'referral', label: 'Referral' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'google', label: 'Google' },
  { key: 'coach_page', label: 'Coach page' },
  { key: 'other', label: 'Other' },
];

export const PRIMARY_GOALS = [
  'Fitness / weight loss',
  'Skill / self-defense',
  'Pro / amateur competition',
  'Stress relief / mental health',
];

export const EXPERIENCE_LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced'];

// Member skill level — set/promoted by coaches over time. Different from
// the self-reported "experience" on the original inquiry.
export const SKILL_LEVELS = [
  { key: 'Beginner', label: 'Beginner', tone: 'gray' },
  { key: 'Intermediate', label: 'Intermediate', tone: 'blue' },
  { key: 'Advanced', label: 'Advanced', tone: 'gold' },
  { key: 'Professional', label: 'Professional', tone: 'green' },
];

// Offerings — what an inquirer can express interest in. Multi-select.
export const OFFERINGS = [
  'Boxing',
  'Kickboxing',
  'Jiu-Jitsu',
  'Wrestling',
  'Judo',
  'MMA',
  'S&C',
  'Animal Flow',
  'Personal Training',
  'Not sure — help me decide',
];

// ─── Stages ────────────────────────────────────────────────────────────
export const INQUIRY_STAGES = [
  { key: 'new', label: 'New', tone: 'blue' },
  { key: 'following_up', label: 'Following up', tone: 'gold' },
  { key: 'trial_booked', label: 'Interested in trial', tone: 'green' },
  { key: 'not_interested', label: 'Not interested', tone: 'gray' },
  { key: 'not_responding', label: 'Not responding', tone: 'gray' },
];

export const TRIAL_STATUSES = [
  { key: 'booked', label: 'Booked', tone: 'blue' },
  { key: 'confirmed', label: 'Confirmed', tone: 'gold' },
  { key: 'rescheduled', label: 'Rescheduled', tone: 'gold' },
  { key: 'showed_up', label: 'Showed up', tone: 'green' },
  { key: 'no_show', label: 'No-show', tone: 'red' },
];

export const TRIAL_OUTCOMES = [
  { key: 'joined', label: 'Joined', tone: 'green' },
  { key: 'considering', label: 'Considering', tone: 'gold' },
  { key: 'didnt_join', label: "Didn't join", tone: 'red' },
  { key: 'lost_touch', label: 'Lost touch', tone: 'gray' },
];

export const MEMBER_STATUSES = [
  { key: 'active', label: 'Active', tone: 'green' },
  { key: 'on_freeze', label: 'On freeze', tone: 'gold' },
  { key: 'lapsed', label: 'Lapsed', tone: 'red' },
  { key: 'left', label: 'Left', tone: 'gray' },
];

export const PLAN_STATUSES = [
  { key: 'active', label: 'Active', tone: 'green' },
  { key: 'on_freeze', label: 'On freeze', tone: 'gold' },
  { key: 'ended', label: 'Ended', tone: 'gray' },
  { key: 'cancelled', label: 'Cancelled', tone: 'red' },
];

export const RECEIPT_STATUSES = [
  { key: 'issued', label: 'Issued', tone: 'blue' },
  { key: 'partial', label: 'Partially paid', tone: 'gold' },
  { key: 'paid', label: 'Paid', tone: 'green' },
  { key: 'void', label: 'Void', tone: 'gray' },
];

export const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI' },
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Card' },
  { key: 'bank_transfer', label: 'Bank transfer' },
  { key: 'razorpay', label: 'Razorpay' },
];

// ─── Pricing ──────────────────────────────────────────────────────────
// Base prices in RUPEES (pre-GST). Convert to paise via × 100 at use.
// Verify with Vinod before any price change.
export const TIERS = [
  { key: 'Silver',   label: 'Silver',   floor: '1 floor',          notes: '1 floor (Arena OR Sanctuary)' },
  { key: 'Student',  label: 'Student',  floor: 'Both floors',      notes: 'Both floors · valid student ID required' },
  { key: 'Gold',     label: 'Gold',     floor: 'Both floors',      notes: 'Both floors (Arena + Sanctuary)' },
  { key: 'Platinum', label: 'Platinum', floor: 'Both + PT',        notes: 'Both floors + Personal Training included' },
];

// Freeze caps — moderate international combat-sports norm (decided 2026-05-03)
export const CYCLES = [
  { key: 'Monthly',     label: 'Monthly',     days: 30,  freezeDays: 7  },
  { key: 'Quarterly',   label: 'Quarterly',   days: 90,  freezeDays: 18 },
  { key: 'Semi-Annual', label: 'Semi-Annual', days: 180, freezeDays: 30 },
  { key: 'Annual',      label: 'Annual',      days: 365, freezeDays: 54 },
];

// Freeze policy add-ons (enforced in plan/freeze actions, shown in receipt T&Cs)
export const FREEZE_POLICY = {
  minDaysPerFreeze: 7,            // a single freeze must be at least this long
  advanceNoticeDays: 7,           // must request this many days before start of freeze
  medicalExceptionUnlimited: true, // doctor's note → freeze cap doesn't apply
};

// PRICE_TABLE[tier][cycle] = base price in rupees (pre-GST)
export const PRICE_TABLE = {
  Silver:   { Monthly: 5500,  Quarterly: 15000, 'Semi-Annual': 28000, Annual: 45000  },
  Student:  { Monthly: 5500,  Quarterly: 15000, 'Semi-Annual': 28000, Annual: 45000  },
  Gold:     { Monthly: 7500,  Quarterly: 20500, 'Semi-Annual': 38000, Annual: 60000  },
  Platinum: { Monthly: 12000, Quarterly: 33000, 'Semi-Annual': 60000, Annual: 100000 },
};

// ─── Vendor / GST ─────────────────────────────────────────────────────
export const VENDOR = {
  legalName: 'Namma Combat',
  brandName: 'Namma Combat Academy',
  brandShort: 'NCA',
  address: 'No. 10, 80 Feet Road, Koramangala, Bangalore 560034',
  gstin: '29AHXPV9545M2ZR',
  sac: '999723',
  sacDescription: 'Physical fitness / health club services',
  placeOfSupply: '29 — Karnataka',
  pan: 'AHXPV9545M',
  phone: '+91 77700 87700',
  email: 'sales@nammacombat.com',
  whatsappNumber: '917770087700', // for wa.me links (no spaces, no +)
  cgstRate: 0.025,
  sgstRate: 0.025,
  totalGstRate: 0.05,
};

// ─── Disciplines (matches the website's timetable cells) ──────────────
export const DISCIPLINES_COMBAT = ['Boxing', 'Kickboxing', 'Jiu-Jitsu', 'Wrestling', 'Judo', 'MMA', 'Elite Combat/MMA', 'Open Mat', 'Workshop'];
export const DISCIPLINES_SANCTUARY = ['S&C', 'Animal Flow', 'Reset & Play', 'Elite S&C', 'Workshop'];

// ─── Posture assessment picklists (mirror the printed form) ───────────
export const ASSESSMENT_OPTIONS = {
  ankleArch: ['Normal', 'Pronated', 'Supinated'],
  ankleStability: ['Very Good', 'Good', 'Poor'],
  kneeAlignment: ['Neutral', 'Valgus', 'Varus'],
  pelvisTilt: ['Neutral', 'APT', 'PPT'],
  hipPosture: ['Neutral', 'Piked', 'Hiked'],
  spinePosture: ['Neutral', 'Scoliosis', 'Kyphosis', 'Lordosis'], // multi
  scapulaPosition: ['Neutral', 'Winged', 'Protracted', 'Elevated', 'Depressed'], // multi
  shouldersRotation: ['Neutral', 'IR', 'ER'],
  headNeckPosition: ['Neutral', 'Forward', 'Tilt', 'Rotation'], // multi
  gender: ['M', 'F'],
};

// Helpers
export function stageMeta(list, key) {
  return list.find((s) => s.key === key) || { key, label: key, tone: 'gray' };
}
