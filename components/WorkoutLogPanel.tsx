'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { AppState } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { getListedTrainings, getTrainingStats, isCompletedNo, isCompletedYes } from '@/lib/training-log';

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
      return { label: '已完成', className: 'bg-emerald-50 text-emerald-700' };
    }
    if (isCompletedNo(entry)) {
      return { label: '未完成', className: 'bg-pink-50 text-pink-700' };
    }
    return { label: '未记录', className: 'bg-surface-muted text-ink-muted' };
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">训练记录</h2>
        <p className="mt-1 text-sm text-ink-muted">汇总所有训练日，含未标记完成状态的天</p>
      </header>

      {records.length > 0 ? (
        <>
          <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">训练总结</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="记录天数" value={String(stats.totalRecorded)} />
              <StatCard
                label="完成率"
                value={stats.completionRate !== null ? `${stats.completionRate}%` : '—'}
                hint={`${stats.completedCount} 天完成 · ${stats.missedCount} 天未完成`}
                accent="text-emerald-600"
              />
              <StatCard
                label="近 7 天"
                value={
                  stats.recent7Rate !== null ? `${stats.recent7Rate}%` : '—'
                }
                hint={
                  stats.recent7Total > 0
                    ? `${stats.recent7Completed}/${stats.recent7Total} 次完成`
                    : undefined
                }
              />
              <StatCard
                label="连续完成"
                value={
                  stats.currentCompleteStreak > 0
                    ? `${stats.currentCompleteStreak} 天`
                    : '—'
                }
                hint={stats.withNotesCount > 0 ? `${stats.withNotesCount} 条含笔记` : undefined}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">全部记录</h3>
            <ul className="space-y-3">
              {records.map(({ date, entry, plannedWorkout, label }) => {
                const badge = statusBadge(entry);
                return (
                <li key={date}>
                  <Link
                    href={`/day/${date}`}
                    className="block rounded-2xl border border-ink/5 bg-surface p-4 transition hover:border-ink/15 hover:shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {formatDisplayDate(date)}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {label} · {plannedWorkout}
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
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-8 text-center shadow-soft sm:p-10">
          <p className="text-sm text-ink-muted">还没有训练记录</p>
          <p className="mt-2 text-xs text-ink-faint">
            在日历或首页进入某日详情，选择「是 / 否」并保存即可开始记录
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            去日历
          </Link>
        </div>
      )}
    </div>
  );
}
