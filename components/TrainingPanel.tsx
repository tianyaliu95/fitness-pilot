'use client';

import { useEffect, useState } from 'react';
import type { AppState, CycleDayTemplate } from '@/lib/types';
import { getCarbLabel, getCycleSummary } from '@/lib/cycle';
import { SaveBar } from './SaveBar';

interface TrainingPanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
  embedded?: boolean;
  tabbed?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

function cycleDaysEqual(a: CycleDayTemplate[], b: CycleDayTemplate[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((day, i) => {
    const other = b[i];
    return (
      day.dayIndex === other.dayIndex &&
      day.carbType === other.carbType &&
      day.workout === other.workout &&
      day.label === other.label
    );
  });
}

export function TrainingPanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
  embedded = false,
  tabbed = false,
  onDirtyChange,
}: TrainingPanelProps) {
  const [draftDays, setDraftDays] = useState(state.cycleDays);
  const dirty = !cycleDaysEqual(draftDays, state.cycleDays);

  useEffect(() => {
    if (!dirty) {
      setDraftDays(state.cycleDays.map((d) => ({ ...d })));
    }
  }, [state.cycleDays, dirty]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function updateWorkout(dayIndex: number, workout: string) {
    setDraftDays((prev) =>
      prev.map((d) => (d.dayIndex === dayIndex ? { ...d, workout } : d))
    );
  }

  function handleSave() {
    onUpdate((prev) => ({
      ...prev,
      cycleDays: draftDays.map((d) => ({ ...d })),
    }));
  }

  const showHeader = !embedded && !tabbed;

  return (
    <div className={embedded || tabbed ? 'space-y-4' : 'space-y-5'}>
      {showHeader && (
        <header>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">训练安排</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {getCycleSummary(state.cycleDays)}，修改后点击保存
          </p>
        </header>
      )}

      {tabbed && (
        <p className="text-sm text-ink-muted">
          {getCycleSummary(state.cycleDays)}，修改后点击保存
        </p>
      )}

      {embedded && !tabbed && (
        <header>
          <h3 className="text-base font-bold text-ink">训练安排</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {getCycleSummary(state.cycleDays)}，修改后点击保存
          </p>
        </header>
      )}

      <div className="space-y-3">
        {draftDays.map((day) => (
          <div
            key={day.dayIndex}
            className="rounded-3xl border border-ink/5 bg-surface-card p-4 shadow-soft sm:p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{day.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  day.carbType === 'low'
                    ? 'bg-low-light text-low-dark'
                    : 'bg-high-light text-high-dark'
                }`}
              >
                {getCarbLabel(day.carbType)}
              </span>
            </div>
            <input
              type="text"
              value={day.workout}
              onChange={(e) => updateWorkout(day.dayIndex, e.target.value)}
              placeholder="训练内容..."
              className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ink/10"
            />
          </div>
        ))}
      </div>

      <SaveBar
        dirty={dirty}
        saving={cloudSyncing}
        lastSavedAt={lastSavedAt}
        saveError={cloudSaveError}
        onSave={handleSave}
      />
    </div>
  );
}
