// Returns true if a medicalNotes value should NOT trigger a health alert.
// The trial / member forms used a multi-select that serialized the choice
// as a JSON-like string — picking "No known health conditions" came out as
// '["No known health conditions"]' instead of null. This helper filters
// those out so the alerts cards only show actual conditions.
const NOISE = new Set([
  '',
  'no',
  'none',
  'nil',
  'n/a',
  'na',
  'no known health conditions',
  '["no known health conditions"]',
  'none of the above',
  '["none of the above"]',
]);

export function isHealthNoteMeaningful(notes) {
  if (!notes) return false;
  const norm = String(notes).trim().toLowerCase();
  if (!norm) return false;
  return !NOISE.has(norm);
}
