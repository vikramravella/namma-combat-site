// Compute IST "today" boundaries on a UTC server.
// India is UTC+5:30, no DST. We shift by 5.5h, take UTC date components,
// then shift back to UTC instants for comparing against stored timestamps.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function istTodayWindow(now = new Date()) {
  const istNowMs = now.getTime() + IST_OFFSET_MS;
  const ist = new Date(istNowMs);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();
  const startUtc = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - IST_OFFSET_MS);
  const endUtc = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MS);
  return { start: startUtc, end: endUtc };
}
