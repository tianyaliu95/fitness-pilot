'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { todayISO } from '@/lib/cycle';
import { getWeightSeries } from '@/lib/weight';
import { WeightChart } from './WeightChart';
import { SaveBar } from './SaveBar';

interface ProfilePanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

export function ProfilePanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
}: ProfilePanelProps) {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [draftWeight, setDraftWeight] = useState('');

  const savedWeight = state.weightLog[selectedDate] ?? '';

  const dirty = draftWeight !== savedWeight;

  useEffect(() => {
    setDraftWeight(savedWeight);
  }, [selectedDate, savedWeight]);

  const chartData = useMemo(() => getWeightSeries(state.weightLog), [state.weightLog]);

  const history = useMemo(() => {
    return Object.entries(state.weightLog)
      .filter(([, w]) => w.trim().length > 0)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30);
  }, [state.weightLog]);

  function handleSave() {
    onUpdate((prev) => {
      const next = { ...prev.weightLog };
      if (draftWeight.trim()) {
        next[selectedDate] = draftWeight.trim();
      } else {
        delete next[selectedDate];
      }
      return { ...prev, weightLog: next };
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">个人信息</h2>
        <p className="mt-1 text-sm text-ink-muted">每天记录体重，修改后点击保存</p>
      </header>

      <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-muted">日期</span>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-ink-muted">体重 (kg)</span>
          <input
            type="text"
            inputMode="decimal"
            value={draftWeight}
            onChange={(e) => setDraftWeight(e.target.value)}
            placeholder="例如 72.5"
            className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>

        {selectedDate === today && (
          <p className="mt-2 text-xs text-ink-faint">今天 · {formatDisplayDate(selectedDate)}</p>
        )}
      </div>

      <SaveBar
        dirty={dirty}
        saving={cloudSyncing}
        lastSavedAt={lastSavedAt}
        saveError={cloudSaveError}
        onSave={handleSave}
      />

      {chartData.length > 0 && (
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">体重变化</h3>
          <WeightChart data={chartData} />
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
          <h3 className="mb-3 text-sm font-semibold text-ink">近期记录</h3>
          <ul className="space-y-2">
            {history.map(([date, weight]) => (
              <li
                key={date}
                className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-sm"
              >
                <span className="text-ink-muted">
                  {formatDisplayDate(date)}
                </span>
                <span className="font-semibold text-ink">{weight} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
