import type { AppState, DayInfo } from './types';
import {
  CYCLE_LENGTH,
  diffDays,
  formatDateISO,
  getCarbLabel,
  getCycleDayIndex,
  parseDateISO,
  todayISO,
} from './cycle';

export function buildDayInfo(date: string, state: AppState): DayInfo {
  const cycleDayIndex = getCycleDayIndex(state.anchorDate, date, state.delayedDates);
  const template = state.cycleDays[cycleDayIndex] ?? state.cycleDays[0];
  const intake =
    template.carbType === 'low' ? state.intakeLow : state.intakeHigh;

  const weight = state.weightLog[date] ?? null;

  return {
    date,
    cycleDayIndex,
    carbType: template.carbType,
    workout: template.workout,
    label: template.label,
    intake,
    weight,
    isToday: date === todayISO(),
    isDelayed: state.delayedDates.includes(date),
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

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  });
}

export function formatDisplayDate(iso: string): string {
  const d = parseDateISO(iso);
  return d.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export function getWeekdayLabels(): string[] {
  return ['日', '一', '二', '三', '四', '五', '六'];
}

export function getCycleProgressLabel(dayIndex: number): string {
  return `Day ${dayIndex + 1} of ${CYCLE_LENGTH}`;
}

export function getCarbShort(type: 'low' | 'high'): string {
  return getCarbLabel(type);
}

export { formatDateISO, diffDays };
