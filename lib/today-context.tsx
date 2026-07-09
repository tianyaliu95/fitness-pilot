'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { msUntilNextPacificMidnight, pacificTodayISO } from './pacific-date';

const TodayContext = createContext(pacificTodayISO());

/**
 * Subscribes to Pacific calendar day changes (midnight PT + tab refocus).
 * Call in a layout shell so the tree re-renders when the date rolls over.
 */
export function useTodayISO(): string {
  return useContext(TodayContext);
}

export function TodayProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => pacificTodayISO());

  const syncToday = useCallback(() => {
    const next = pacificTodayISO();
    setToday((prev) => (prev !== next ? next : prev));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleNextMidnight() {
      timer = setTimeout(() => {
        syncToday();
        scheduleNextMidnight();
      }, msUntilNextPacificMidnight());
    }

    scheduleNextMidnight();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncToday();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncToday]);

  return <TodayContext.Provider value={today}>{children}</TodayContext.Provider>;
}
