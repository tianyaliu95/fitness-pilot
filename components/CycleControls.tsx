'use client';

import { useState } from 'react';
import type { CycleDayTemplate } from '@/lib/types';
import { getCarbLabel } from '@/lib/cycle';

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
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {isTodayDelayed ? (
          <button
            type="button"
            onClick={onUndoDelay}
            className="flex items-center gap-2 rounded-2xl bg-surface-muted px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5 active:scale-[0.98]"
          >
            <span>↩</span>
            取消今日暂停
          </button>
        ) : (
          <button
            type="button"
            onClick={onDelay}
            className="flex items-center gap-2 rounded-2xl bg-surface-muted px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5 active:scale-[0.98]"
          >
            <span>⏸</span>
            暂停一天
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setResetOpen(!resetOpen);
            setPendingDay(null);
          }}
          className="flex items-center gap-2 rounded-2xl border border-ink/10 px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:border-ink/20 hover:text-ink active:scale-[0.98]"
        >
          <span>↺</span>
          重置循环
        </button>
      </div>

      {resetOpen && pendingDay === null && (
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-4 shadow-soft sm:p-5">
          <p className="mb-3 text-sm font-medium text-ink">今天设为哪个循环日？</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cycleDays.map((day) => (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => setPendingDay(day.dayIndex)}
                className="rounded-2xl border border-ink/10 bg-surface p-3 text-left transition hover:border-ink/20 hover:shadow-soft active:scale-[0.98]"
              >
                <span className="block text-sm font-semibold text-ink">{day.label}</span>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    day.carbType === 'low'
                      ? 'bg-low-light text-low-dark'
                      : 'bg-high-light text-high-dark'
                  }`}
                >
                  {getCarbLabel(day.carbType)}
                </span>
                <span className="mt-2 block text-xs text-ink-muted line-clamp-2">
                  {day.workout}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={closeReset}
            className="mt-3 text-sm text-ink-muted hover:text-ink"
          >
            取消
          </button>
        </div>
      )}

      {pending && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3">
          <span className="text-sm text-amber-900">
            确认：今天设为 {pending.label}（{getCarbLabel(pending.carbType)} · {pending.workout}）？
          </span>
          <button
            type="button"
            onClick={() => {
              onReset(pending.dayIndex);
              closeReset();
            }}
            className="rounded-xl bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            确认
          </button>
          <button
            type="button"
            onClick={() => setPendingDay(null)}
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            返回
          </button>
        </div>
      )}
    </div>
  );
}
