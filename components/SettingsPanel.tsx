'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState, CarbType, CycleDayTemplate } from '@/lib/types';
import {
  applyCyclePreset,
  getCarbLabel,
  getCycleSummary,
  rebuildCycleDays,
  todayISO,
} from '@/lib/cycle';
import { SaveBar } from './SaveBar';
import { DatePicker } from './DatePicker';

interface SettingsPanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
  embedded?: boolean;
  tabbed?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

const PRESETS = [
  { label: '3 低碳 + 1 高碳', low: 3, high: 1 },
  { label: '2 低碳 + 1 高碳', low: 2, high: 1 },
  { label: '5 低碳 + 2 高碳', low: 5, high: 2 },
  { label: '4 低碳 + 1 高碳', low: 4, high: 1 },
] as const;

function cycleDaysEqual(a: CycleDayTemplate[], b: CycleDayTemplate[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((day, i) => {
    const other = b[i];
    return day.dayIndex === other.dayIndex && day.carbType === other.carbType;
  });
}

export function SettingsPanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
  embedded = false,
  tabbed = false,
  onDirtyChange,
}: SettingsPanelProps) {
  const [draftDays, setDraftDays] = useState(state.cycleDays);
  const cycleDirty = !cycleDaysEqual(draftDays, state.cycleDays);
  const startDateValue = state.cycleStartDate || todayISO();

  useEffect(() => {
    if (!cycleDirty) {
      setDraftDays(state.cycleDays.map((d) => ({ ...d })));
    }
  }, [state.cycleDays, cycleDirty]);

  useEffect(() => {
    onDirtyChange?.(cycleDirty);
  }, [cycleDirty, onDirtyChange]);

  const summary = useMemo(() => getCycleSummary(draftDays), [draftDays]);
  const lowCount = draftDays.filter((d) => d.carbType === 'low').length;
  const highCount = draftDays.length - lowCount;

  function handleStartDateChange(date: string) {
    onUpdate((prev) => ({ ...prev, cycleStartDate: date }));
  }

  function setLength(next: number) {
    setDraftDays((prev) => rebuildCycleDays(prev, next));
  }

  function toggleCarb(dayIndex: number) {
    setDraftDays((prev) =>
      prev.map((d) =>
        d.dayIndex === dayIndex
          ? { ...d, carbType: d.carbType === 'low' ? 'high' : 'low' }
          : d
      )
    );
  }

  function applyPreset(low: number, high: number) {
    setDraftDays((prev) => applyCyclePreset(prev, low, high));
  }

  function handleSaveCycle() {
    onUpdate((prev) => ({
      ...prev,
      cycleDays: draftDays.map((d, i) => ({
        ...prev.cycleDays[i],
        ...d,
        dayIndex: i,
        label: `Day ${i + 1}`,
      })),
    }));
  }

  const showHeader = !embedded && !tabbed;

  return (
    <div className={embedded || tabbed ? 'space-y-5' : 'space-y-6'}>
      {showHeader && (
        <header>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">设置</h2>
          <p className="mt-1 text-sm text-ink-muted">
            配置碳循环日程与循环起始日期
          </p>
        </header>
      )}

      {embedded && !tabbed && (
        <header>
          <h3 className="text-base font-bold text-ink">碳循环设置</h3>
          <p className="mt-1 text-sm text-ink-muted">
            配置循环起始日与每日低碳 / 高碳安排
          </p>
        </header>
      )}

      <section className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
        <h3 className="text-base font-bold text-ink">起始日期</h3>
        <p className="mt-1 text-sm text-ink-muted">
          日历从该日期起显示低碳 / 高碳与训练计划，之前的日期仅显示日期 · 选择后自动保存
        </p>
        <div className="mt-4">
          <DatePicker
            label="循环起始日"
            value={startDateValue}
            onChange={handleStartDateChange}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
        <h3 className="text-base font-bold text-ink">碳循环日程</h3>
        <p className="mt-1 text-sm text-ink-muted">{summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-ink-muted">循环天数</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={draftDays.length <= 2}
              onClick={() => setLength(draftDays.length - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-surface text-lg font-bold text-ink transition hover:bg-surface-muted disabled:opacity-40"
              aria-label="减少一天"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-lg font-bold text-ink">
              {draftDays.length}
            </span>
            <button
              type="button"
              disabled={draftDays.length >= 7}
              onClick={() => setLength(draftDays.length + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-surface text-lg font-bold text-ink transition hover:bg-surface-muted disabled:opacity-40"
              aria-label="增加一天"
            >
              +
            </button>
          </div>
          <span className="text-sm text-ink-faint">
            {lowCount} 低碳 · {highCount} 高碳
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.low, preset.high)}
              className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink/20 hover:text-ink"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          {draftDays.map((day) => (
            <DayRow
              key={day.dayIndex}
              day={day}
              onToggle={() => toggleCarb(day.dayIndex)}
            />
          ))}
        </div>

        {!tabbed && (
          <SaveBar
            embedded
            dirty={cycleDirty}
            saving={cloudSyncing}
            lastSavedAt={lastSavedAt}
            saveError={cloudSaveError}
            onSave={handleSaveCycle}
          />
        )}
      </section>

      {tabbed && (
        <SaveBar
          dirty={cycleDirty}
          saving={cloudSyncing}
          lastSavedAt={lastSavedAt}
          saveError={cloudSaveError}
          onSave={handleSaveCycle}
        />
      )}

      <section className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
        <h3 className="text-base font-bold text-ink">说明</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li>· 日历按循环天数自动推算每天的低碳 / 高碳类型</li>
          <li>· 起始日期之前的格子不显示循环信息</li>
          <li>· 「暂停今日」会让明天继续当前循环日，并标记训练未完成</li>
          <li>· 重置循环可在日历页选择从哪一天开始</li>
          <li>· 重置只影响今天及以后，过去的低碳 / 高碳保持不变</li>
          <li>· 数据按登录账号独立保存，切换账号后互不影响</li>
        </ul>
      </section>
    </div>
  );
}

function DayRow({
  day,
  onToggle,
}: {
  day: CycleDayTemplate;
  onToggle: () => void;
}) {
  const isLow = day.carbType === 'low';

  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink/5 bg-surface px-4 py-3">
      <span className="text-sm font-semibold text-ink">{day.label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
          isLow
            ? 'bg-low-light text-low-dark hover:bg-low/30'
            : 'bg-high-light text-high-dark hover:bg-high/30'
        }`}
      >
        {getCarbLabel(day.carbType as CarbType)} · 点击切换
      </button>
    </div>
  );
}
