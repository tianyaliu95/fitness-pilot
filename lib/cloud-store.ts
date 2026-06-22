import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import type { AppState } from './types';
import { getFirebaseDb } from './firebase';
import { extractStateFromFirestoreDoc } from './firestore-payload';
import { mergeAllAppStates, wouldLoseData, type CloudSnapshot } from './state-sync';
import { userDocId, type UserIdentity } from './user-key';

export type { CloudSnapshot };

const STATE_DOC = 'state';

export interface SaveUserStateOptions {
  /** Skip settings downgrade guard (training day saves). */
  force?: boolean;
  /** Use trainingLog from `state` as-is (e.g. reset/delete a day). Default: merge with existing. */
  replaceTraining?: boolean;
}

function timestampToMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    return (value as Timestamp).toMillis();
  }
  return 0;
}

function userStateRef(docId: string) {
  return doc(getFirebaseDb(), 'users', docId, 'data', STATE_DOC);
}

async function readCloudDoc(docId: string): Promise<CloudSnapshot | null> {
  const snap = await getDoc(userStateRef(docId));
  if (!snap.exists()) return null;
  const state = extractStateFromFirestoreDoc(snap.data());
  if (!state) return null;
  return { state, updatedAt: timestampToMs(snap.data()?.updatedAt) };
}

export async function loadAllCloudSnapshots(user: UserIdentity): Promise<CloudSnapshot[]> {
  const snap = await readCloudDoc(userDocId(user));
  return snap ? [snap] : [];
}

export async function loadAllCloudStates(user: UserIdentity): Promise<AppState[]> {
  const snaps = await loadAllCloudSnapshots(user);
  return snaps.map((s) => s.state);
}

export async function loadUserState(user: UserIdentity): Promise<CloudSnapshot | null> {
  const all = await loadAllCloudSnapshots(user);
  if (!all.length) return null;

  return {
    state: mergeAllAppStates(all.map((s) => s.state)),
    updatedAt: Math.max(...all.map((s) => s.updatedAt)),
  };
}

export async function saveUserState(
  user: UserIdentity,
  state: AppState,
  options?: SaveUserStateOptions
): Promise<boolean> {
  const docId = userDocId(user);
  const existing = await readCloudDoc(docId);

  let toWrite = state;

  if (options?.replaceTraining) {
    toWrite = {
      ...state,
      trainingLog: existing
        ? { ...existing.state.trainingLog, ...state.trainingLog }
        : state.trainingLog,
    };
  } else if (existing && !options?.replaceTraining) {
    toWrite = {
      ...state,
      trainingLog: { ...existing.state.trainingLog, ...state.trainingLog },
    };
  }

  if (
    existing &&
    Object.keys(existing.state.trainingLog).length > 0 &&
    Object.keys(toWrite.trainingLog).length === 0
  ) {
    toWrite = { ...toWrite, trainingLog: existing.state.trainingLog };
  }

  if (!options?.force && existing && wouldLoseData(existing.state, toWrite)) {
    return false;
  }

  await setDoc(userStateRef(docId), {
    payload: toWrite,
    email: user.email,
    authUid: user.uid,
    updatedAt: serverTimestamp(),
    schemaVersion: 1,
  });

  return true;
}
