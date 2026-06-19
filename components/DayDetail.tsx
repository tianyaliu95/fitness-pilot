'use client';

import Link from 'next/link';
import type { DayInfo } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { MACRO_FIELDS, MEAL_FIELDS } from '@/lib/intake';
import { macroPerKgLabel } from '@/lib/macros';

interface DayDetailProps {
  day: DayInfo;
}

export function DayDetail({ day }: DayDetailProps) {
  const isLow = day.carbType === 'low';
  const weightKg = day.weight ? parseFloat(day.weight) : null;
  const validWeight = weightKg && !Number.isNaN(weightKg) && weightKg > 0 ? weightKg : null;

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回日历
      </Link>

      <div
        className={`
          relative overflow-hidden rounded-3xl p-6 shadow-card
          ${isLow
            ? 'bg-gradient-to-br from-low to-low-dark'
            : 'bg-gradient-to-br from-high to-high-dark'
          }
        `}
      >
        <p className="text-sm font-medium text-white/80">{formatDisplayDate(day.date)}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {isLow ? '低碳日' : '高碳日'}
        </h1>
        <p className="mt-1 text-lg text-white/90">{day.label} · {day.workout}</p>
        {day.weight && (
          <p className="mt-2 text-sm text-white/80">体重 {day.weight} kg</p>
        )}
        {day.isDelayed && (
          <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm text-white">
            已暂停
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-surface-card p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold text-ink">今日饮食计划</h2>
        <div className="space-y-3">
          {MEAL_FIELDS.map(({ key, label }) => {
            const value = day.intake[key];
            if (!value.trim()) return null;
            return (
              <div key={key} className="rounded-2xl bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-ink-muted">{label}</p>
                <p className="mt-1 text-sm text-ink">{value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {MACRO_FIELDS.map(({ key, label }) => {
            const value = day.intake[key];
            const perKg = validWeight ? macroPerKgLabel(value, validWeight) : null;
            return (
              <div key={key} className="rounded-2xl bg-surface-muted p-3 text-center">
                <p className="text-[10px] text-ink-muted">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {value.trim() || '—'}
                </p>
                {perKg && (
                  <p className="mt-0.5 text-[10px] font-medium text-low-dark">{perKg}</p>
                )}
              </div>
            );
          })}
        </div>

        {day.intake.notes.trim() && (
          <div className="mt-4 rounded-2xl bg-surface-muted p-4">
            <p className="text-xs font-medium text-ink-muted">备注</p>
            <p className="mt-1 text-sm text-ink">{day.intake.notes}</p>
          </div>
        )}
      </div>

      {!day.weight && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          可在「个人信息」记录今日体重
        </p>
      )}
    </div>
  );
}
