'use client';

import { useMemo } from 'react';
import { Calendar } from '@/components/Calendar';
import { CycleControls } from '@/components/CycleControls';
import { TodayBanner } from '@/components/TodayBanner';
import { buildDayInfo } from '@/lib/day-info';
import { todayISO } from '@/lib/cycle';
import { getLatestWeight } from '@/lib/weight';
import { getCycleSummary } from '@/lib/cycle';
import { useAppState } from '@/lib/storage';

export function HomeClient() {
  const { state, resetCycle, delayToday, undoDelayToday } = useAppState();
  const cycleSummary = getCycleSummary(state.cycleDays);

  const today = buildDayInfo(todayISO(), state);
  const isTodayDelayed = state.delayedDates.includes(todayISO());

  const weightKg = useMemo(() => {
    const todayW = today.weight ? parseFloat(today.weight) : NaN;
    if (!Number.isNaN(todayW) && todayW > 0) return todayW;
    return getLatestWeight(state.weightLog);
  }, [today.weight, state.weightLog]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="md:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Fitness Pilot</h1>
        <p className="mt-1 text-sm text-ink-muted">碳循环训练助手 · {cycleSummary}</p>
      </header>

      <TodayBanner day={today} weightKg={weightKg} />
      <CycleControls
        cycleDays={state.cycleDays}
        onReset={resetCycle}
        onDelay={delayToday}
        onUndoDelay={undoDelayToday}
        isTodayDelayed={isTodayDelayed}
      />
      <Calendar state={state} />
    </div>
  );
}
