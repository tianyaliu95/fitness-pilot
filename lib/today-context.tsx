'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { localTodayISO, msUntilNextLocalMidnight } from './local-date';

const TodayContext = createContext(localTodayISO());

/**
 * Subscribes to local-timezone calendar day changes (midnight + tab refocus).
 * Call in a layout shell so the tree re-renders when the date rolls over.
 */
export function useTodayISO(): string {
  return useContext(TodayContext);
}

export function TodayProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => localTodayISO());

  const syncToday = useCallback(() => {
    const next = localTodayISO();
    setToday((prev) => (prev !== next ? next : prev));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleNextMidnight() {
      timer = setTimeout(() => {
        syncToday();
        scheduleNextMidnight();
      }, msUntilNextLocalMidnight());
    }

    syncToday();
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
