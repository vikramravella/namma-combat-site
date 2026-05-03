// Zoho → NCA importer.
// Reads from `~/.zoho/credentials`, pulls all CRM modules, upserts into NCA DB.
//
// Usage:
//   node --env-file=.env scripts/import-zoho.js                 # all modules
//   node --env-file=.env scripts/import-zoho.js --leads         # leads only
//   node --env-file=.env scripts/import-zoho.js --leads --trials
//   node --env-file=.env scripts/import-zoho.js --dry-run       # don't write
//
// Idempotent — re-running is safe (upsert on phone).
// Fields dropped per NCA rules: address, email.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PrismaClient } from '../src/generated/prisma/index.js';

const db = new PrismaClient();

// ─── Config ───────────────────────────────────────────────────────────
const CREDS_PATH = path.join(os.homedir(), '.zoho', 'credentials');
const ARGS = new Set(process.argv.slice(2));
const DRY_RUN = ARGS.has('--dry-run');
const ONLY = {
  leads: ARGS.has('--leads'),
  trials: ARGS.has('--trials'),
  contacts: ARGS.has('--contacts'),
  deals: ARGS.has('--deals'),
};
const ALL = !Object.values(ONLY).some(Boolean);

// ─── Credentials ──────────────────────────────────────────────────────
function loadCreds() {
  if (!fs.existsSync(CREDS_PATH)) {
    console.error(`Missing credentials at ${CREDS_PATH}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(CREDS_PATH, 'utf8').split('\n');
  const creds = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) creds[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return creds;
}
const CREDS = loadCreds();

// ─── Auth ─────────────────────────────────────────────────────────────
let accessToken = null;
async function getAccessToken() {
  if (accessToken) return accessToken;
  const url = `${CREDS.ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token?refresh_token=${encodeURIComponent(CREDS.ZOHO_REFRESH_TOKEN)}&client_id=${encodeURIComponent(CREDS.ZOHO_CLIENT_ID)}&client_secret=${encodeURIComponent(CREDS.ZOHO_CLIENT_SECRET)}&grant_type=refresh_token`;
  const r = await fetch(url, { method: 'POST' });
  const j = await r.json();
  if (!j.access_token) throw new Error('Failed to refresh token: ' + JSON.stringify(j));
  accessToken = j.access_token;
  return accessToken;
}

async function zohoFetch(pathSeg, params = {}) {
  const token = await getAccessToken();
  const qs = new URLSearchParams(params).toString();
  const url = `${CREDS.ZOHO_API_DOMAIN}/crm/v8/${pathSeg}${qs ? '?' + qs : ''}`;
  const r = await fetch(url, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  if (r.status === 204) return { data: [], info: {} };
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Zoho ${pathSeg} → ${r.status}: ${text.slice(0, 300)}`);
  }
  return r.json();
}

async function zohoPaginate(module, fields, pageSize = 200) {
  const all = [];
  let page = 1;
  for (;;) {
    const r = await zohoFetch(module, { fields: fields.join(','), page, per_page: pageSize });
    const records = r.data || [];
    all.push(...records);
    process.stdout.write(`\r  ${module}: fetched ${all.length}…`);
    if (!r.info?.more_records) break;
    page += 1;
  }
  process.stdout.write('\n');
  return all;
}

const FIELDS = {
  Leads: ['id', 'Salutation', 'First_Name', 'Last_Name', 'Phone', 'Mobile', 'Area_Location',
          'Interested_In1', 'Primary_Goal', 'Experience_Level', 'Logistic',
          'Lead_Source', 'Lead_Status', 'Description', 'Next_Follow_Up', 'Created_Time'],
  Trials: ['id', 'Trial_Member', 'Trial_Slot', 'Trial_Sport', 'Trial_Status', 'Trial_Outcome',
           'First_Name', 'Last_Name', 'Date_of_Birth', 'Gender', 'Emergency_Contact', 'Emergency_Contact_Number',
           'Medical_Conditions', 'Any_other_condition_we_should_be_aware_of',
           'Do_you_Smoke', 'Do_you_consume_Alcohol', 'Health_Declaration_Status',
           'Created_Time', 'Modified_Time'],
  Contacts: ['id', 'Salutation', 'First_Name', 'Last_Name', 'Phone', 'Mobile',
             'Date_of_Birth', 'Gender', 'Member_Status', 'Joined_On', 'Created_Time',
             'Emergency_Contact_Name', 'Emergency_Contact_Number',
             'Medical_Conditions', 'Smoking'],
  Deals: ['id', 'Contact_Name', 'Membership_Tier', 'Billing_Cycle',
          'Start_Date', 'End_Date', 'Bonus_Days',
          'Base_Price', 'GST_Amount', 'Amount', 'Amount_Paid', 'Balance_Amount',
          'Stage', 'Description', 'Freeze_Start_Date', 'Freeze_End_Date', 'Freeze_Days_Used',
          'Payment_Status', 'Transaction_Reference', 'Payment_Date', 'Balance_Payment_Follow_Up', 'Invoice_Note'],
};

// ─── Mappings ─────────────────────────────────────────────────────────
function mapDesignation(s) {
  if (!s) return null;
  const x = s.toLowerCase().replace(/\./g, '').trim();
  const ok = { mr: 'Mr', mrs: 'Mrs', ms: 'Ms', master: 'Master', miss: 'Miss', dr: 'Dr' };
  return ok[x] || null;
}

function normalizePhone(p) {
  if (!p) return null;
  let s = String(p).replace(/\D/g, '');
  // Strip leading 91/0 if 12+ digits
  if (s.length === 12 && s.startsWith('91')) s = s.slice(2);
  if (s.length === 11 && s.startsWith('0')) s = s.slice(1);
  if (s.length !== 10) return null; // skip bad phones (cant dedupe)
  return '+91 ' + s.slice(0, 5) + ' ' + s.slice(5);
}

function mapLeadStage(zohoStatus) {
  if (!zohoStatus) return 'new';
  const s = String(zohoStatus).toLowerCase();
  if (s.includes('trial scheduled') || s.includes('booked')) return 'trial_booked';
  if (s.includes('converted') || s.includes('member')) return 'trial_booked';
  if (s.includes('not interested') || s.includes('junk') || s.includes('lost') || s.includes('disqualified')) return 'not_interested';
  if (s.includes('not responding') || s.includes('no response')) return 'not_responding';
  if (s.includes('follow') || s.includes('qualif') || s.includes('contacted') || s.includes('future')) return 'following_up';
  return 'new';
}

function mapLeadSource(zohoSource) {
  if (!zohoSource) return 'other';
  const s = String(zohoSource).toLowerCase();
  if (s.startsWith('coach page')) return 'coach_page';
  if (s.includes('walk')) return 'walk_in';
  if (s.includes('referral') || s.includes('friend')) return 'referral';
  if (s.includes('instagram') || s.includes('insta')) return 'instagram';
  if (s.includes('google') || s.includes('search')) return 'google';
  if (s.includes('web') || s.includes('site') || s.includes('form')) return 'website';
  return 'other';
}

function mapMemberStatus(zohoStatus) {
  if (!zohoStatus) return 'active';
  const s = String(zohoStatus).toLowerCase();
  if (s.includes('frozen') || s.includes('freeze')) return 'on_freeze';
  if (s.includes('lapsed') || s.includes('inactive') || s.includes('expired')) return 'lapsed';
  if (s.includes('left') || s.includes('cancelled') || s.includes('denied')) return 'left';
  return 'active';
}

function mapTrialStatus(z) {
  if (!z) return 'booked';
  const s = String(z).toLowerCase();
  if (s.includes('confirmed')) return 'confirmed';
  if (s.includes('reschedul')) return 'rescheduled';
  if (s.includes('attended') && !s.includes('not')) return 'showed_up';
  if (s.includes('no show') || s.includes('not attended')) return 'no_show';
  if (s.includes('scheduled') || s.includes('booked')) return 'booked';
  return 'booked';
}

function mapTrialOutcome(z) {
  if (!z) return null;
  const s = String(z).toLowerCase();
  if (s.includes('converted') || s.includes('joined')) return 'joined';
  if (s.includes('pending') || s.includes('considering')) return 'considering';
  if (s.includes('not converted') || s.includes('did not')) return 'didnt_join';
  if (s.includes('not responding') || s.includes('lost')) return 'lost_touch';
  return null;
}

function mapPlanTier(z) {
  if (!z) return 'Silver';
  const s = String(z).toLowerCase();
  if (s.includes('platinum')) return 'Platinum';
  if (s.includes('gold')) return 'Gold';
  if (s.includes('student')) return 'Student';
  return 'Silver';
}

function mapPlanCycle(z) {
  if (!z) return 'Monthly';
  const s = String(z).toLowerCase();
  if (s.includes('annual') && !s.includes('semi')) return 'Annual';
  if (s.includes('semi') || s.includes('half')) return 'Semi-Annual';
  if (s.includes('quart') || s.includes('3 month')) return 'Quarterly';
  return 'Monthly';
}

function mapPlanStatus(z) {
  if (!z) return 'running';
  const s = String(z).toLowerCase();
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('expir') || s.includes('end') || s.includes('lapsed')) return 'ended';
  if (s.includes('frozen') || s.includes('freeze')) return 'on_freeze';
  return 'running';
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isFinite(d) ? d : null;
}

