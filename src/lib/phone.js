// Normalize a user-entered phone number into a canonical stored form.
//
// Default country: India (+91). If the input has an explicit country code
// other than +91, that code is preserved (we just clean spacing/dashes) so
// non-Indian numbers aren't force-rewritten.
//
// Returns the normalized string, or null if the input cannot plausibly
// be a phone number (caller should treat null as a validation error).
//
// Examples:
//   '9876543210'         -> '+91 98765 43210'
//   '+91 98765 43210'    -> '+91 98765 43210'
//   '919876543210'       -> '+91 98765 43210'
//   '09876543210'        -> '+91 98765 43210'
//   '+1 415-555-1234'    -> '+14155551234'   (foreign — preserved)
//   '+44 20 7946 0958'   -> '+442079460958'  (foreign — preserved)
//   '12345'              -> null

export function normalizePhone(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return null;
    if (digits.startsWith('91') && digits.length === 12) {
      const local = digits.slice(2);
      return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
    }
    return `+${digits}`;
  }

  let d = s.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length !== 10) return null;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}
