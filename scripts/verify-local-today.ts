/**
 * Run: npm run verify:local-today
 * Verifies timezone-aware "today" + midnight scheduling.
 */
import {
  dateISOInTimeZone,
  isoDateParts,
  localTodayISO,
  msUntilNextMidnightInTimeZone,
} from '../lib/local-date';
import { todayISO } from '../lib/cycle';

const PT = 'America/Los_Angeles';
const SHANGHAI = 'Asia/Shanghai';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log('\n=== dateISOInTimeZone (Pacific, known instants) ===\n');

assert(
  dateISOInTimeZone(PT, new Date('2026-06-24T06:59:00Z')) === '2026-06-23',
  '23:59 PDT on Jun 23 → still Jun 23'
);

assert(
  dateISOInTimeZone(PT, new Date('2026-06-24T07:00:00Z')) === '2026-06-24',
  '00:00 PDT on Jun 24 → Jun 24'
);

assert(
  dateISOInTimeZone(PT, new Date('2026-01-15T07:59:00Z')) === '2026-01-14',
  '23:59 PST on Jan 14 → still Jan 14 (winter)'
);

assert(
  dateISOInTimeZone(PT, new Date('2026-01-15T08:00:00Z')) === '2026-01-15',
  '00:00 PST on Jan 15 → Jan 15 (winter)'
);

console.log('\n=== dateISOInTimeZone (Shanghai) ===\n');

assert(
  dateISOInTimeZone(SHANGHAI, new Date('2026-06-23T15:59:00Z')) === '2026-06-23',
  '23:59 CST Jun 23 → still Jun 23'
);

assert(
  dateISOInTimeZone(SHANGHAI, new Date('2026-06-23T16:00:00Z')) === '2026-06-24',
  '00:00 CST Jun 24 → Jun 24'
);

console.log('\n=== todayISO() is YYYY-MM-DD ===\n');
assert(
  typeof todayISO() === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(todayISO()),
  `todayISO() = ${todayISO()} (local ${localTodayISO()})`
);

console.log('\n=== msUntilNextMidnightInTimeZone ===\n');

function assertRollsToNextDay(label: string, tz: string, beforeUtc: string) {
  const now = new Date(beforeUtc);
  const today = dateISOInTimeZone(tz, now);
  const ms = msUntilNextMidnightInTimeZone(tz, now);
  const after = new Date(now.getTime() + ms);
  const nextDay = dateISOInTimeZone(tz, after);
  assert(nextDay !== today, `${label}: ${today} → ${nextDay} after ${Math.round(ms / 1000)}s`);
  assert(ms > 0 && ms <= 48 * 60 * 60 * 1000, `${label}: delay ${ms}ms is within 48h`);
}

assertRollsToNextDay('1 min before PDT midnight', PT, '2026-06-24T06:59:00Z');
assertRollsToNextDay('1 min before PST midnight', PT, '2026-01-15T07:59:00Z');
assertRollsToNextDay('1 min before CST midnight', SHANGHAI, '2026-06-23T15:59:00Z');

console.log('\n=== isoDateParts ===\n');
const parts = isoDateParts('2026-06-24');
assert(parts.year === 2026 && parts.month === 5 && parts.day === 24, 'Jun 24 → month index 5');

console.log('\n=== AppShell wiring (static check) ===\n');
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const appShell = readFileSync(join(__dirname, '../components/AppShell.tsx'), 'utf8');
assert(appShell.includes('TodayProvider'), 'AppShell wraps with TodayProvider');
assert(appShell.includes('useTodayISO'), 'ShellContent subscribes via useTodayISO()');

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
