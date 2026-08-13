'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CycleDayTemplate } from '@/lib/types';
import { getCarbLabel, todayISO } from '@/lib/cycle';

interface CycleControlsProps {
  cycleDays: CycleDayTemplate[];
  onReset: (cycleDayIndex: number) => void;
  onDelay: () => void;
  onUndoDelay: () => void;
  isTodayDelayed: boolean;
}

const pillBase =
  'flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-bold transition active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4';
const pillIdle =
  `${pillBase} border-ink/8 bg-white text-ink shadow-soft hover:border-ink/15 hover:shadow-card`;
const pillActive =
  `${pillBase} border-low/25 bg-low-light text-low-dark shadow-soft hover:border-low/40 hover:bg-low-light/80`;

function IconLog() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export function CycleControls({
  cycleDays,
  onReset,
  onDelay,
  onUndoDelay,
  isTodayDelayed,
}: CycleControlsProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);

  const pending = pendingDay !== null ? cycleDays[pendingDay] : null;

  function closeReset() {
    setResetOpen(false);
    setPendingDay(null);
  }

  return (
    <div className="space-y-3">
      <div className="mx-auto grid max-w-md grid-cols-2 justify-items-center gap-2 sm:mx-0 sm:flex sm:max-w-none sm:flex-wrap sm:justify-start sm:gap-3">
        <Link href={`/day/${todayISO()}`} className={pillIdle}>
          <IconLog />
          记录训练
        </Link>

        <Link href="/profile" className={pillIdle}>
          <IconChart />
          体重记录
        </Link>

        {isTodayDelayed ? (
          <button type="button" onClick={onUndoDelay} className={pillActive}>
            <IconUndo />
            取消今日暂停
          </button>
        ) : (
          <button type="button" onClick={onDelay} className={pillIdle}>
            <IconPause />
            暂停一天
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setResetOpen(!resetOpen);
            setPendingDay(null);
          }}
          className={pillIdle}
        >
          <IconReset />
          重置循环
        </button>
      </div>

      {resetOpen && pendingDay === null && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">今天设为哪个循环日？</p>
            <button
              type="button"
              onClick={closeReset}
              className="mr-0.5 shrink-0 text-sm text-ink-muted hover:text-ink"
            >
              取消
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cycleDays.map((day) => (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => setPendingDay(day.dayIndex)}
                className="rounded-2xl border border-ink/10 bg-white p-3 text-left shadow-soft transition hover:border-ink/20 hover:shadow-card active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="mt-0.5 block text-sm font-semibold text-ink">{day.label}</span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-sm font-semibold ${
                      day.carbType === 'low'
                        ? 'bg-low-light text-low-dark'
                        : 'bg-high-light text-high-dark'
                    }`}
                  >
                    {getCarbLabel(day.carbType)}
                  </span>
                </div>

                <span className="mt-2 block text-xs text-ink-muted line-clamp-2">
                  {day.workout}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {pending && (
        <div
          className={`rounded-2xl px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2 ${
            pending.carbType === 'low' ? 'bg-low-light text-ink' : 'bg-high-light text-amber-900'
          }`}
        >
          <span className="block text-sm sm:text-base">
            确认今天设为 {pending.label}（{getCarbLabel(pending.carbType)} · {pending.workout}）?
          </span>
          <div className="mt-3 flex gap-2 sm:mt-0">
            <button
              type="button"
              onClick={() => {
                onReset(pending.dayIndex);
                closeReset();
              }}
              className={`mt-0.5 rounded-xl px-4 py-1.5 text-sm font-medium text-white sm:ml-4 ${
                pending.carbType === 'low'
                  ? 'bg-low-dark text-low-light hover:bg-low-dark/80'
                  : 'bg-high-dark text-high-light hover:bg-amber-700'
              }`}
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setPendingDay(null)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                pending.carbType === 'low' ? '' : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
