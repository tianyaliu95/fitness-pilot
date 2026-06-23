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

        <Link
          href={`/day/${todayISO()}`}
          className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 px-3 py-2.5 text-sm font-bold text-ink-muted transition hover:border-ink/20 hover:text-ink active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4"
        >
          <span className="mt-0">📝</span>
          记录训练
        </Link>

        <Link
          href="/profile"
          className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 px-3 py-2.5 text-sm font-bold text-ink-muted transition hover:border-ink/20 hover:text-ink active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4"
        >
          <span className="mt-0">📊</span>
          体重记录
        </Link>

        {isTodayDelayed ? (
          <button
            type="button"
            onClick={onUndoDelay}
            className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-surface-muted px-3 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5 active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4"
          >
            <span className="mt-1.5">↩</span>
            取消今日暂停
          </button>
        ) : (
          <button
            type="button"
            onClick={onDelay}
            className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 px-3 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-ink/5 active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4"
          >
            <span className="mt-0.5">⏸️</span>
            暂停一天
          </button>
        )}
        
        <button
          type="button"
          onClick={() => {
            setResetOpen(!resetOpen);
            setPendingDay(null);
          }}
          className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 px-3 py-2.5 text-sm font-bold text-ink-muted transition hover:border-ink/20 hover:text-ink active:scale-[0.98] sm:w-auto sm:justify-start sm:px-4"
        >
          <span className="mt-0.5">🔄</span>
          重置循环
        </button>
      </div>

      {resetOpen && pendingDay === null && (
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-4 shadow-soft sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">今天设为哪个循环日？</p>
            <button
              type="button"
              onClick={closeReset}
              className="shrink-0 text-sm text-ink-muted hover:text-ink mr-0.5"
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
                className="rounded-2xl border border-ink/10 bg-surface p-3 text-left transition hover:border-ink/20 hover:shadow-soft active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="mt-0.5 block text-sm font-semibold text-ink">{day.label}</span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-sm font-semibold ${day.carbType === 'low'
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
        <div className={`rounded-2xl px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2 ${pending.carbType === 'low' ? 'bg-low-light text-ink' : 'bg-high-light text-amber-900'}`}>
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
              className={`rounded-xl px-4 py-1.5 mt-0.5 sm:ml-4 text-sm font-medium text-white ${pending.carbType === 'low' ? 'bg-low-dark text-low-light hover:bg-low-dark/80' : 'bg-high-dark text-high-light hover:bg-amber-700'}`}
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setPendingDay(null)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium ${pending.carbType === 'low' ? '' : 'text-amber-900 hover:bg-amber-100'}`}
            >
              返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