function multiToCsv(v) {
  if (Array.isArray(v)) return v.join(', ') || null;
  return v || null;
}

// Map Zoho "Interested In" raw values onto our canonical OFFERINGS keys.
// Zoho values often have descriptive suffixes (e.g. "MMA - Mixed Martial Arts");
// keep the prefix only. Unknown values are dropped (and logged once at end).
const OFFERING_MAP = {
  'mma': 'MMA',
  'boxing': 'Boxing',
  'kickboxing': 'Kickboxing',
  's&c': 'S&C',
  'strength & conditioning': 'S&C',
  'wrestling': 'Wrestling',
  'judo': 'Judo',
  'animal flow': 'Animal Flow',
  'jiu-jitsu': 'Jiu-Jitsu',
  'jiu jitsu': 'Jiu-Jitsu',
  'bjj': 'Jiu-Jitsu',
  'brazilian jiu-jitsu': 'Jiu-Jitsu',
  'personal training': 'Personal Training',
  'pt': 'Personal Training',
  'not sure': 'Not sure — help me decide',
  'not sure — help me decide': 'Not sure — help me decide',
  'not sure - help me decide': 'Not sure — help me decide',
};
const _unmappedOfferings = new Set();
function mapOfferings(v) {
  const items = Array.isArray(v)
    ? v
    : v ? String(v).split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : [];
  const out = new Set();
  for (const raw of items) {
    const head = String(raw).split(/\s[-—]\s/)[0].trim().toLowerCase();
    const mapped = OFFERING_MAP[head] || OFFERING_MAP[String(raw).trim().toLowerCase()];
    if (mapped) out.add(mapped);
    else _unmappedOfferings.add(raw);
  }
  return [...out];
}

