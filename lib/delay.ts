import type { AppState } from './types';
import { freezeCycleHistoryBefore } from './cycle';
import { isCompletedNo, parseTrainingStatus } from './training-log';

export function setDateDelayed(
  state: AppState,
  date: string,
  delayed: boolean
): AppState {
  const historicalDays = freezeCycleHistoryBefore(state, date);
  const base = { ...state, historicalDays };

  if (delayed) {
    const delayedDates = base.delayedDates.includes(date)
      ? base.delayedDates
      : [...base.delayedDates, date];
    const existing = base.trainingLog[date];
    const notes = existing?.notes ?? '';
    const completed =
      existing?.completed === 'yes' || existing?.completed === 'no'
        ? existing.completed
        : 'no';
    return {
      ...base,
      delayedDates,
      trainingLog: {
        ...base.trainingLog,
        [date]: { completed, notes },
      },
    };
  }

  const nextLog = { ...base.trainingLog };
  const entry = base.trainingLog[date];
  if (
    entry &&
    parseTrainingStatus(entry.completed) === 'unknown' &&
    !entry.notes.trim()
  ) {
    delete nextLog[date];
  } else if (entry && isCompletedNo(entry) && !entry.notes.trim()) {
    delete nextLog[date];
  }

  return {
    ...base,
    delayedDates: base.delayedDates.filter((d) => d !== date),
    trainingLog: nextLog,
  };
}
