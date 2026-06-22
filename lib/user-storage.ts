import type { AppState } from './types';
import { getDefaultState, mergeState } from './cycle';
import {
  scoreAppState,
  withoutTrainingLog,
  wouldLoseData,
  type StoredSnapshot,
} from './state-sync';
import { userDocId, type UserIdentity } from './user-key';

const LEGACY_STORAGE_KEY = 'fitness-pilot-state';
const MIGRATED_LEGACY_KEY = 'fitness-pilot-legacy-migrated';
export const OFFLINE_UID = '__offline__';

export type { StoredSnapshot } from './state-sync';

export function storageKey(docId: string): string {
  return `fitness-pilot-state-${docId}`;
}

function backupKey(docId: string): string {
  return `fitness-pilot-backup-${docId}`;
}

function parseStored(raw: string): StoredSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'savedAt' in parsed &&
      typeof (parsed as StoredSnapshot).savedAt === 'number' &&
      'state' in parsed
    ) {
      const state = mergeState((parsed as StoredSnapshot).state as Partial<AppState>);
      return { state: withoutTrainingLog(state), savedAt: (parsed as StoredSnapshot).savedAt };
    }
    const state = mergeState(parsed as Partial<AppState>);
    return { state: withoutTrainingLog(state), savedAt: 0 };
  } catch {
    return null;
  }
}

export function loadFromStorage(docId: string): StoredSnapshot | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(storageKey(docId));
  if (!raw) return null;
  return parseStored(raw);
}

/** Local cache for settings only — trainingLog is never written here. */
export function saveToStorage(
  docId: string,
  state: AppState,
  options?: { includeTraining?: boolean }
): StoredSnapshot {
  const toSave = options?.includeTraining ? state : withoutTrainingLog(state);
  const existing = loadFromStorage(docId);

  if (existing && wouldLoseData(existing.state, toSave)) {
    return existing;
  }

  if (existing && scoreAppState(existing.state) > 0) {
    localStorage.setItem(backupKey(docId), JSON.stringify(existing));
  }

  const snapshot: StoredSnapshot = { state: toSave, savedAt: Date.now() };
  localStorage.setItem(storageKey(docId), JSON.stringify(snapshot));
  return snapshot;
}

export function findBestLocalSnapshot(user: UserIdentity): StoredSnapshot | null {
  if (typeof window === 'undefined') return null;
  const docId = userDocId(user);
  return loadFromStorage(docId);
}

export function loadLocalSettingsState(user: UserIdentity): AppState | null {
  return findBestLocalSnapshot(user)?.state ?? null;
}

export function tryMigrateLegacyStorage(docId: string): AppState | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(MIGRATED_LEGACY_KEY)) return null;

  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;

    const snapshot = parseStored(legacy);
    if (!snapshot) return null;

    saveToStorage(docId, snapshot.state);
    localStorage.setItem(MIGRATED_LEGACY_KEY, docId);
    return snapshot.state;
  } catch {
    return null;
  }
}

/** Offline-only bootstrap (no Firebase). */
export function resolveInitialState(user: UserIdentity): AppState {
  const scoped = loadFromStorage(userDocId(user));
  if (scoped) return scoped.state;
  return tryMigrateLegacyStorage(userDocId(user)) ?? getDefaultState();
}