// ─── Trackers — Zoho ID → NCA ID ──────────────────────────────────────
const leadIdToInquiryId = new Map();
const contactIdToMemberId = new Map();

// ─── Per-module sync ──────────────────────────────────────────────────
async function syncLeads() {
  console.log('\n→ Syncing Leads → Inquiries');
  const records = await zohoPaginate('Leads', FIELDS.Leads);
  let created = 0, updated = 0, skipped = 0;

  for (const r of records) {
    const phone = normalizePhone(r.Phone || r.Mobile);
    if (!phone) { skipped++; continue; }

    const data = {
      designation: mapDesignation(r.Salutation),
      firstName: (r.First_Name || '').trim() || '—',
      lastName: (r.Last_Name || '').trim() || '—',
      phone,
      interestedIn: mapOfferings(r.Interested_In1),
      primaryGoal: r.Primary_Goal || null,
      experience: r.Experience_Level || null,
      source: mapLeadSource(r.Lead_Source),
      sourceDetails: null,
      stage: mapLeadStage(r.Lead_Status),
      notes: r.Description || null,
      nextFollowUpAt: parseDate(r.Next_Follow_Up),
      zohoId: r.id,
      zohoRaw: JSON.stringify(r),
    };

    if (DRY_RUN) { console.log(`  [DRY] would upsert ${data.firstName} ${data.lastName} (${data.phone})`); continue; }

    const existing = await db.inquiry.findUnique({ where: { phone } });
    if (existing) {
      const u = await db.inquiry.update({ where: { id: existing.id }, data });
      leadIdToInquiryId.set(r.id, u.id);
      updated++;
    } else {
      const c = await db.inquiry.create({
        data: {
          ...data,
          createdAt: parseDate(r.Created_Time) || new Date(),
          events: { create: { type: 'created', label: 'Imported from Zoho', detail: `Zoho Lead ID ${r.id}` } },
        },
      });
      leadIdToInquiryId.set(r.id, c.id);
      created++;
    }
  }
  console.log(`  Done: ${created} created, ${updated} updated, ${skipped} skipped (no phone)`);
}

