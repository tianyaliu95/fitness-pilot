import type { AppState } from './types';
import { getDefaultState, mergeState } from './cycle';
import { userDocId, type UserIdentity } from './user-key';

const LEGACY_STORAGE_KEY = 'fitness-pilot-state';
const MIGRATED_LEGACY_KEY = 'fitness-pilot-legacy-migrated';
export const OFFLINE_UID = '__offline__';

export function storageKey(docId: string): string {
  return `fitness-pilot-state-${docId}`;
}

export function loadFromStorage(docId: string): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(docId));
    if (!raw) return null;
    return mergeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveToStorage(docId: string, state: AppState): void {
  localStorage.setItem(storageKey(docId), JSON.stringify(state));
}

/** One-time migration: legacy global key → first logged-in user without cloud data */
export function tryMigrateLegacyStorage(docId: string): AppState | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(MIGRATED_LEGACY_KEY)) return null;

  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;

    const state = mergeState(JSON.parse(legacy));
    saveToStorage(docId, state);
    localStorage.setItem(MIGRATED_LEGACY_KEY, docId);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return state;
  } catch {
    return null;
  }
}

export function resolveInitialState(user: UserIdentity): AppState {
  const docId = userDocId(user);
  const scoped = loadFromStorage(docId);
  if (scoped) return scoped;

  if (user.email && docId !== user.uid) {
    const fromUid = loadFromStorage(user.uid);
    if (fromUid) {
      saveToStorage(docId, fromUid);
      return fromUid;
    }
  }

  return tryMigrateLegacyStorage(docId) ?? getDefaultState();
}
