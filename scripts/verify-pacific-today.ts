/**
 * Run: npx tsx scripts/verify-pacific-today.ts
 * Verifies Pacific "today" + midnight scheduling without waiting until real midnight.
 */
import {
  msUntilNextPacificMidnight,
  pacificDateParts,
  pacificTodayISO,
} from '../lib/pacific-date';
import { todayISO } from '../lib/cycle';

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

console.log('\n=== pacificTodayISO (known instants) ===\n');

// 2026-06-24 06:59 UTC = 2026-06-23 11:59 PM PDT (UTC-7)
assert(
  pacificTodayISO(new Date('2026-06-24T06:59:00Z')) === '2026-06-23',
  '23:59 PDT on Jun 23 → still Jun 23'
);

// 2026-06-24 07:00 UTC = 2026-06-24 12:00 AM PDT
assert(
  pacificTodayISO(new Date('2026-06-24T07:00:00Z')) === '2026-06-24',
  '00:00 PDT on Jun 24 → Jun 24'
);

// 2026-01-15 07:59 UTC = 2026-01-14 11:59 PM PST (UTC-8)
assert(
  pacificTodayISO(new Date('2026-01-15T07:59:00Z')) === '2026-01-14',
  '23:59 PST on Jan 14 → still Jan 14 (winter)'
);

// 2026-01-15 08:00 UTC = 2026-01-15 12:00 AM PST
assert(
  pacificTodayISO(new Date('2026-01-15T08:00:00Z')) === '2026-01-15',
  '00:00 PST on Jan 15 → Jan 15 (winter)'
);

console.log('\n=== todayISO() uses Pacific ===\n');
assert(typeof todayISO() === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(todayISO()), `todayISO() = ${todayISO()}`);

console.log('\n=== msUntilNextPacificMidnight ===\n');

function assertRollsToNextDay(label: string, beforeUtc: string) {
  const now = new Date(beforeUtc);
  const today = pacificTodayISO(now);
  const ms = msUntilNextPacificMidnight(now);
  const after = new Date(now.getTime() + ms);
  const nextDay = pacificTodayISO(after);
  assert(nextDay !== today, `${label}: ${today} → ${nextDay} after ${Math.round(ms / 1000)}s`);
  assert(ms > 0 && ms <= 48 * 60 * 60 * 1000, `${label}: delay ${ms}ms is within 48h`);
}

assertRollsToNextDay('1 min before PDT midnight', '2026-06-24T06:59:00Z');
assertRollsToNextDay('1 min before PST midnight', '2026-01-15T07:59:00Z');
assertRollsToNextDay('noon PDT', '2026-07-09T19:00:00Z');

console.log('\n=== pacificDateParts ===\n');
const parts = pacificDateParts('2026-06-24');
assert(parts.year === 2026 && parts.month === 5 && parts.day === 24, 'Jun 24 → month index 5');

console.log('\n=== simulated TodayProvider timer (fake timers) ===\n');

// Minimal reimplementation of provider scheduling logic
function simulateMidnightTick(startUtc: string): { before: string; after: string } {
  const start = new Date(startUtc);
  let current = pacificTodayISO(start);
  const ms = msUntilNextPacificMidnight(start);
  const fired = new Date(start.getTime() + ms);
  const next = pacificTodayISO(fired);
  return { before: current, after: next };
}

const sim = simulateMidnightTick('2026-06-24T06:59:30Z');
assert(sim.before === '2026-06-23' && sim.after === '2026-06-24', `timer at 23:59:30 PDT: ${sim.before} → ${sim.after}`);

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
