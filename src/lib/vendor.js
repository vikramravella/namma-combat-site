import { cache } from 'react';
import { db } from '@/lib/db';
import { VENDOR as VENDOR_DEFAULTS } from '@/lib/constants';

// Brand / contact fields that live in the VendorSetting DB row. Tax rates
// stay in constants because they're regulatory.
const BRAND_KEYS = [
  'legalName',
  'brandName',
  'brandShort',
  'address',
  'gstin',
  'sac',
  'sacDescription',
  'placeOfSupply',
  'pan',
  'phone',
  'email',
  'whatsappNumber',
];

const TAX_KEYS = ['cgstRate', 'sgstRate', 'totalGstRate'];

// Returns the live vendor record, merging the editable VendorSetting row
// (auto-created on first read using constants.js defaults) with the
// non-editable tax-rate constants. React-cache means within a single
// request we only hit the DB once.
export const getVendor = cache(async () => {
  const existing = await db.vendorSetting.findUnique({ where: { id: 'main' } });
  if (existing) {
    const out = { ...existing };
    for (const k of TAX_KEYS) out[k] = VENDOR_DEFAULTS[k];
    return out;
  }
  // First-run: create the row from constants so the settings page has
  // something to edit.
  const seed = { id: 'main' };
  for (const k of BRAND_KEYS) seed[k] = VENDOR_DEFAULTS[k];
  const created = await db.vendorSetting.create({ data: seed });
  const out = { ...created };
  for (const k of TAX_KEYS) out[k] = VENDOR_DEFAULTS[k];
  return out;
});

// Server-action helper: update the editable fields. Tax rates / SAC are
// rejected because those should change via code review.
export async function updateVendor(patch) {
  const data = {};
  for (const k of BRAND_KEYS) {
    if (typeof patch[k] === 'string') data[k] = patch[k];
  }
  await db.vendorSetting.upsert({
    where: { id: 'main' },
    create: { id: 'main', ...buildSeed(), ...data },
    update: data,
  });
}

function buildSeed() {
  const seed = {};
  for (const k of BRAND_KEYS) seed[k] = VENDOR_DEFAULTS[k];
  return seed;
}
