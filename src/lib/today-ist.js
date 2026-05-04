// Compute the IST "today" window as UTC instants suitable for Prisma date
// comparisons against timestamps stored in UTC.
//
// We use Intl to extract the IST calendar date (so the timezone is
// explicit, not a magic offset constant), then convert IST midnight and
// IST 23:59:59.999 to UTC instants. India observes no DST so the +5:30
// offset is fixed; if that ever changes, replace the offset constant
// with a tz-aware library like date-fns-tz.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_TIMEZONE = 'Asia/Kolkata';

const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function istTodayWindow(now = new Date()) {
  const istDateStr = istDateFormatter.format(now); // 'YYYY-MM-DD'
  const [y, m, d] = istDateStr.split('-').map(Number);
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endUtcMs = Date.UTC(y, m - 1, d, 23, 59, 59, 999) - IST_OFFSET_MS;
  return { start: new Date(startUtcMs), end: new Date(endUtcMs) };
}
