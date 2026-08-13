'use client';

import type { DayInfo } from '@/lib/types';
import { getCycleProgressLabel } from '@/lib/day-info';
import { MEAL_FIELDS, MACRO_FIELDS } from '@/lib/intake';
import { macroPerKgLabel } from '@/lib/macros';
import { formatDisplayDate } from '@/lib/day-info';

interface TodayBannerProps {
  day: DayInfo;
  weightKg: number | null;
}

function MacroHighlight({
  label,
  grams,
  perKg,
}: {
  label: string;
  grams: string;
  perKg: string | null;
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
        <p className="mt-2 text-xs font-medium text-white/80">记录体重后显示 g/kg</p>
      )}
    </div>
  );
}

export function TodayBanner({ day, weightKg }: TodayBannerProps) {
  const isLow = day.carbType === 'low';
  const intake = day.intake;

  const meals = MEAL_FIELDS.filter(({ key }) => intake[key].trim().length > 0);

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
        {/* Mobile: two-row header */}
        <div className="sm:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                {day.isDelayed ? '暂停' : isLow ? '低碳日' : '高碳日'}
              </span>
              {!day.isDelayed && (
                <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold text-white">
                  {getCycleProgressLabel(day.cycleDayIndex, day.cycleLength)}
                </span>
              )}
            </div>
            <p className="shrink-0 pt-0.5 text-right text-base font-bold leading-snug text-white/85">
              {formatDisplayDate(day.date)}
            </p>
          </div>
          <p className="mt-2 text-base font-bold text-white">
            {day.isDelayed
              ? `原计划 ${day.scheduledWorkout} · 已顺延到明天`
              : day.workout}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {day.isDelayed ? '暂停' : isLow ? '低碳日' : '高碳日'}
            </span>
            {!day.isDelayed && (
              <span className="rounded-full bg-white/25 px-4 py-1 text-2xl font-extrabold text-white">
                {getCycleProgressLabel(day.cycleDayIndex, day.cycleLength)}
              </span>
            )}
            <span className="ml-auto text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {formatDisplayDate(day.date)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {day.isDelayed
              ? `原计划 ${day.scheduledWorkout} · 已顺延到明天`
              : day.workout}
          </p>
        </div>

        <div className="border-t border-white/30 pt-4 sm:pt-5">
          <div className="overflow-hidden rounded-2xl bg-white/15 px-3 py-1 sm:px-4">
            {meals.map(({ key, label }, i) => (
              <div
                key={key}
                className={`flex gap-2 py-2.5 text-base sm:gap-3 sm:py-3 sm:text-lg ${
                  i > 0 ? 'border-t border-white/20' : ''
                }`}
              >
                <span className="w-16 shrink-0 font-bold text-white sm:w-28">{label}</span>
                <span className="font-semibold leading-snug text-white">{intake[key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/30 pt-4 sm:pt-5">
          <div className="flex gap-2 sm:gap-3">
            {MACRO_FIELDS.map(({ key, label }) => (
              <MacroHighlight
                key={key}
                label={label}
                grams={intake[key]}
                perKg={macroPerKgLabel(intake[key], weightKg)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
