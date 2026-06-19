import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppState } from './types';
import { mergeState } from './cycle';
import { getFirebaseDb } from './firebase';

const STATE_DOC = 'state';

function sanitizePayload(payload: unknown): AppState | null {
  if (typeof payload !== 'object' || payload === null) return null;
  return mergeState(payload as Partial<AppState>);
}

function userStateRef(uid: string) {
  return doc(getFirebaseDb(), 'users', uid, 'data', STATE_DOC);
}

export async function loadUserState(uid: string): Promise<AppState | null> {
  const snap = await getDoc(userStateRef(uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  const payload = data?.payload;
  return sanitizePayload(payload);
}

export async function saveUserState(uid: string, state: AppState): Promise<void> {
  await setDoc(
    userStateRef(uid),
    {
      payload: state,
      updatedAt: serverTimestamp(),
      schemaVersion: 1,
    },
    { merge: true }
  );
}