async function syncTrials() {
  console.log('\n→ Syncing Trials');
  const records = await zohoPaginate('Trials', FIELDS.Trials);
  let created = 0, updated = 0, skipped = 0;

  // Build lead→inquiry map if not already populated (e.g. when running --trials only)
  if (leadIdToInquiryId.size === 0) {
    const allInq = await db.inquiry.findMany({ select: { id: true, events: { where: { type: 'created' } } } });
    // Best-effort: parse Zoho Lead ID from initial event detail
    for (const i of allInq) {
      const detail = i.events[0]?.detail || '';
      const m = detail.match(/Zoho Lead ID ([\w]+)/);
      if (m) leadIdToInquiryId.set(m[1], i.id);
    }
  }

  for (const r of records) {
    const leadId = r.Trial_Member?.id;
    const inquiryId = leadIdToInquiryId.get(leadId);
    if (!inquiryId) { skipped++; continue; }

    const slot = parseDate(r.Trial_Slot);
    if (!slot) { skipped++; continue; }
    const time = slot.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayLabels[slot.getDay()];

    const discipline = r.Trial_Sport || 'Boxing';
    const area = ['S&C', 'Animal Flow', 'Reset & Play', 'Elite S&C'].some((d) => discipline.includes(d)) ? 'Sanctuary' : 'Arena';

    const data = {
      inquiryId,
      scheduledDate: slot,
      scheduledTime: time,
      day,
      area,
      discipline,
      status: mapTrialStatus(r.Trial_Status),
      outcome: mapTrialOutcome(r.Trial_Outcome),
      zohoId: r.id,
      zohoRaw: JSON.stringify(r),
    };

    if (DRY_RUN) { console.log(`  [DRY] would upsert trial for ${inquiryId}`); continue; }

    // Dedup by (inquiryId, scheduledDate, scheduledTime)
    const existing = await db.trial.findFirst({ where: { inquiryId, scheduledDate: slot, scheduledTime: time } });
    if (existing) {
      await db.trial.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      const t = await db.trial.create({ data });
      // Health declaration from intake fields (drop email; dob/gender etc. are OK)
      const hasHealth = r.Date_of_Birth || r.Gender || r.Emergency_Contact_Number || r.Medical_Conditions || r.Any_other_condition_we_should_be_aware_of || r.Do_you_Smoke || r.Do_you_consume_Alcohol;
      if (hasHealth && r.Health_Declaration_Status === 'Completed') {
        await db.healthDeclaration.create({
          data: {
            trialId: t.id,
            dob: parseDate(r.Date_of_Birth),
            gender: r.Gender || null,
            emergencyName: r.Emergency_Contact || null,
            emergencyPhone: r.Emergency_Contact_Number || null,
            emergencyRelation: null,
            medicalConditions: r.Medical_Conditions || null,
            injuries: r.Any_other_condition_we_should_be_aware_of || null,
            smoking: r.Do_you_Smoke?.toLowerCase().includes('yes') ? 'yes' : (r.Do_you_Smoke?.toLowerCase().includes('occasion') ? 'occasionally' : 'no'),
            alcohol: r.Do_you_consume_Alcohol?.toLowerCase().includes('regular') ? 'regularly' : (r.Do_you_consume_Alcohol?.toLowerCase().includes('social') ? 'socially' : 'no'),
            consentSignedName: `${r.First_Name || ''} ${r.Last_Name || ''}`.trim() || 'Imported',
            consentSignedAt: parseDate(r.Modified_Time) || new Date(),
          },
        });
      }
      created++;
    }
  }
  console.log(`  Done: ${created} created, ${updated} updated, ${skipped} skipped (no matching inquiry or no slot)`);
}

