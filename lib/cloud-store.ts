import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppState } from './types';
import { mergeState } from './cycle';
import { getFirebaseDb } from './firebase';
import { userDocId, type UserIdentity } from './user-key';

const STATE_DOC = 'state';

function sanitizePayload(payload: unknown): AppState | null {
  if (typeof payload !== 'object' || payload === null) return null;
  return mergeState(payload as Partial<AppState>);
}

function userStateRef(docId: string) {
  return doc(getFirebaseDb(), 'users', docId, 'data', STATE_DOC);
}

export async function loadUserState(user: UserIdentity): Promise<AppState | null> {
  const docId = userDocId(user);
  const primary = await getDoc(userStateRef(docId));
  if (primary.exists()) {
    return sanitizePayload(primary.data()?.payload);
  }

  // Migrate data saved under auth uid before email-based paths
  if (user.email && docId !== user.uid) {
    const legacy = await getDoc(userStateRef(user.uid));
    if (legacy.exists()) {
      const state = sanitizePayload(legacy.data()?.payload);
      if (state) {
        await saveUserState(user, state);
      }
      return state;
    }
  }

  return null;
}

export async function saveUserState(user: UserIdentity, state: AppState): Promise<void> {
  const docId = userDocId(user);
  await setDoc(
    userStateRef(docId),
    {
      payload: state,
      email: user.email,
      authUid: user.uid,
      updatedAt: serverTimestamp(),
      schemaVersion: 1,
    },
    { merge: true }
  );
}
