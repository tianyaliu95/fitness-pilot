import type { AppState, MealPlan, TrainingLog } from './types';
import { mergeState } from './cycle';

/** Heuristic: how much user data is in this state snapshot. */
export function scoreAppState(state: AppState): number {
  let score = 0;
  score += Object.keys(state.trainingLog).length * 10;
  score += Object.keys(state.weightLog).length * 5;
  score += Object.keys(state.historicalDays).length * 3;
  score += state.delayedDates.length;
  if (state.cycleStartDate) score += 2;
  if (state.profile.name.trim()) score += 3;
  if (state.profile.height.trim()) score += 2;
  score += mealPlanScore(state.intakeLow);
  score += mealPlanScore(state.intakeHigh);
  return score;
}

function mealPlanScore(plan: MealPlan): number {
  return Object.values(plan).filter((v) => v.trim().length > 0).length;
}

/** Training log is Firebase-only; never persist to localStorage. */
export function withoutTrainingLog(state: AppState): AppState {
  return { ...state, trainingLog: {} };
}

/** Score settings without training — used to guard accidental settings wipes. */
function scoreWithoutTraining(state: AppState): number {
  return scoreAppState(withoutTrainingLog(state));
}

/** Union logs from every snapshot; keep richest scalar fields. */
export function mergeAllAppStates(states: AppState[]): AppState {
  if (!states.length) return mergeState({});

  const richest = states.reduce((best, cur) =>
    scoreAppState(cur) > scoreAppState(best) ? cur : best
  );

  let trainingLog: TrainingLog = {};
  let weightLog = {};
  let historicalDays = {};

  for (const s of states) {
    trainingLog = { ...trainingLog, ...s.trainingLog };
    weightLog = { ...weightLog, ...s.weightLog };
    historicalDays = { ...historicalDays, ...s.historicalDays };
  }

  const delayedDates = [...new Set(states.flatMap((s) => s.delayedDates))].sort();

  return mergeState({
    ...richest,
    trainingLog,
    weightLog,
    historicalDays,
    delayedDates,
    intakeLow: states.reduce(
      (best, s) => (mealPlanScore(s.intakeLow) > mealPlanScore(best) ? s.intakeLow : best),
      richest.intakeLow
    ),
    intakeHigh: states.reduce(
      (best, s) => (mealPlanScore(s.intakeHigh) > mealPlanScore(best) ? s.intakeHigh : best),
      richest.intakeHigh
    ),
  });
}

export interface StoredSnapshot {
  state: AppState;
  savedAt: number;
}

export interface CloudSnapshot {
  state: AppState;
  updatedAt: number;
}

/**
 * Hydrate app state: settings from local cache, trainingLog ONLY from Firebase.
 */
export function resolveHydratedState(
  localSettings: AppState | null,
  cloudState: AppState | null
): AppState {
  const base = mergeState(localSettings ?? {});

  if (!cloudState) {
    return { ...base, trainingLog: {} };
  }

  return mergeState({
    ...base,
    ...cloudState,
    trainingLog: cloudState.trainingLog,
  });
}

/** Guard settings-only downgrades (training changes are always allowed). */
export function wouldLoseData(current: AppState, next: AppState): boolean {
  return scoreWithoutTraining(next) < scoreWithoutTraining(current) - 1;
}
