'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Calendar } from '@/components/Calendar';
import { CycleControls } from '@/components/CycleControls';
import { TodayBanner } from '@/components/TodayBanner';
import { buildDayInfo } from '@/lib/day-info';
import { getLatestWeight } from '@/lib/weight';
import { useAppState } from '@/lib/storage';
import { useLocale, useT } from '@/lib/i18n';
import { useTodayISO } from '@/lib/today-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function HomeClient() {
  const t = useT();
  const { locale } = useLocale();
  const todayIso = useTodayISO();
  const { state, resetCycle, delayToday, undoDelayToday } = useAppState();
  const low = state.cycleDays.filter((d) => d.carbType === 'low').length;
  const high = state.cycleDays.length - low;
  const cycleSummary = t('cycle.summary', {
    days: state.cycleDays.length,
    low,
    high,
  });

  const today = buildDayInfo(todayIso, state);
  const isTodayDelayed = state.delayedDates.includes(todayIso);

  const weightKg = useMemo(() => {
    const todayW = today.weight ? parseFloat(today.weight) : NaN;
    if (!Number.isNaN(todayW) && todayW > 0) return todayW;
    return getLatestWeight(state.weightLog);
  }, [today.weight, state.weightLog]);

  return (
    <div className="space-y-5 pb-14 sm:pb-12">
      <header className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 font-display text-3xl font-bold tracking-tight text-ink">
            Fitness Pilot
          </h1>
          <LanguageSwitcher compact />
        </div>
        {locale === 'en' ? (
          <p className="mt-2.5 text-sm text-ink-muted">
            {t('brand.tagline')}
            <br />
            {cycleSummary}
          </p>
        ) : (
          <p className="mt-2.5 text-sm text-ink-muted">
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
      <p className="pt-10 text-center text-xs text-ink-faint sm:pt-12">
        <Link href="/about" className="underline-offset-2 hover:text-ink-muted hover:underline">
          {t('nav.about')} · Fitness Pilot
        </Link>
      </p>
    </div>
  );
}
