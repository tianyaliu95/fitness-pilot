'use client';

import { useMemo } from 'react';
import { Calendar } from '@/components/Calendar';
import { CycleControls } from '@/components/CycleControls';
import { TodayBanner } from '@/components/TodayBanner';
import { buildDayInfo } from '@/lib/day-info';
import { todayISO } from '@/lib/cycle';
import { getLatestWeight } from '@/lib/weight';
import { useAppState } from '@/lib/storage';
import { useLocale, useT } from '@/lib/i18n';

export function HomeClient() {
  const t = useT();
  const { locale } = useLocale();
  const { state, resetCycle, delayToday, undoDelayToday } = useAppState();
  const low = state.cycleDays.filter((d) => d.carbType === 'low').length;
  const high = state.cycleDays.length - low;
  const cycleSummary = t('cycle.summary', {
    days: state.cycleDays.length,
    low,
    high,
  });

  const today = buildDayInfo(todayISO(), state);
  const isTodayDelayed = state.delayedDates.includes(todayISO());

  const weightKg = useMemo(() => {
    const todayW = today.weight ? parseFloat(today.weight) : NaN;
    if (!Number.isNaN(todayW) && todayW > 0) return todayW;
    return getLatestWeight(state.weightLog);
  }, [today.weight, state.weightLog]);

  return (
    <div className="space-y-5">
      <header className="md:hidden">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Fitness Pilot</h1>
        {locale === 'en' ? (
          <p className="mt-1 text-sm text-ink-muted">
            {t('brand.tagline')}
            <br />
            {cycleSummary}
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">
            {t('brand.tagline')} · {cycleSummary}
          </p>
        )}
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
