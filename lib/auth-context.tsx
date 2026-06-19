'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { formatAuthError } from './auth-errors';
import { getFirebaseAuth, isCloudConfigured } from './firebase';

interface AuthContextValue {
  isConfigured: boolean;
  authReady: boolean;
  user: User | null;
  authError: string | null;
  clearAuthError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isCloudConfigured();
  const [authReady, setAuthReady] = useState(!isConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) return;

    const auth = getFirebaseAuth();

    getRedirectResult(auth).catch((err) => {
      setAuthError(formatAuthError(err));
    });

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) setAuthError(null);
    });

    return unsub;
  }, [isConfigured]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = googleProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err instanceof FirebaseError) {
        const useRedirect =
          err.code === 'auth/popup-blocked' ||
          err.code === 'auth/popup-closed-by-user' ||
          err.code === 'auth/cancelled-popup-request';

        if (useRedirect) {
          await signInWithRedirect(auth, provider);
          return;
        }
      }
      throw err;
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isConfigured,
        authReady,
        user,
        authError,
        clearAuthError,
        signIn,
        signUp,
        signInWithGoogle,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
