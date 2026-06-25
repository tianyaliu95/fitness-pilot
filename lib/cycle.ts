import type {
  AppState,
  CarbType,
  CycleDayTemplate,
  UserProfile,
} from './types';
import { normalizeTrainingLog } from './training-log';
import {
  DEFAULT_MEAL_HIGH,
  DEFAULT_MEAL_LOW,
  migrateMealPlan,
} from './intake';

export const DEFAULT_CYCLE_LENGTH = 4;

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

export function addDays(iso: string, days: number): string {
  return subtractDays(iso, -days);
}

/** Set anchor so that `today` maps to the given cycle day index (0–3). */
export function anchorDateForCycleDay(today: string, cycleDayIndex: number): string {
  return subtractDays(today, cycleDayIndex);
}

export function getCycleLength(cycleDays: CycleDayTemplate[]): number {
  return Math.max(1, cycleDays.length);
}

export function getCycleDayIndex(
  anchorDate: string,
  targetDate: string,
  delayedDates: string[],
  cycleLength: number
): number {
  const len = Math.max(1, cycleLength);
  const rawDays = diffDays(anchorDate, targetDate);
  const delaysBefore = delayedDates.filter((d) => d < targetDate).length;
  const effective = rawDays - delaysBefore;
  return ((effective % len) + len) % len;
}

export function getCycleSummary(cycleDays: CycleDayTemplate[]): string {
  const low = cycleDays.filter((d) => d.carbType === 'low').length;
  const high = cycleDays.length - low;
  return `${cycleDays.length} 天循环：${low} 低碳 + ${high} 高碳`;
}

export function rebuildCycleDays(
  current: CycleDayTemplate[],
  newLength: number
): CycleDayTemplate[] {
  const len = Math.min(7, Math.max(2, newLength));
  const result: CycleDayTemplate[] = [];

  for (let i = 0; i < len; i++) {
    if (current[i]) {
      result.push({
        ...current[i],
        dayIndex: i,
        label: `Day ${i + 1}`,
      });
    } else {
      result.push({
        dayIndex: i,
        carbType: i === len - 1 ? 'high' : 'low',
        workout: '',
        label: `Day ${i + 1}`,
      });
    }
  }

  return result;
}

/** Preset patterns: low days then high days */
export function applyCyclePreset(
  current: CycleDayTemplate[],
  lowDays: number,
  highDays: number
): CycleDayTemplate[] {
  const len = lowDays + highDays;
  const result: CycleDayTemplate[] = [];

  for (let i = 0; i < len; i++) {
    const carbType: CarbType = i < lowDays ? 'low' : 'high';
    const existing = current[i];
    result.push({
      dayIndex: i,
      carbType,
      workout: existing?.workout ?? '',
      label: `Day ${i + 1}`,
    });
  }

  return result;
}

export function getCarbLabel(type: CarbType): string {
  return type === 'low' ? '低碳' : '高碳';
}

export function isOnOrAfterCycleStart(date: string, cycleStartDate: string): boolean {
  return !cycleStartDate || date >= cycleStartDate;
}

/** Resolve cycle template from live anchor (ignores historical snapshots) */
export function resolveLiveCycleTemplate(
  date: string,
  state: AppState
): { cycleDayIndex: number; template: CycleDayTemplate } {
  const cycleLength = getCycleLength(state.cycleDays);
  const cycleDayIndex = getCycleDayIndex(
    state.anchorDate,
    date,
    state.delayedDates,
    cycleLength
  );
  const template = state.cycleDays[cycleDayIndex] ?? state.cycleDays[0];
  return { cycleDayIndex, template };
}

