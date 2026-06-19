import type { AppState, CarbType, CycleDayTemplate } from './types';
import {
  DEFAULT_MEAL_HIGH,
  DEFAULT_MEAL_LOW,
  migrateMealPlan,
} from './intake';

export const CYCLE_LENGTH = 4;

export const DEFAULT_CYCLE_DAYS: CycleDayTemplate[] = [
  { dayIndex: 0, carbType: 'low', workout: '练胸', label: 'Day 1' },
  { dayIndex: 1, carbType: 'low', workout: '练背', label: 'Day 2' },
  { dayIndex: 2, carbType: 'low', workout: '休息 / 篮球 / 有氧', label: 'Day 3' },
  { dayIndex: 3, carbType: 'high', workout: '练肩 + 练腿', label: 'Day 4' },
];

export function todayISO(): string {
  const d = new Date();
  return formatDateISO(d);
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function diffDays(from: string, to: string): number {
  const a = parseDateISO(from);
  const b = parseDateISO(to);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function subtractDays(iso: string, days: number): string {
  const d = parseDateISO(iso);
  d.setDate(d.getDate() - days);
  return formatDateISO(d);
}

/** Set anchor so that `today` maps to the given cycle day index (0–3). */
export function anchorDateForCycleDay(today: string, cycleDayIndex: number): string {
  return subtractDays(today, cycleDayIndex);
}

export function getCycleDayIndex(
  anchorDate: string,
  targetDate: string,
  delayedDates: string[]
): number {
  const rawDays = diffDays(anchorDate, targetDate);
  const delaysBefore = delayedDates.filter((d) => d < targetDate).length;
  const effective = rawDays - delaysBefore;
  return ((effective % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
}

export function getCarbLabel(type: CarbType): string {
  return type === 'low' ? '低碳' : '高碳';
}

export function getDefaultState(): AppState {
  return {
    anchorDate: todayISO(),
    delayedDates: [],
    intakeLow: { ...DEFAULT_MEAL_LOW },
    intakeHigh: { ...DEFAULT_MEAL_HIGH },
    cycleDays: DEFAULT_CYCLE_DAYS.map((d) => ({ ...d })),
    weightLog: {},
  };
}

export function mergeState(partial: Partial<AppState>): AppState {
  const defaults = getDefaultState();
  return {
    ...defaults,
    ...partial,
    intakeLow: migrateMealPlan(partial.intakeLow, defaults.intakeLow),
    intakeHigh: migrateMealPlan(partial.intakeHigh, defaults.intakeHigh),
    cycleDays: partial.cycleDays ?? defaults.cycleDays,
    delayedDates: partial.delayedDates ?? defaults.delayedDates,
    weightLog: partial.weightLog ?? defaults.weightLog,
  };
}
