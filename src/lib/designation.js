// Auto-pick a designation for kids from DOB + gender. Adults keep whatever
// designation they (or the form) already supplied — we only override when
// the person is under 18 AND we have a gender to choose between Master/Miss.
//
// Returns the designation that should be saved. Always returns a string or
// null; never throws.

const KID_AGE_LIMIT = 18;

export function inferKidDesignation(dob, gender, currentDesignation) {
  if (!dob) return currentDesignation || null;
  const age = ageInYears(dob);
  if (age == null || age >= KID_AGE_LIMIT) return currentDesignation || null;
  const g = String(gender || '').trim().toUpperCase();
  if (g === 'M' || g === 'MALE') return 'Master';
  if (g === 'F' || g === 'FEMALE') return 'Miss';
  return currentDesignation || null;
}

export function ageInYears(dob) {
  const d = dob instanceof Date ? dob : new Date(dob);
  if (!isFinite(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
