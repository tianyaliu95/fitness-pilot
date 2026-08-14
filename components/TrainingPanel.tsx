'use client';

import { useEffect, useState } from 'react';
import type { AppState, CycleDayTemplate } from '@/lib/types';
import { getCarbMessageKey } from '@/lib/cycle';
import { useT } from '@/lib/i18n';
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
  const t = useT();
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

  const low = state.cycleDays.filter((d) => d.carbType === 'low').length;
  const high = state.cycleDays.length - low;
  const summary = t('cycle.summary', {
    days: state.cycleDays.length,
    low,
    high,
  });
  const hint = t('training.hint', { summary });
  const showHeader = !embedded && !tabbed;

  return (
    <div className="space-y-5">
      {showHeader && (
        <header>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('training.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{hint}</p>
        </header>
      )}

      {tabbed && <p className="text-sm text-ink-muted">{hint}</p>}

      {embedded && !tabbed && (
        <header>
          <h3 className="text-base font-bold text-ink">{t('training.title')}</h3>
          <p className="mt-1 text-sm text-ink-muted">{hint}</p>
        </header>
      )}

      <div className="glass-panel space-y-4 rounded-3xl p-4 sm:p-5">
        {draftDays.map((day) => (
          <div key={day.dayIndex}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{day.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  day.carbType === 'low'
                    ? 'bg-low-light text-low-dark'
                    : 'bg-high-light text-high-dark'
                }`}
              >
                {t(getCarbMessageKey(day.carbType))}
              </span>
            </div>
            <input
              type="text"
              value={day.workout}
              onChange={(e) => updateWorkout(day.dayIndex, e.target.value)}
              placeholder={t('training.placeholder')}
              className="w-full rounded-xl border border-ink/10 bg-white/70 px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-ink-faint hover:border-ink/15 focus:border-low/40 focus-visible:ring-2 focus-visible:ring-low/30"
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
