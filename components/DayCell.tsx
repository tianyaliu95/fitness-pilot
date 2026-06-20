'use client';

import Link from 'next/link';
import type { DayInfo } from '@/lib/types';

interface DayCellProps {
  day: DayInfo;
  dayNumber: number;
}

export function DayCell({ day, dayNumber }: DayCellProps) {
  const isLow = day.carbType === 'low';

  const todayRing = day.isToday
    ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface shadow-card scale-[1.02]'
    : 'hover:shadow-soft hover:scale-[1.01]';

  if (!day.isCycleActive) {
    return (
      <Link
        href={`/day/${day.date}`}
        className={`
          group relative flex min-h-[72px] flex-col rounded-2xl border border-ink/5
          bg-surface p-2 transition-all duration-200 sm:min-h-[88px] sm:p-3
          ${todayRing}
        `}
      >
        <span
          className={`
            flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold
            sm:h-8 sm:w-8
            ${day.isToday ? 'bg-ink text-white' : 'bg-surface-muted text-ink-faint'}
          `}
        >
          {dayNumber}
        </span>
      </Link>
    );
  }

  const bgClass = day.trainingIncomplete
    ? 'bg-pink-200 border border-pink-200'
    : isLow
      ? 'bg-low-light'
      : 'bg-high-light';

  return (
    <Link
      href={`/day/${day.date}`}
      className={`
        group relative flex min-h-[72px] flex-col rounded-2xl p-2 transition-all duration-200
        sm:min-h-[88px] sm:p-3
        ${todayRing}
        ${bgClass}
      `}
    >
      <div className="flex items-start justify-between">
        <span
          className={`
            flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold
            sm:h-8 sm:w-8
            ${day.isToday ? 'bg-ink text-white' : 'bg-white/80 text-ink'}
          `}
        >
          {dayNumber}
        </span>
        {day.isDelayed && (
          <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
            暂停
          </span>
        )}
      </div>

      <div className="mt-auto">
        <span
          className={`
            inline-block rounded-full px-2 py-0.5 text-xs font-semibold
            ${isLow ? 'bg-low text-white' : 'bg-high text-white'}
          `}
        >
          {isLow ? '低碳' : '高碳'}
        </span>
        <p className="mt-1 truncate text-[10px] text-ink-muted sm:text-xs">
          {day.workout}
        </p>
      </div>
    </Link>
  );
}