async function syncContacts() {
  console.log('\n→ Syncing Contacts → Members');
  const records = await zohoPaginate('Contacts', FIELDS.Contacts);
  let created = 0, updated = 0, skipped = 0;

  for (const r of records) {
    const phone = normalizePhone(r.Phone || r.Mobile);
    if (!phone) { skipped++; continue; }

    const data = {
      designation: mapDesignation(r.Salutation),
      firstName: (r.First_Name || '').trim() || '—',
      lastName: (r.Last_Name || '').trim() || '—',
      phone,
      dob: parseDate(r.Date_of_Birth),
      gender: r.Gender || null,
      status: mapMemberStatus(r.Member_Status),
      joinedAt: parseDate(r.Joined_On) || parseDate(r.Created_Time) || new Date(),
      emergencyName: r.Emergency_Contact_Name || null,
      emergencyPhone: r.Emergency_Contact_Number || null,
      medicalNotes: r.Medical_Conditions || null,
      smokes: typeof r.Smoking === 'string' && r.Smoking.toLowerCase().includes('yes'),
      // mediaConsent stays null (unknown)
      zohoId: r.id,
      zohoRaw: JSON.stringify(r),
    };

    if (DRY_RUN) { console.log(`  [DRY] would upsert member ${data.firstName} ${data.lastName} (${data.phone})`); continue; }

    const existing = await db.member.findUnique({ where: { phone } });
    if (existing) {
      const u = await db.member.update({ where: { id: existing.id }, data });
      contactIdToMemberId.set(r.id, u.id);
      updated++;
    } else {
      const c = await db.member.create({ data });
      contactIdToMemberId.set(r.id, c.id);
      created++;
    }
  }
  console.log(`  Done: ${created} created, ${updated} updated, ${skipped} skipped`);
}

