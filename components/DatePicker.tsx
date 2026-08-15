'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatDateISO, parseDateISO, todayISO } from '@/lib/cycle';
import {
  formatDisplayDate,
  formatMonthYear,
  getCalendarGrid,
  getWeekdayLabels,
} from '@/lib/day-info';
import { useLocale, useT } from '@/lib/i18n';

/** Above onboarding (z-40), bottom nav (z-50), and pull-to-refresh (z-60). */
const POPOVER_Z = 'z-[70]';

interface DatePickerProps {
  value: string;
  max?: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, max, onChange, label }: DatePickerProps) {
  const t = useT();
  const { bcp47 } = useLocale();
  const fieldLabel = label ?? t('datePicker.label');
  const maxDate = max ?? todayISO();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  const selected = parseDateISO(value);
  const maxParsed = parseDateISO(maxDate);
  const today = todayISO();

  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    function updatePos() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
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
  const weekdays = getWeekdayLabels([
    t('weekday.0'),
    t('weekday.1'),
    t('weekday.2'),
    t('weekday.3'),
    t('weekday.4'),
    t('weekday.5'),
    t('weekday.6'),
  ]);

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

  const popover =
    mounted &&
    open &&
    pos &&
    createPortal(
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={t('datePicker.select')}
        className={`fixed ${POPOVER_Z} rounded-2xl border border-ink/10 bg-white p-4 shadow-card`}
        style={{ top: pos.top, left: pos.left, width: pos.width }}
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            aria-label={t('calendar.prevMonth')}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            <ChevronLeft />
          </button>
          <span className="text-sm font-semibold text-ink">
            {formatMonthYear(viewYear, viewMonth, bcp47)}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canGoNext}
            aria-label={t('calendar.nextMonth')}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((wd, i) => (
            <div
              key={i}
              className="py-1 text-center text-xs font-medium text-ink-faint"
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
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-xs font-medium text-ink-muted">{fieldLabel}</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`
          flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border
          bg-surface px-3 py-2.5 text-left text-base transition
          ${open
            ? 'border-ink/20 ring-2 ring-ink/10'
            : 'border-ink/10 hover:border-ink/20 hover:bg-surface-muted'
          }
        `}
      >
        <span className="font-medium text-ink">{formatDisplayDate(value, bcp47)}</span>
        <CalendarIcon className="shrink-0 text-ink-muted" />
      </button>
      {popover}
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
