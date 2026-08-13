import type { AppState, DayInfo } from './types';
import {
  diffDays,
  formatDateISO,
  getCarbLabel,
  getCycleLength,
  isOnOrAfterCycleStart,
  parseDateISO,
  resolveLiveCycleTemplate,
  todayISO,
} from './cycle';
import { isCompletedNo, isCompletedYes, isRecordedEntry } from './training-log';

/** Shown in place of the scheduled workout when a day is delayed. */
export const DELAYED_WORKOUT_LABEL = '暂停';

export function buildDayInfo(date: string, state: AppState): DayInfo {
  const cycleLength = getCycleLength(state.cycleDays);
  const weight = state.weightLog[date] ?? null;
  const isCycleActive = isOnOrAfterCycleStart(date, state.cycleStartDate);
  const trainingEntry = state.trainingLog[date];
  const trainingIncomplete =
    isCycleActive &&
    isRecordedEntry(trainingEntry) &&
    isCompletedNo(trainingEntry);
  const trainingComplete =
    isCycleActive &&
    isRecordedEntry(trainingEntry) &&
    isCompletedYes(trainingEntry);

  const snapshot = state.historicalDays[date];
  if (snapshot) {
    const intake =
      snapshot.carbType === 'low' ? state.intakeLow : state.intakeHigh;
    const isDelayed = snapshot.isDelayed;
    const scheduledWorkout = snapshot.workout;
    return {
      date,
      cycleDayIndex: snapshot.cycleDayIndex,
      cycleLength,
      carbType: snapshot.carbType,
      workout: isDelayed ? DELAYED_WORKOUT_LABEL : scheduledWorkout,
      scheduledWorkout,
      label: snapshot.label,
      intake,
      weight,
      isToday: date === todayISO(),
      isDelayed,
      isCycleActive,
      trainingIncomplete,
      trainingComplete,
    };
  }

  const { cycleDayIndex, template } = resolveLiveCycleTemplate(date, state);
  const intake =
    template.carbType === 'low' ? state.intakeLow : state.intakeHigh;
  const isDelayed = state.delayedDates.includes(date);
  const scheduledWorkout = template.workout;

  return {
    date,
    cycleDayIndex,
    cycleLength,
    carbType: template.carbType,
    workout: isDelayed ? DELAYED_WORKOUT_LABEL : scheduledWorkout,
    scheduledWorkout,
    label: template.label,
    intake,
    weight,
    isToday: date === todayISO(),
    isDelayed,
    isCycleActive,
    trainingIncomplete,
    trainingComplete,
  };
}

export function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function getCalendarGrid(year: number, month: number): (Date | null)[] {
  const days = getMonthDays(year, month);
  const startPad = days[0].getDay();
  const grid: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) grid.push(null);
  for (const d of days) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);

  return grid;
}

export function formatMonthYear(
  year: number,
  month: number,
  locale = 'zh-CN'
): string {
  return new Date(year, month, 1).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  });
}

export function formatDisplayDate(iso: string, locale = 'zh-CN'): string {
  const d = parseDateISO(iso);
  return d.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/** Shorter EN dates (Thu, Aug 13) — leave zh on long form via formatDisplayDate. */
export function formatDisplayDateShort(iso: string, locale = 'en-US'): string {
  const d = parseDateISO(iso);
  return d.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function getWeekdayLabels(labels?: string[]): string[] {
  return labels ?? ['日', '一', '二', '三', '四', '五', '六'];
}

export function getCycleProgressLabel(dayIndex: number, cycleLength: number): string {
  return `Day ${dayIndex + 1} of ${cycleLength}`;
}

export function getCarbShort(type: 'low' | 'high'): string {
  return getCarbLabel(type);
}

export { formatDateISO, diffDays };
