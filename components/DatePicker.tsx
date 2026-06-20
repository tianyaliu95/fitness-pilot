'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDateISO, parseDateISO, todayISO } from '@/lib/cycle';
import {
  formatDisplayDate,
  formatMonthYear,
  getCalendarGrid,
  getWeekdayLabels,
} from '@/lib/day-info';

interface DatePickerProps {
  value: string;
  max?: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, max, onChange, label = '日期' }: DatePickerProps) {
  const maxDate = max ?? todayISO();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = parseDateISO(value);
  const maxParsed = parseDateISO(maxDate);
  const today = todayISO();

  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    if (open) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const grid = getCalendarGrid(viewYear, viewMonth);
  const weekdays = getWeekdayLabels();

  const canGoNext =
    viewYear < maxParsed.getFullYear() ||
    (viewYear === maxParsed.getFullYear() && viewMonth < maxParsed.getMonth());

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  function isDisabled(iso: string): boolean {
    return iso > maxDate;
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`
          flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border
          bg-surface px-3 py-2.5 text-left text-sm transition
          ${open
            ? 'border-ink/20 ring-2 ring-ink/10'
            : 'border-ink/10 hover:border-ink/20 hover:bg-surface-muted'
          }
        `}
      >
        <span className="font-medium text-ink">{formatDisplayDate(value)}</span>
        <CalendarIcon className="shrink-0 text-ink-muted" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="选择日期"
          className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-ink/5 bg-surface-card p-4 shadow-card"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="上个月"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface hover:text-ink"
            >
              <ChevronLeft />
            </button>
            <span className="text-sm font-semibold text-ink">
              {formatMonthYear(viewYear, viewMonth)}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canGoNext}
              aria-label="下个月"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((wd) => (
              <div
                key={wd}
                className="py-1 text-center text-[11px] font-medium text-ink-faint"
              >
                {wd}
              </div>
            ))}

            {grid.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} />;
              }

              const iso = formatDateISO(day);
              const disabled = isDisabled(iso);
              const isSelected = iso === value;
              const isToday = iso === today;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDate(iso)}
                  className={`
                    flex h-9 w-full items-center justify-center rounded-xl text-sm font-medium transition
                    ${disabled
                      ? 'cursor-not-allowed text-ink-faint/40'
                      : 'cursor-pointer hover:bg-surface-muted'
                    }
                    ${isSelected
                      ? 'bg-ink text-white hover:bg-ink/90'
                      : isToday
                        ? 'ring-1 ring-ink/20 text-ink'
                        : 'text-ink'
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 ${className ?? ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
