import type { AppState } from './types';
import { isCompletedNo, parseTrainingStatus } from './training-log';

export function setDateDelayed(
  state: AppState,
  date: string,
  delayed: boolean
): AppState {
  if (delayed) {
    const delayedDates = state.delayedDates.includes(date)
      ? state.delayedDates
      : [...state.delayedDates, date];
    return {
      ...state,
      delayedDates,
      trainingLog: {
        ...state.trainingLog,
        [date]: {
          completed: 'no',
          notes: state.trainingLog[date]?.notes ?? '',
        },
      },
    };
  }

  const nextLog = { ...state.trainingLog };
  const entry = state.trainingLog[date];
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
    ...state,
    delayedDates: state.delayedDates.filter((d) => d !== date),
    trainingLog: nextLog,
  };
}
