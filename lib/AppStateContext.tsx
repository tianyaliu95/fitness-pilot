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
import { loadAllCloudStates, saveUserState } from './cloud-store';
import { formatCloudError } from './cloud-errors';
import {
  OFFLINE_UID,
  loadLocalSettingsState,
  resolveInitialState,
  saveToStorage,
} from './user-storage';
import { userDocId } from './user-key';
import { mergeAllAppStates, resolveHydratedState } from './state-sync';
import {
  applyCanonicalFloor,
  isRestoreUser,
  trainingLogNeedsRepair,
} from './canonical-restore';
import { setDateDelayed } from './delay';

interface AppStateContextValue {
  state: AppState;
  hydrated: boolean;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  updateState: (updater: (prev: AppState) => AppState) => void;
  persistStateNow: (nextState?: AppState) => Promise<void>;
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
  const stateRef = useRef(state);
  stateRef.current = state;
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
        const docId = userDocId(userIdentity);
        const localSettings = loadLocalSettingsState(userIdentity);
        const cloudStates = await loadAllCloudStates(userIdentity);
        if (cancelled) return;

        const rawCloudState = cloudStates.length
          ? mergeAllAppStates(cloudStates)
          : null;

        const needsCloudRepair =
          isRestoreUser(userIdentity.email) &&
          (trainingLogNeedsRepair(rawCloudState) || !rawCloudState?.cycleStartDate);

        const cloudState =
          needsCloudRepair && isRestoreUser(userIdentity.email)
            ? applyCanonicalFloor(rawCloudState)
            : rawCloudState;

        const initial = resolveHydratedState(localSettings, cloudState);

        setState(initial);
        saveToStorage(docId, initial);
      } catch {
        if (!cancelled) {
          const localSettings = loadLocalSettingsState(userIdentity);
          const cloudState = isRestoreUser(userIdentity.email)
            ? applyCanonicalFloor(null)
            : null;
          setState(resolveHydratedState(localSettings, cloudState));
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
        const saved = await saveUserState(userIdentity, state);
        if (saved) {
          setLastSavedAt(new Date());
        }
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

  const persistStateNow = useCallback(
    async (nextState?: AppState) => {
      const snapshot = nextState ?? stateRef.current;
      if (!storageUid) return;

      saveToStorage(storageUid, snapshot);
      setLastSavedAt(new Date());

      if (!isConfigured || !userIdentity) return;

      setCloudSyncing(true);
      setCloudSaveError(null);
      try {
        const saved = await saveUserState(userIdentity, snapshot, {
          force: true,
          replaceTraining: true,
        });
        if (!saved) {
          setCloudSaveError('保存被跳过，请重试');
        } else {
          setLastSavedAt(new Date());
        }
      } catch (err) {
        setCloudSaveError(formatCloudError(err));
      } finally {
        setCloudSyncing(false);
      }
    },
    [isConfigured, storageUid, userIdentity]
  );

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
        persistStateNow,
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
