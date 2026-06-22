import type { AppState, TrainingLog, WeightLog } from './types';
import { mergeState } from './cycle';

type RawMap = Record<string, unknown>;

function isRawMap(value: unknown): value is RawMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Firestore docs were sometimes saved with `{ merge: true }`, leaving a nested
 * `payload.state` that holds the real user data while outer payload fields are stale.
 */
export function extractStateFromFirestoreDoc(
  data: RawMap | undefined
): AppState | null {
  if (!data) return null;

  const payload = data.payload;
  if (!isRawMap(payload)) return null;

  const nested = payload.state;
  if (isRawMap(nested)) {
    const outerTraining = isRawMap(payload.trainingLog)
      ? (payload.trainingLog as TrainingLog)
      : {};
    const innerTraining = isRawMap(nested.trainingLog)
      ? (nested.trainingLog as TrainingLog)
      : {};
    const outerWeight = isRawMap(payload.weightLog)
      ? (payload.weightLog as WeightLog)
      : {};
    const innerWeight = isRawMap(nested.weightLog)
      ? (nested.weightLog as WeightLog)
      : {};

    const cycleStartDate =
      (typeof nested.cycleStartDate === 'string' && nested.cycleStartDate) ||
      (typeof payload.cycleStartDate === 'string' && payload.cycleStartDate) ||
      '';

    return mergeState({
      ...(nested as Partial<AppState>),
      cycleStartDate,
      // Flat payload is authoritative; nested state is legacy corruption.
      trainingLog: { ...innerTraining, ...outerTraining },
      weightLog: { ...innerWeight, ...outerWeight },
    });
  }

  return mergeState(payload as Partial<AppState>);
}

/** Strip nested corruption before writing a clean document. */
export function buildFirestoreDocPayload(
  state: AppState,
  meta: { email: string | null; authUid: string }
) {
  return {
    payload: state,
    email: meta.email,
    authUid: meta.authUid,
    updatedAt: null as unknown,
    schemaVersion: 1,
  };
}
