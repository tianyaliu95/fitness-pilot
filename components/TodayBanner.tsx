'use client';

import type { DayInfo } from '@/lib/types';
import { MEAL_FIELDS, MACRO_FIELDS } from '@/lib/intake';
import { macroPerKgLabel } from '@/lib/macros';
import { formatDisplayDate, formatDisplayDateShort } from '@/lib/day-info';
import { useLocale, useT } from '@/lib/i18n';

interface TodayBannerProps {
  day: DayInfo;
  weightKg: number | null;
}

function MacroHighlight({
  label,
  grams,
  perKg,
  afterWeightLabel,
}: {
  label: string;
  grams: string;
  perKg: string | null;
  afterWeightLabel: string;
}) {
  const hasGrams = grams.trim().length > 0;

  return (
    <div className="flex-1 rounded-2xl bg-white/20 px-2.5 py-3 sm:px-4 sm:py-4">
      <p className="text-xs font-bold tracking-wide text-white sm:text-sm">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold leading-tight text-white drop-shadow-sm sm:mt-1.5 sm:text-3xl">
        {hasGrams ? grams : '—'}
      </p>
      {perKg ? (
        <p className="mt-1 text-sm font-bold text-white drop-shadow-sm sm:mt-2 sm:text-xl">{perKg}</p>
      ) : (
        <p className="mt-2 text-xs font-medium text-white/80">{afterWeightLabel}</p>
      )}
    </div>
  );
}

export function TodayBanner({ day, weightKg }: TodayBannerProps) {
  const t = useT();
  const { locale, bcp47 } = useLocale();
  const isLow = day.carbType === 'low';
  const intake = day.intake;

  const meals = MEAL_FIELDS.filter(({ key }) => intake[key].trim().length > 0);
  const carbDayLabel = day.isDelayed
    ? t('cycle.paused')
    : isLow
      ? t('carb.lowDay')
      : t('carb.highDay');
  const progressLabel = t('cycle.dayOf', {
    current: day.cycleDayIndex + 1,
    total: day.cycleLength,
  });
  const deferredNote = t('cycle.deferredNote', { workout: day.scheduledWorkout });
  const mobileDate =
    locale === 'en'
      ? formatDisplayDateShort(day.date, bcp47)
      : formatDisplayDate(day.date, bcp47);
  const desktopDate = formatDisplayDate(day.date, bcp47);

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-5 shadow-card animate-enter sm:p-8
        ${day.isDelayed
          ? 'bg-gradient-to-br from-[#3d4454] to-[#1a1a2e]'
          : isLow
            ? 'bg-gradient-to-br from-low-dark to-[#2f5bb8]'
            : 'bg-gradient-to-br from-high-dark to-[#a84f0a]'
        }
      `}
    >
      <div className="relative space-y-4 sm:space-y-5">
        {/* Mobile: title + compact date on one row; progress on next */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 text-2xl font-extrabold tracking-tight text-white whitespace-nowrap">
              {carbDayLabel}
            </span>
            <p className="shrink-0 text-right text-sm font-bold leading-none text-white/85">
              {mobileDate}
            </p>
          </div>
          {!day.isDelayed && (
            <span className="mt-2 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold text-white">
              {progressLabel}
            </span>
          )}
          <p className="mt-2 text-base font-bold text-white">
            {day.isDelayed ? deferredNote : day.workout}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {carbDayLabel}
            </span>
            {!day.isDelayed && (
              <span className="rounded-full bg-white/25 px-4 py-1 text-2xl font-extrabold text-white">
                {progressLabel}
              </span>
            )}
            <span className="ml-auto text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {desktopDate}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {day.isDelayed ? deferredNote : day.workout}
          </p>
        </div>

        <div className="border-t border-white/30 pt-4 sm:pt-5">
          <div className="overflow-hidden rounded-2xl bg-white/15 px-3 py-1 sm:px-4">
            {meals.map(({ key, labelKey }, i) => (
              <div
                key={key}
                className={`grid items-center gap-x-2 py-2.5 text-base sm:gap-x-3 sm:py-3 sm:text-lg ${
                  locale === 'en'
                    ? 'grid-cols-[6.5rem_1fr] sm:grid-cols-[8rem_1fr] sm:gap-x-4'
                    : 'grid-cols-[4rem_1fr] sm:grid-cols-[5.5rem_1fr]'
                } ${i > 0 ? 'border-t border-white/20' : ''}`}
              >
                <span className="font-bold leading-snug text-white">{t(labelKey)}</span>
                <span className="min-w-0 font-semibold leading-snug text-white">
                  {intake[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/30 pt-4 sm:pt-5">
          <div className="flex gap-2 sm:gap-3">
            {MACRO_FIELDS.map(({ key, labelKey }) => (
              <MacroHighlight
                key={key}
                label={t(labelKey)}
                grams={intake[key]}
                perKg={macroPerKgLabel(intake[key], weightKg)}
                afterWeightLabel={t('macro.afterWeight')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
