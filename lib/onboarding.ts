import type { AppState } from './types';

/** First-run: no cycle start yet, and no real history to preserve. */
export function needsOnboarding(state: AppState): boolean {
  if (state.cycleStartDate.trim()) return false;
  if (Object.keys(state.trainingLog).length > 0) return false;
  if (Object.keys(state.weightLog).length > 0) return false;
  if (Object.keys(state.historicalDays).length > 0) return false;
  return true;
}

export function applyOnboarding(
  state: AppState,
  startDate: string,
  dayOneWorkout: string
): AppState {
  const workout = dayOneWorkout.trim();
  return {
    ...state,
    cycleStartDate: startDate,
    anchorDate: startDate,
    cycleDays: state.cycleDays.map((day, i) =>
      i === 0 ? { ...day, workout: workout || day.workout } : day
    ),
  };
}
