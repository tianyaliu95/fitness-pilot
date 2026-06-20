'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppState } from './types';
import {
  getDefaultState,
  resetCycleState,
  todayISO,
} from './cycle';
import { useAuth } from './auth-context';
import { loadUserState, saveUserState } from './cloud-store';
import { formatCloudError } from './cloud-errors';
import {
  OFFLINE_UID,
  resolveInitialState,
  saveToStorage,
} from './user-storage';
import { userDocId } from './user-key';
import { setDateDelayed } from './delay';

interface AppStateContextValue {
  state: AppState;
  hydrated: boolean;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  updateState: (updater: (prev: AppState) => AppState) => void;
  resetCycle: (cycleDayIndex: number) => void;
  delayToday: () => void;
  undoDelayToday: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { isConfigured, authReady, user } = useAuth();
  const [state, setState] = useState<AppState>(getDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const skipCloudSave = useRef(true);
  const userId = user?.uid ?? null;
  const userEmail = user?.email ?? null;
  const userIdentity = useMemo(
    () => (userId ? { uid: userId, email: userEmail } : null),
    [userId, userEmail]
  );
  const storageUid =
    userIdentity ? userDocId(userIdentity) : isConfigured ? null : OFFLINE_UID;

  useEffect(() => {
    if (!authReady) return;

    if (!isConfigured) {
      setState(resolveInitialState({ uid: OFFLINE_UID, email: null }));
      setHydrated(true);
      return;
    }

    if (!userIdentity) {
      setState(getDefaultState());
      setHydrated(false);
      setLastSavedAt(null);
      setCloudSaveError(null);
      return;
    }

    let cancelled = false;
    setHydrated(false);

    (async () => {
      try {
        const cloud = await loadUserState(userIdentity);
        if (cancelled) return;

        if (cloud) {
          setState(cloud);
          saveToStorage(userDocId(userIdentity), cloud);
        } else {
          const initial = resolveInitialState(userIdentity);
          setState(initial);
          saveToStorage(userDocId(userIdentity), initial);
          await saveUserState(userIdentity, initial);
        }
      } catch {
        if (!cancelled) {
          setState(resolveInitialState(userIdentity));
        }
      } finally {
        if (!cancelled) {
          skipCloudSave.current = true;
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, isConfigured, userIdentity]);

  useEffect(() => {
    if (!hydrated || !storageUid) return;

    saveToStorage(storageUid, state);
    setLastSavedAt(new Date());

    if (!isConfigured || !userIdentity) return;

    if (skipCloudSave.current) {
      skipCloudSave.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setCloudSyncing(true);
      setCloudSaveError(null);
      try {
        await saveUserState(userIdentity, state);
        setLastSavedAt(new Date());
      } catch (err) {
        setCloudSaveError(formatCloudError(err));
      } finally {
        setCloudSyncing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [state, hydrated, isConfigured, userIdentity, storageUid]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const resetCycle = useCallback((cycleDayIndex: number) => {
    const today = todayISO();
    setState((prev) => resetCycleState(prev, today, cycleDayIndex));
  }, []);

  const delayToday = useCallback(() => {
    const today = todayISO();
    setState((prev) => {
      if (prev.delayedDates.includes(today)) return prev;
      return setDateDelayed(prev, today, true);
    });
  }, []);

  const undoDelayToday = useCallback(() => {
    const today = todayISO();
    setState((prev) => {
      if (!prev.delayedDates.includes(today)) return prev;
      return setDateDelayed(prev, today, false);
    });
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        state,
        hydrated,
        cloudSyncing,
        lastSavedAt,
        cloudSaveError,
        updateState,
        resetCycle,
        delayToday,
        undoDelayToday,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