async function syncDeals() {
  console.log('\n→ Syncing Deals → Plans + Receipts');
  const records = await zohoPaginate('Deals', FIELDS.Deals);
  let created = 0, updated = 0, skipped = 0;

  // Rebuild contactId → memberId map from DB if needed
  if (contactIdToMemberId.size === 0) {
    // No way to recover from DB without storing the Zoho ID — for cross-module run
    // we need to either re-pull contacts, or store zohoId on Member. For now, require
    // running --contacts before --deals in same invocation.
    console.log('  (contact map empty — run --contacts first or do --all)');
  }

  // Get fiscal year sequence baseline once
  const startSequenceByFY = {};

  for (const r of records) {
    const contactId = r.Contact_Name?.id;
    const memberId = contactIdToMemberId.get(contactId);
    if (!memberId) { skipped++; continue; }

    const startDate = parseDate(r.Start_Date);
    const endDate = parseDate(r.End_Date);
    if (!startDate || !endDate) { skipped++; continue; }

    const tier = mapPlanTier(r.Membership_Tier);
    const cycle = mapPlanCycle(r.Billing_Cycle);
    const basePricePaise = Math.round((Number(r.Base_Price) || 0) * 100);
    const agreedFinalPaise = Math.round((Number(r.Amount) || basePricePaise / 100 * 1.05) * 100);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (DRY_RUN) { console.log(`  [DRY] would upsert plan for member ${memberId}, ${tier} ${cycle}, ₹${(agreedFinalPaise / 100).toFixed(0)}`); continue; }

    // Dedup by (memberId, startDate)
    const existing = await db.plan.findFirst({ where: { memberId, startDate } });
    if (existing) {
      await db.plan.update({
        where: { id: existing.id },
        data: {
          tier, cycle, endDate, durationDays,
          bonusDays: Number(r.Bonus_Days) || 0,
          freezeDaysAllowed: cycleFreezeDays(cycle),
          freezeDaysUsed: Number(r.Freeze_Days_Used) || 0,
          basePricePaise,
          agreedFinalPaise,
          freezeStart: parseDate(r.Freeze_Start_Date),
          freezeEnd: parseDate(r.Freeze_End_Date),
          status: mapPlanStatus(r.Stage),
        },
      });
      updated++;
      continue;
    }

    const plan = await db.plan.create({
      data: {
        memberId,
        tier, cycle,
        floorAccess: tier === 'Silver' ? '1 floor' : (tier === 'Platinum' ? 'Both + PT' : 'Both floors'),
        startDate, endDate, durationDays,
        bonusDays: Number(r.Bonus_Days) || 0,
        freezeDaysAllowed: cycleFreezeDays(cycle),
        freezeDaysUsed: Number(r.Freeze_Days_Used) || 0,
        basePricePaise,
        agreedFinalPaise,
        freezeStart: parseDate(r.Freeze_Start_Date),
        freezeEnd: parseDate(r.Freeze_End_Date),
        status: mapPlanStatus(r.Stage),
        notes: r.Description || null,
        zohoId: r.id,
        zohoRaw: JSON.stringify(r),
      },
    });

    // Auto-create a receipt to mirror Zoho
    const fy = fiscalYearOf(startDate);
    const seq = await nextSeqForFY(fy);
    const member = await db.member.findUnique({ where: { id: memberId } });
    const fullN = `${member.designation ? member.designation + '. ' : ''}${member.firstName} ${member.lastName}`.trim();
    const grossTaxablePaise = basePricePaise;
    const fullTotalPaise = Math.round(grossTaxablePaise * 1.05);
    const discountFinalPaise = Math.max(0, fullTotalPaise - agreedFinalPaise);
    const discountPreTaxPaise = Math.round(discountFinalPaise / 1.05);
    const netTaxablePaise = grossTaxablePaise - discountPreTaxPaise;
    const cgstPaise = Math.round(netTaxablePaise * 0.025);
    const sgstPaise = Math.round(netTaxablePaise * 0.025);
    const totalPaise = netTaxablePaise + cgstPaise + sgstPaise;

    // Derive status from actual amounts (more accurate than Zoho's text field)
    const paidPaiseRaw = Math.round((Number(r.Amount_Paid) || 0) * 100);
    const cappedPaid = Math.min(paidPaiseRaw, totalPaise);
    let receiptStatus = 'issued';
    if (cappedPaid >= totalPaise && totalPaise > 0) receiptStatus = 'paid';
    else if (cappedPaid > 0) receiptStatus = 'partial';

    const receipt = await db.receipt.create({
      data: {
        planId: plan.id,
        invoiceNumber: `NCA/${fy}/${String(seq).padStart(4, '0')}`,
        fiscalYear: fy,
        sequence: seq,
        issueDate: startDate,
        customerNameSnapshot: fullN,
        customerPhoneSnapshot: member.phone,
        grossTaxablePaise,
        discountFinalPaise,
        discountPreTaxPaise,
        netTaxablePaise,
        cgstPaise,
        sgstPaise,
        totalPaise,
        status: receiptStatus,
        nextAgreedDate: receiptStatus === 'partial' ? parseDate(r.Balance_Payment_Follow_Up) : null,
        nextAgreedNote: receiptStatus === 'partial' ? (r.Invoice_Note || null) : null,
      },
    });

    // Payment record (if Amount_Paid present)
    if (cappedPaid > 0) {
      await db.payment.create({
        data: {
          receiptId: receipt.id,
          method: 'upi', // default — Zoho doesn't always specify
          reference: r.Transaction_Reference || null,
          amountPaise: cappedPaid,
          receivedAt: parseDate(r.Payment_Date) || startDate,
        },
      });
    }

    created++;
  }
  console.log(`  Done: ${created} created, ${updated} updated, ${skipped} skipped`);
}

function cycleFreezeDays(cycle) {
  return { 'Monthly': 7, 'Quarterly': 18, 'Semi-Annual': 30, 'Annual': 54 }[cycle] || 7;
}

function fiscalYearOf(date) {
  const d = new Date(date);
  const m = d.getMonth();
  const y = d.getFullYear();
  const startY = m >= 3 ? y : y - 1;
  return `${String(startY).slice(-2)}${String(startY + 1).slice(-2)}`;
}

async function nextSeqForFY(fy) {
  const max = await db.receipt.aggregate({ where: { fiscalYear: fy }, _max: { sequence: true } });
  return (max._max.sequence ?? 0) + 1;
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`Zoho importer · ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE WRITES'}`);
  console.log(`Modes: ${ALL ? 'ALL' : Object.entries(ONLY).filter(([, v]) => v).map(([k]) => k).join(', ')}`);

  if (ALL || ONLY.leads) await syncLeads();
  if (ALL || ONLY.contacts) await syncContacts();
  if (ALL || ONLY.trials) await syncTrials();
  if (ALL || ONLY.deals) await syncDeals();

  console.log('\n✔ Import complete.');
}

main()
  .catch((e) => { console.error('\n✗ Import failed:', e.message || e); process.exit(1); })
  .finally(() => db.$disconnect());
