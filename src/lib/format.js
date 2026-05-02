// Display helpers — names, dates, currency.

export function fullName(p) {
  if (!p) return '';
  const dn = p.designation ? `${p.designation}. ` : '';
  return `${dn}${p.firstName || ''} ${p.lastName || ''}`.trim();
}

/** Format paise as ₹X,XXX.XX (Indian numbering, 2 decimals). */
export function formatRupees(paise) {
  const rupees = (paise || 0) / 100;
  return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Same but no symbol. */
export function paiseToString(paise) {
  return ((paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert a "21000" string from a form input to paise. Empty → null. */
export function rupeesInputToPaise(input) {
  if (input == null || input === '') return null;
  const n = Number(String(input).replace(/[, ]/g, ''));
  if (!isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const ms = now - d;
  if (ms < 0) {
    const future = -ms;
    const days = Math.floor(future / 86400000);
    if (days === 0) {
      const hrs = Math.floor(future / 3600000);
      if (hrs === 0) return 'in a few minutes';
      return `in ${hrs} hour${hrs === 1 ? '' : 's'}`;
    }
    if (days === 1) return 'tomorrow';
    if (days < 7) return `in ${days} days`;
    return formatDate(d);
  }
  const days = Math.floor(ms / 86400000);
  if (days === 0) {
    const hrs = Math.floor(ms / 3600000);
    if (hrs === 0) {
      const mins = Math.max(1, Math.floor(ms / 60000));
      return `${mins} min ago`;
    }
    return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  return formatDate(d);
}

/** Mon-Tue-…-Sun for a date (matching the timetable column labels). */
export function dayLabel(d) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return labels[new Date(d).getDay()];
}

/** Indian rupee number → words (basic, English, for amount-in-words on receipts). */
export function rupeesToWords(rupees) {
  const n = Math.round(rupees);
  if (n === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function below100(x) {
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10), o = x % 10;
    return tens[t] + (o ? '-' + ones[o] : '');
  }
  function below1000(x) {
    if (x < 100) return below100(x);
    const h = Math.floor(x / 100), r = x % 100;
    return ones[h] + ' Hundred' + (r ? ' ' + below100(r) : '');
  }
  // Indian system: lakhs and crores
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (crore) parts.push(below100(crore) + ' Crore');
  if (lakh) parts.push(below100(lakh) + ' Lakh');
  if (thousand) parts.push(below100(thousand) + ' Thousand');
  if (rest) parts.push(below1000(rest));
  return parts.join(' ') + ' Rupees Only';
}

/** Generate a URL-safe random token (for health form links). */
export function randomToken(bytes = 16) {
  // crypto is available in Node and modern browsers
  const buf = new Uint8Array(bytes);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(buf, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 22);
}
