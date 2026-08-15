'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import type { AppState } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { getListedTrainings, getTrainingStats, isCompletedNo, isCompletedYes } from '@/lib/training-log';
import { useLocale, useT } from '@/lib/i18n';
import {
  tourScrollMarginClass,
  useOnboardingStep,
  useScrollTourTarget,
} from './Onboarding';

interface WorkoutLogPanelProps {
  state: AppState;
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-3.5">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tracking-tight ${accent ?? 'text-ink'}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function WorkoutLogPanel({ state }: WorkoutLogPanelProps) {
  const t = useT();
  const { bcp47 } = useLocale();
  const highlight = useOnboardingStep() === 'workoutLog';
  const tourRef = useRef<HTMLDivElement>(null);
  useScrollTourTarget(highlight, tourRef, 160, 2);
  const stats = useMemo(
    () => getTrainingStats(state.trainingLog, state),
    [state]
  );
  const records = useMemo(
    () => getListedTrainings(state.trainingLog, state),
    [state]
  );

  function statusBadge(entry: (typeof records)[number]['entry']) {
    if (isCompletedYes(entry)) {
      return { label: t('log.completed'), className: 'bg-success-soft text-success-text' };
    }
    if (isCompletedNo(entry)) {
      return { label: t('log.missed'), className: 'bg-danger-soft text-danger-text' };
    }
    return { label: t('log.unrecorded'), className: 'bg-surface-muted text-ink-muted' };
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('log.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('log.subtitle')}</p>
      </header>

      <div
        ref={tourRef}
        id="tour-workout-log"
        className={`${tourScrollMarginClass} space-y-5`}
      >
        {records.length > 0 ? (
          <>
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold text-ink">{t('log.summary')}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label={t('log.daysLogged')} value={String(stats.totalRecorded)} />
                <StatCard
                  label={t('log.completionRate')}
                  value={stats.completionRate !== null ? `${stats.completionRate}%` : '-'}
                  hint={t('log.completionHint', {
                    done: stats.completedCount,
                    missed: stats.missedCount,
                  })}
                  accent="text-success-text"
                />
                <StatCard
                  label={t('log.recent7')}
                  value={
                    stats.recent7Rate !== null ? `${stats.recent7Rate}%` : '-'
                  }
                  hint={
                    stats.recent7Total > 0
                      ? t('log.recent7Hint', {
                          done: stats.recent7Completed,
                          total: stats.recent7Total,
                        })
                      : undefined
                  }
                />
                <StatCard
                  label={t('log.streak')}
                  value={
                    stats.currentCompleteStreak > 0
                      ? t('log.streakValue', { days: stats.currentCompleteStreak })
                      : '-'
                  }
                  hint={
                    stats.withNotesCount > 0
                      ? t('log.withNotes', { count: stats.withNotesCount })
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold text-ink">{t('log.all')}</h3>
              <ul className="space-y-3">
                {records.map(({ date, entry, plannedWorkout, isDelayed, label }) => {
                  const badge = statusBadge(entry);
                  const workoutLine = isDelayed
                    ? t('log.pausedOriginal', { workout: plannedWorkout })
                    : plannedWorkout;
                  return (
                  <li key={date}>
                    <Link
                      href={`/day/${date}`}
                      className="block rounded-2xl border border-ink/5 bg-surface p-4 transition hover:border-ink/15 hover:shadow-soft"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">
                            {formatDisplayDate(date, bcp47)}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {label} · {workoutLine}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:px-6 sm:py-2 sm:text-sm ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {entry.notes.trim() && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                          {entry.notes}
                        </p>
                      )}
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : (
          <div className="glass-panel rounded-3xl p-8 text-center sm:p-10">
            <p className="text-sm text-ink-muted">{t('log.empty')}</p>
            <p className="mt-2 text-xs text-ink-faint">{t('log.emptyHint')}</p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              {t('log.goCalendar')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
