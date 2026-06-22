'use client';

import { useMemo, useState } from 'react';
import type { AppState } from '@/lib/types';
import {
  buildDayInfo,
  formatMonthYear,
  getCalendarGrid,
  getWeekdayLabels,
  formatDateISO,
} from '@/lib/day-info';
import { DayCell } from './DayCell';

interface CalendarProps {
  state: AppState;
}

export function Calendar({ state }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const grid = useMemo(
    () => getCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const weekdays = getWeekdayLabels();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  return (
    <div className="rounded-2xl bg-surface-card px-2.5 pt-3 pb-5 shadow-soft sm:rounded-3xl sm:px-6 sm:pt-6 sm:pb-10">
      <div className="mb-3 flex items-center justify-between sm:mb-6">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-ink transition hover:bg-ink/5 active:scale-95 sm:h-10 sm:w-10 sm:rounded-2xl"
          aria-label="上个月"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-ink sm:text-xl">
            {formatMonthYear(viewYear, viewMonth)}
          </h2>
          <button
            type="button"
            onClick={goToday}
            className="mt-0.5 text-xs font-medium text-low-dark hover:underline"
          >
            回到今天
          </button>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-ink transition hover:bg-ink/5 active:scale-95 sm:h-10 sm:w-10 sm:rounded-2xl"
          aria-label="下个月"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-2">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="py-0.5 text-center text-[10px] font-medium text-ink-faint sm:py-1 sm:text-sm"
          >
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {grid.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-[52px] sm:min-h-[88px]" />;
          }
          const iso = formatDateISO(date);
          const dayInfo = buildDayInfo(iso, state);
          return (
            <DayCell key={iso} day={dayInfo} dayNumber={date.getDate()} />
          );
        })}
      </div>
    </div>
  );
}