/** Lock cycle assignment for dates strictly before `beforeDate` (current delays/anchor). */
export function freezeCycleHistoryBefore(
  state: AppState,
  beforeDate: string
): AppState['historicalDays'] {
  const result = { ...state.historicalDays };
  const rangeStart = state.cycleStartDate || state.anchorDate;
  if (!rangeStart || beforeDate <= rangeStart) return result;

  const last = subtractDays(beforeDate, 1);
  let date = rangeStart;
  while (date <= last) {
    if (!result[date]) {
      const { cycleDayIndex, template } = resolveLiveCycleTemplate(date, state);
      result[date] = {
        cycleDayIndex,
        carbType: template.carbType,
        workout: template.workout,
        label: template.label,
        isDelayed: state.delayedDates.includes(date),
      };
    }
    date = addDays(date, 1);
  }
  return result;
}

/** Snapshot cycle assignments for dates before `today` so resets only affect today+. */
export function snapshotHistoryThroughYesterday(
  state: AppState,
  today: string
): AppState['historicalDays'] {
  const result = { ...state.historicalDays };
  const yesterday = subtractDays(today, 1);
  const rangeStart = state.cycleStartDate || state.anchorDate;

  if (yesterday < rangeStart) return result;

  let date = rangeStart;
  while (date <= yesterday) {
    if (!result[date]) {
      const { cycleDayIndex, template } = resolveLiveCycleTemplate(date, state);
      result[date] = {
        cycleDayIndex,
        carbType: template.carbType,
        workout: template.workout,
        label: template.label,
        isDelayed: state.delayedDates.includes(date),
      };
    }
    date = addDays(date, 1);
  }

  return result;
}

export function resetCycleState(
  state: AppState,
  today: string,
  cycleDayIndex: number
): AppState {
  const len = getCycleLength(state.cycleDays);
  const idx = ((cycleDayIndex % len) + len) % len;

  return {
    ...state,
    historicalDays: snapshotHistoryThroughYesterday(state, today),
    anchorDate: anchorDateForCycleDay(today, idx),
    delayedDates: [],
  };
}

export function getDefaultState(): AppState {
  return {
    anchorDate: todayISO(),
    cycleStartDate: '',
    delayedDates: [],
    historicalDays: {},
    intakeLow: { ...DEFAULT_MEAL_LOW },
    intakeHigh: { ...DEFAULT_MEAL_HIGH },
    cycleDays: DEFAULT_CYCLE_DAYS.map((d) => ({ ...d })),
    weightLog: {},
    trainingLog: {},
    profile: { name: '', age: '', height: '' },
  };
}

function mergeProfile(
  partial: Partial<UserProfile> | undefined,
  defaults: UserProfile
): UserProfile {
  return {
    name: partial?.name ?? defaults.name,
    age: partial?.age ?? defaults.age,
    height: partial?.height ?? defaults.height,
  };
}

export function mergeState(partial: Partial<AppState>): AppState {
  const defaults = getDefaultState();
  const cycleDays = normalizeCycleDays(partial.cycleDays ?? defaults.cycleDays);
  return {
    ...defaults,
    ...partial,
    intakeLow: migrateMealPlan(partial.intakeLow, defaults.intakeLow),
    intakeHigh: migrateMealPlan(partial.intakeHigh, defaults.intakeHigh),
    cycleDays,
    delayedDates: partial.delayedDates ?? defaults.delayedDates,
    cycleStartDate: partial.cycleStartDate ?? defaults.cycleStartDate,
    historicalDays: partial.historicalDays ?? defaults.historicalDays,
    weightLog: partial.weightLog ?? defaults.weightLog,
    trainingLog: normalizeTrainingLog(partial.trainingLog),
    profile: mergeProfile(partial.profile, defaults.profile),
  };
}

function normalizeCycleDays(days: CycleDayTemplate[]): CycleDayTemplate[] {
  if (!days.length) {
    return DEFAULT_CYCLE_DAYS.map((d) => ({ ...d }));
  }
  return days.map((d, i) => ({
    ...d,
    dayIndex: i,
    label: d.label?.trim() ? d.label : `Day ${i + 1}`,
  }));
}
