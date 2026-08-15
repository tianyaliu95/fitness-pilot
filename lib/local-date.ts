/** Calendar dates in the user's current timezone (DST-aware). */

export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** YYYY-MM-DD for `now` in `timeZone`. */
export function dateISOInTimeZone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function localTodayISO(now = new Date()): string {
  return dateISOInTimeZone(getLocalTimeZone(), now);
}

/** Milliseconds until the next midnight in `timeZone` (minimum 1s). */
export function msUntilNextMidnightInTimeZone(timeZone: string, now = new Date()): number {
  const start = now.getTime();
  const today = dateISOInTimeZone(timeZone, now);
  let lo = start;
  let hi = start + 48 * 60 * 60 * 1000;

  if (dateISOInTimeZone(timeZone, new Date(hi)) === today) {
    return 24 * 60 * 60 * 1000;
  }

  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2);
    if (dateISOInTimeZone(timeZone, new Date(mid)) === today) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return Math.max(1000, hi - start + 500);
}

export function msUntilNextLocalMidnight(now = new Date()): number {
  return msUntilNextMidnightInTimeZone(getLocalTimeZone(), now);
}

export function isoDateParts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month: month - 1, day };
}
