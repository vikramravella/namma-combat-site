// Legacy "Interested in" dropdown values used on the marketing landing pages
// → mapped to the canonical OFFERINGS keys used in the NCA admin.
// Returns an array (multi-select on the new system).

const MAP = {
  'Boxing': ['Boxing'],
  'Kickboxing': ['Kickboxing'],
  'BJJ': ['Jiu-Jitsu'],
  'Jiu-Jitsu': ['Jiu-Jitsu'],
  'MMA': ['MMA'],
  'MMA - Mixed Martial Arts': ['MMA'],
  'Wrestling': ['Wrestling'],
  'Judo': ['Judo'],
  'Olympic Lifting': ['S&C'],
  'S&C': ['S&C'],
  'S&C - Strength & Conditioning': ['S&C'],
  'Strength & Conditioning': ['S&C'],
  'HIIT': ['S&C'],
  'Strength': ['S&C'],
  'Animal Flow': ['Animal Flow'],
  'Personal Training': ['Personal Training'],
  'Kids / Youth Program': [],
  "Women's Program": [],
  'General Trial': [],
  'Not sure — help me decide': ['Not sure — help me decide'],
};

export function mapLegacyInterest(s) {
  if (!s) return [];
  return MAP[s] || [];
}
