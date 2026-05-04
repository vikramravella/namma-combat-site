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

// Normalizes a health note for write-path persistence:
//   - returns null if the input is noise / empty / a multi-select "none" sentinel
//   - returns a clean trimmed string otherwise
// Use this at every place that writes Member.medicalNotes so the DB column
// always holds either `null` or a meaningful note. The read-time
// isHealthNoteMeaningful() guard remains for legacy data that predates this.
export function normalizeHealthNote(notes) {
  if (notes == null) return null;
  const trimmed = String(notes).trim();
  if (!trimmed) return null;
  if (NOISE.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

// Combine multiple health-note fields (medical conditions + past injuries) into
// one normalized string for Member.medicalNotes. Each piece is normalized
// independently so a "none" answer in one field does not pollute the other.
export function combineHealthNotes(...parts) {
  const cleaned = parts.map((p) => normalizeHealthNote(p)).filter(Boolean);
  if (cleaned.length === 0) return null;
  return cleaned.join('\n\n');
}
