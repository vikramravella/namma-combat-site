// Map GSTIN state-code prefix (first 2 digits) to (state name, place-of-supply label).
// Source: official GST state code list. Includes all 36 state/UT codes.
// Used to derive customer location for the receipt invoice template — for B2B
// (customer with GSTIN) the recipient state is determined by the GSTIN prefix.
// For B2C (no GSTIN) we default to Karnataka, our place of supply.
const GST_STATE_BY_CODE = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (before division)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

const DEFAULT_LOCATION = 'Bangalore, Karnataka, India';
const DEFAULT_STATE = 'Karnataka';

export function stateFromGstin(gstin) {
  if (!gstin || typeof gstin !== 'string') return null;
  const code = gstin.trim().slice(0, 2);
  return GST_STATE_BY_CODE[code] || null;
}

// Returns a human-readable customer location for the invoice template.
// - With GSTIN: "{State}, India" (derived from prefix)
// - Without GSTIN: place-of-supply default ("Bangalore, Karnataka, India")
export function customerLocationLabel({ gstin } = {}) {
  const state = stateFromGstin(gstin);
  if (state) return `${state}, India`;
  return DEFAULT_LOCATION;
}

export function customerStateLabel({ gstin } = {}) {
  return stateFromGstin(gstin) || DEFAULT_STATE;
}
