'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DayInfo, TrainingLogEntry, TrainingStatus } from '@/lib/types';
import { hasCompletionChoice } from '@/lib/training-log';
import { formatDisplayDate } from '@/lib/day-info';
import { useLocale, useT } from '@/lib/i18n';
import { SaveBar } from './SaveBar';

interface DayDetailProps {
  day: DayInfo;
  savedTraining: TrainingLogEntry | null;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onSave: (entry: TrainingLogEntry) => void;
  onToggleDelay: (delayed: boolean) => void;
}

function statusToUi(completed: TrainingStatus | undefined): boolean | null {
  if (completed === 'yes') return true;
  if (completed === 'no') return false;
  return null;
}

export function DayDetail({
  day,
  savedTraining,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onSave,
  onToggleDelay,
}: DayDetailProps) {
  const t = useT();
  const { bcp47 } = useLocale();
  const isLow = day.carbType === 'low';
  const [draftNotes, setDraftNotes] = useState(savedTraining?.notes ?? '');
  const [selectedCompleted, setSelectedCompleted] = useState<boolean | null>(
    statusToUi(savedTraining?.completed)
  );

  const savedNotes = savedTraining?.notes ?? '';
  const notesDirty = draftNotes !== savedNotes;

  useEffect(() => {
    if (!notesDirty) {
      setDraftNotes(savedNotes);
    }
  }, [savedNotes, notesDirty]);

  useEffect(() => {
    setSelectedCompleted(statusToUi(savedTraining?.completed));
  }, [savedTraining]);

  function handleChoice(completed: boolean) {
    setSelectedCompleted(completed);
    onSave({
      completed: completed ? 'yes' : 'no',
      notes: draftNotes.trim(),
    });
  }

  function handleSaveNotes() {
    if (selectedCompleted === null) return;
    onSave({
      completed: selectedCompleted ? 'yes' : 'no',
      notes: draftNotes.trim(),
    });
  }

  function handleReset() {
    setSelectedCompleted(null);
    onSave({
      completed: 'unknown',
      notes: draftNotes.trim(),
    });
  }

  const canReset = hasCompletionChoice(savedTraining ?? undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.backToCalendar')}
      </Link>

      <div
        className={`
          relative overflow-hidden rounded-3xl p-5 shadow-card sm:p-6
          ${day.isDelayed
            ? 'bg-gradient-to-br from-[#3d4454] to-[#1a1a2e]'
            : isLow
              ? 'bg-gradient-to-br from-low-dark to-[#2f5bb8]'
              : 'bg-gradient-to-br from-high-dark to-[#a84f0a]'
          }
        `}
      >
        <p className="text-sm font-medium text-white/80">{formatDisplayDate(day.date, bcp47)}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {day.isDelayed ? t('cycle.paused') : isLow ? t('carb.lowDay') : t('carb.highDay')}
        </h1>
        <p className="mt-1 text-lg text-white/90">
          {day.isDelayed
            ? t('cycle.originalPlan', {
                label: day.label,
                workout: day.scheduledWorkout,
              })
            : `${day.label} · ${day.workout}`}
        </p>
        {day.weight && (
          <p className="mt-2 text-sm text-white/80">
            {t('day.weight', { weight: day.weight })}
          </p>
        )}
        {day.isDelayed && (
          <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm text-white">
            {t('cycle.deferredBadge')}
          </span>
        )}
      </div>

      <div className="mt-6 glass-panel rounded-3xl p-5 sm:p-6">
        <h2 className="font-semibold text-ink">{t('day.trainingSection')}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {day.isDelayed
            ? t('day.pausedPlan', { workout: day.scheduledWorkout })
            : t('day.plannedWorkout', { workout: day.workout })}
        </p>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 transition hover:bg-surface-muted">
          <input
            type="checkbox"
            checked={day.isDelayed}
            onChange={(e) => onToggleDelay(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-ink/20 text-ink focus-visible:ring-2 focus-visible:ring-low/40"
          />
          <div>
            <span className="text-sm font-medium text-ink">
              {day.isToday ? t('day.pauseTodayQ') : t('day.pauseDayQ')}
            </span>
            <p className="mt-0.5 text-xs text-ink-faint">{t('day.pauseHint')}</p>
          </div>
        </label>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-surface px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-ink">{t('day.completionQ')}</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className={`min-h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold transition ${
                selectedCompleted === true
                  ? 'bg-success text-white shadow-soft'
                  : 'border border-ink/10 bg-white text-ink-muted hover:border-success/40 hover:text-success-text'
              }`}
            >
              {t('common.yes')}
            </button>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className={`min-h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold transition ${
                selectedCompleted === false
                  ? 'bg-danger text-white shadow-soft'
                  : 'border border-ink/10 bg-white text-ink-muted hover:border-danger/40 hover:text-danger-text'
              }`}
            >
              {t('common.no')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canReset}
              title={t('day.resetTitle')}
              className={`min-h-10 rounded-xl px-3 text-sm font-medium transition ${
                canReset
                  ? 'cursor-pointer border border-ink/10 bg-white text-ink-muted hover:border-ink/20 hover:text-ink'
                  : 'cursor-not-allowed border border-ink/5 bg-surface/50 text-ink-faint'
              }`}
            >
              {t('day.resetChoice')}
            </button>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-ink-muted">{t('day.notesLabel')}</span>
          <textarea
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder={t('day.notesDetailPh')}
            rows={5}
            className="w-full resize-none rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-base text-ink outline-none transition focus-visible:ring-2 focus-visible:ring-low/40"
          />
        </label>

        <SaveBar
          embedded
          dirty={notesDirty && selectedCompleted !== null}
          saving={cloudSyncing}
          lastSavedAt={lastSavedAt}
          saveError={cloudSaveError}
          onSave={handleSaveNotes}
        />
      </div>

      {!day.weight && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          {t('day.weightLinkBefore')}
          <Link href="/profile" className="mx-1 font-medium text-ink-muted hover:text-ink">
            {t('nav.profile')}
          </Link>
        </p>
      )}
    </div>
  );
}
