// Weekly class timetable — same data as the marketing site (src/components/Schedule.js).
// Used by the admin trial booker so coach + discipline can be picked from a slot.

export const ARENA_SCHEDULE = {
  morning: [
    { time: '06:00', cells: ['Boxing', 'Boxing', 'Wrestling', 'Boxing', 'Boxing', 'Wrestling', ''] },
    { time: '07:00', cells: ['Jiu-Jitsu', 'Kickboxing', 'Boxing', 'Jiu-Jitsu', 'Kickboxing', 'Boxing', ''] },
    { time: '08:00', cells: ['Wrestling', 'Jiu-Jitsu', 'MMA', 'Wrestling', 'Jiu-Jitsu', 'Workshop', ''] },
    { time: '09:00', cells: ['Open Mat', 'Open Mat', 'Open Mat', 'Open Mat', 'Open Mat', 'Workshop', 'Workshop'] },
  ],
  evening: [
    { time: '16:00', cells: ['Judo', 'Judo', 'Judo', 'Judo', 'Judo', 'Judo', ''] },
    { time: '17:00', cells: ['Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', 'Wrestling', ''] },
    { time: '18:00', cells: ['Boxing', 'Boxing', 'Jiu-Jitsu', 'Boxing', 'Boxing', 'Jiu-Jitsu', ''] },
    { time: '19:00', cells: ['Kickboxing', 'Jiu-Jitsu', 'Boxing', 'Kickboxing', 'Jiu-Jitsu', 'Boxing', ''] },
    { time: '20:00', cells: ['Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', 'Elite Combat/MMA', '', ''] },
  ],
};

export const SANCTUARY_SCHEDULE = {
  morning: [
    { time: '06:00', cells: ['S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Reset & Play', ''] },
    { time: '07:00', cells: ['Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'Reset & Play', ''] },
    { time: '08:00', cells: ['S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Reset & Play', ''] },
    { time: '09:00', cells: ['Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Reset & Play', 'Workshop'] },
  ],
  evening: [
    { time: '17:00', cells: ['Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', '', ''] },
    { time: '18:00', cells: ['S&C', 'Animal Flow', 'S&C', 'Animal Flow', 'S&C', '', ''] },
    { time: '19:00', cells: ['Animal Flow', 'S&C', 'Animal Flow', 'S&C', 'Animal Flow', '', ''] },
    { time: '20:00', cells: ['Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', 'Elite S&C', '', ''] },
  ],
};

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Coach assignment by discipline + (for some) time
export function coachFor(area, discipline, time) {
  if (area === 'Arena') {
    const map = {
      'Boxing': 'Rajan',
      'Kickboxing': 'Kantharaj',
      'Jiu-Jitsu': 'Kantharaj',
      'Wrestling': 'Venkatesh',
      'Judo': 'Kantharaj',
      'MMA': 'Kantharaj',
      'Elite Combat/MMA': 'Kantharaj, Rajan & Venkatesh',
      'Open Mat': null,
      'Workshop': null,
    };
    return map[discipline] ?? null;
  }
  if (area === 'Sanctuary') {
    if (discipline === 'Elite S&C' && time === '20:00') return 'Naeem, Spoorthi or Manoj';
    if (discipline === 'Workshop') return null;
    return 'Spoorthi or Manoj';
  }
  return null;
}

/** Compute the next occurrence of a given day-of-week (0=Mon..6=Sun) on or after `from`. */
export function nextOccurrence(dayIndex, from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  // JS: 0=Sun, 1=Mon, ... — convert: dayIndex 0=Mon → js 1
  const jsTarget = (dayIndex + 1) % 7;
  const jsCurrent = d.getDay();
  let diff = (jsTarget - jsCurrent + 7) % 7;
  if (diff === 0) diff = 7; // skip today, next week's slot
  d.setDate(d.getDate() + diff);
  return d;
}
