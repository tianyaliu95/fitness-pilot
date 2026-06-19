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
    <div className="flex-1 rounded-2xl bg-white/20 px-3 py-3.5 sm:px-4 sm:py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl">
        {hasGrams ? grams : '—'}
      </p>
      {perKg ? (
        <p className="mt-2 text-lg font-bold text-white drop-shadow-sm sm:text-xl">{perKg}</p>
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
        relative overflow-hidden rounded-3xl p-5 shadow-card sm:p-10
        ${isLow
          ? 'bg-gradient-to-br from-low to-low-dark'
          : 'bg-gradient-to-br from-high to-high-dark'
        }
      `}
    >
      {/* <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" /> */}
      {/* <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" /> */}

      <div className="relative space-y-5 sm:space-y-6">
        <div>
          {/* <p className="text-base font-bold text-white">今日安排</p> */}
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl">
              {isLow ? '低碳日' : '高碳日'}
            </span>
            <span className="rounded-full bg-white/25 px-4 py-1 text-2xl font-extrabold text-white">
              {getCycleProgressLabel(day.cycleDayIndex)}
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl text-right ml-auto">{formatDisplayDate(day.date)}</span>
          </div>
          <p className="mt-3 text-xl font-bold text-white sm:text-2xl">{day.workout}</p>
          {/* {day.weight && (
            <p className="mt-1.5 text-base font-semibold text-white">今日体重 {day.weight} kg</p>
          )} */}
          {day.isDelayed && (
            <p className="mt-2 text-sm font-semibold text-white/90">
              今日已标记暂停，明天继续当前循环日
            </p>
          )}
        </div>

        <div className="border-t border-white/30 pt-5">
          {/* <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            今日饮食
          </p> */}
          <div className="overflow-hidden rounded-2xl bg-white/15 px-3.5 py-1 sm:px-4">
            {meals.map(({ key, label }, i) => (
              <div
                key={key}
                className={`flex gap-3 py-3 text-lg ${
                  i > 0 ? 'border-t border-white/20' : ''
                }`}
              >
                <span className="w-24 shrink-0 font-bold text-white sm:w-28">{label}</span>
                <span className="font-semibold leading-snug text-white">{intake[key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/30 pt-5">
          {/* <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            摄入目标
          </p> */}
          <div className="flex gap-2.5 sm:gap-3">
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
