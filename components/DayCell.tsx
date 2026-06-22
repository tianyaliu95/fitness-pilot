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
    ? 'ring-2 ring-inset ring-ink shadow-card sm:scale-[1.02] sm:ring-offset-0'
    : 'hover:shadow-soft sm:hover:scale-[1.05]';

  const notComplete = day.isDelayed || day.trainingIncomplete;

  const status = day.trainingComplete ? (
    <StatusBadge variant="complete" label="训练已完成" />
  ) : notComplete ? (
    <StatusBadge variant="incomplete" label="训练未完成" />
  ) : null;

  if (!day.isCycleActive) {
    return (
      <div
        aria-disabled="true"
        className="relative flex min-h-[52px] cursor-default flex-col items-center justify-center rounded-xl border border-ink/5 bg-surface p-1.5 sm:min-h-[88px] sm:items-start sm:justify-start sm:rounded-2xl sm:p-3"
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
      </div>
    );
  }

  const bgClass = isLow ? 'bg-low-light' : 'bg-high-light';

  return (
    <Link
      href={`/day/${day.date}`}
      className={`
        group relative flex min-h-[52px] flex-col rounded-xl p-1.5 transition-all duration-200
        sm:min-h-[88px] sm:rounded-2xl sm:p-3
        ${todayRing}
        ${bgClass}
      `}
    >
      {/* Mobile: date row + status row, centered */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        <span
          className={`
            flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold
            ${day.isToday ? 'bg-ink text-white' : 'bg-white/80 text-ink'}
          `}
        >
          {dayNumber}
        </span>
        <div className="flex h-5 items-center justify-center">{status}</div>
      </div>

      {/* Desktop: original layout */}
      <div className="hidden sm:flex sm:items-start sm:justify-between">
        <span
          className={`
            flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
            ${day.isToday ? 'bg-ink text-white' : 'bg-white/80 text-ink'}
          `}
        >
          {dayNumber}
        </span>
        {status}
      </div>

      <div className="mt-auto hidden sm:block">
        <span
          className={`
            inline-block rounded-full px-2 py-0.5 text-xs font-semibold
            ${isLow ? 'bg-low text-white' : 'bg-high text-white'}
          `}
        >
          {isLow ? '低碳' : '高碳'}
        </span>
        <p className="mt-1 truncate text-xs text-ink-muted">{day.workout}</p>
      </div>
    </Link>
  );
}

function StatusBadge({
  variant,
  label,
}: {
  variant: 'complete' | 'incomplete';
  label: string;
}) {
  const styles =
    variant === 'complete' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white';

  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-sm sm:h-6 sm:w-6 ${styles}`}
      aria-label={label}
    >
      {variant === 'complete' ? <CheckIcon /> : <CrossIcon />}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
