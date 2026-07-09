/** US Pacific — handles PST/PDT automatically. */
export const PACIFIC_TZ = 'America/Los_Angeles';

/** YYYY-MM-DD for the given instant in Pacific time. */
export function pacificTodayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PACIFIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Milliseconds until the next Pacific midnight (minimum 1s). */
export function msUntilNextPacificMidnight(now = new Date()): number {
  const start = now.getTime();
  const today = pacificTodayISO(now);
  let lo = start;
  let hi = start + 48 * 60 * 60 * 1000;

  if (pacificTodayISO(new Date(hi)) === today) {
    return 24 * 60 * 60 * 1000;
  }

  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2);
    if (pacificTodayISO(new Date(mid)) === today) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return Math.max(1000, hi - start + 500);
}

export function pacificDateParts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month: month - 1, day };
}
