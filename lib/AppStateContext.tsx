'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { AppState } from './types';
import { getDefaultState, mergeState, todayISO, anchorDateForCycleDay } from './cycle';
import { useAuth } from './auth-context';
import { loadUserState, saveUserState } from './cloud-store';
import { formatCloudError } from './cloud-errors';

const STORAGE_KEY = 'fitness-pilot-state';

function loadFromStorage(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return mergeState(JSON.parse(raw));
  } catch {
    return getDefaultState();
  }
}

function saveToStorage(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

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

  useEffect(() => {
    if (!authReady) return;

    if (!isConfigured) {
      setState(loadFromStorage());
      setHydrated(true);
      return;
    }

    if (!userId) {
      setHydrated(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const cloud = await loadUserState(userId);
        if (cancelled) return;

        if (cloud) {
          setState(cloud);
          saveToStorage(cloud);
        } else {
          const local = loadFromStorage();
          setState(local);
          await saveUserState(userId, local);
        }
      } catch {
        if (!cancelled) {
          setState(loadFromStorage());
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
  }, [authReady, isConfigured, userId]);

  useEffect(() => {
    if (!hydrated) return;

    saveToStorage(state);
    setLastSavedAt(new Date());

    if (!isConfigured || !userId) return;

    if (skipCloudSave.current) {
      skipCloudSave.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setCloudSyncing(true);
      setCloudSaveError(null);
      try {
        await saveUserState(userId, state);
        setLastSavedAt(new Date());
      } catch (err) {
        setCloudSaveError(formatCloudError(err));
      } finally {
        setCloudSyncing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [state, hydrated, isConfigured, userId]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const resetCycle = useCallback((cycleDayIndex: number) => {
    const today = todayISO();
    const idx = ((cycleDayIndex % 4) + 4) % 4;
    setState((prev) => ({
      ...prev,
      anchorDate: anchorDateForCycleDay(today, idx),
      delayedDates: [],
    }));
  }, []);

  const delayToday = useCallback(() => {
    const today = todayISO();
    setState((prev) => {
      if (prev.delayedDates.includes(today)) return prev;
      return { ...prev, delayedDates: [...prev.delayedDates, today] };
    });
  }, []);

  const undoDelayToday = useCallback(() => {
    const today = todayISO();
    setState((prev) => ({
      ...prev,
      delayedDates: prev.delayedDates.filter((d) => d !== today),
    }));
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
