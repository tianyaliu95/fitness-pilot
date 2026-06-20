'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DayInfo, TrainingLogEntry } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { SaveBar } from './SaveBar';

interface DayDetailProps {
  day: DayInfo;
  savedTraining: TrainingLogEntry | null;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onSave: (entry: TrainingLogEntry | null) => void;
  onToggleDelay: (delayed: boolean) => void;
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
  const isLow = day.carbType === 'low';
  const [draftNotes, setDraftNotes] = useState(savedTraining?.notes ?? '');
  const [selectedCompleted, setSelectedCompleted] = useState<boolean | null>(
    savedTraining?.completed ?? null
  );

  const savedNotes = savedTraining?.notes ?? '';
  const notesDirty = draftNotes !== savedNotes;

  useEffect(() => {
    if (!notesDirty) {
      setDraftNotes(savedNotes);
    }
  }, [savedNotes, notesDirty]);

  useEffect(() => {
    setSelectedCompleted(savedTraining?.completed ?? null);
  }, [savedTraining]);

  function handleChoice(completed: boolean) {
    setSelectedCompleted(completed);
    onSave({
      completed,
      notes: draftNotes.trim(),
    });
  }

  function handleSaveNotes() {
    if (selectedCompleted === null) return;
    onSave({
      completed: selectedCompleted,
      notes: draftNotes.trim(),
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回日历
      </Link>

      <div
        className={`
          relative overflow-hidden rounded-3xl p-6 shadow-card
          ${isLow
            ? 'bg-gradient-to-br from-low to-low-dark'
            : 'bg-gradient-to-br from-high to-high-dark'
          }
        `}
      >
        <p className="text-sm font-medium text-white/80">{formatDisplayDate(day.date)}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {isLow ? '低碳日' : '高碳日'}
        </h1>
        <p className="mt-1 text-lg text-white/90">{day.label} · {day.workout}</p>
        {day.weight && (
          <p className="mt-2 text-sm text-white/80">体重 {day.weight} kg</p>
        )}
        {day.isDelayed && (
          <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm text-white">
            已暂停
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-surface-card p-5 shadow-soft sm:p-6">
        <h2 className="font-semibold text-ink">训练记录</h2>
        <p className="mt-1 text-sm text-ink-muted">计划训练：{day.workout}</p>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 transition hover:bg-surface-muted">
          <input
            type="checkbox"
            checked={day.isDelayed}
            onChange={(e) => onToggleDelay(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-ink/20 text-ink focus:ring-ink/20"
          />
          <div>
            <span className="text-sm font-medium text-ink">
              {day.isToday ? '今日暂停？' : '这天暂停？'}
            </span>
            <p className="mt-0.5 text-xs text-ink-faint">
              勾选后循环顺延一天，训练记为未完成
            </p>
          </div>
        </label>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5">
          <span className="text-sm font-medium text-ink">今天训练是否按计划完成？</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className={`cursor-pointer rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                selectedCompleted === true
                  ? 'bg-emerald-500 text-white shadow-soft'
                  : 'border border-ink/10 bg-surface-card text-ink-muted hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              是
            </button>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className={`cursor-pointer rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                selectedCompleted === false
                  ? 'bg-rose-800 text-white shadow-soft'
                  : 'border border-ink/10 bg-surface-card text-ink-muted hover:border-rose-300 hover:text-rose-700'
              }`}
            >
              否
            </button>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-ink-muted">训练细节</span>
          <textarea
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder="记录实际训练内容、组数、重量、感受等..."
            rows={5}
            className="w-full resize-none rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-ink/10"
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
          可在
          <Link href="/profile" className="mx-1 font-medium text-ink-muted hover:text-ink">
            个人信息
          </Link>
          记录今日体重
        </p>
      )}
    </div>
  );
}
