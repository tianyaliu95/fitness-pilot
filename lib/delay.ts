import type { AppState } from './types';

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
          completed: false,
          notes: state.trainingLog[date]?.notes ?? '',
        },
      },
    };
  }

  const nextLog = { ...state.trainingLog };
  const entry = state.trainingLog[date];
  if (entry && !entry.completed && !entry.notes.trim()) {
    delete nextLog[date];
  }

  return {
    ...state,
    delayedDates: state.delayedDates.filter((d) => d !== date),
    trainingLog: nextLog,
  };
}
