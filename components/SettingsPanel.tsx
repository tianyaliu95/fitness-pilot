'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState, CarbType, CycleDayTemplate } from '@/lib/types';
import {
  applyCyclePreset,
  getCarbMessageKey,
  rebuildCycleDays,
  todayISO,
} from '@/lib/cycle';
import { useT } from '@/lib/i18n';
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
  { low: 3, high: 1 },
  { low: 2, high: 1 },
  { low: 5, high: 2 },
  { low: 4, high: 1 },
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
  const t = useT();
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

  const lowCount = draftDays.filter((d) => d.carbType === 'low').length;
  const highCount = draftDays.length - lowCount;
  const summary = useMemo(
    () =>
      t('cycle.summary', {
        days: draftDays.length,
        low: lowCount,
        high: highCount,
      }),
    [draftDays.length, lowCount, highCount, t]
  );

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
    <div className="space-y-5">
      {showHeader && (
        <header>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('settings.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('settings.subtitle')}</p>
        </header>
      )}

      {embedded && !tabbed && (
        <header>
          <h3 className="text-base font-bold text-ink">{t('settings.title')}</h3>
          <p className="mt-1 text-sm text-ink-muted">{t('settings.subtitle')}</p>
        </header>
      )}

      <section className="glass-panel rounded-3xl p-5 sm:p-6">
        <h3 className="text-base font-bold text-ink">{t('settings.startDateTitle')}</h3>
        <p className="mt-1 text-sm text-ink-muted">{t('settings.startDateHelp')}</p>
        <div className="mt-4">
          <DatePicker
            label={t('settings.startDate')}
            value={startDateValue}
            onChange={handleStartDateChange}
          />
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-5 sm:p-6">
        <h3 className="text-base font-bold text-ink">{t('settings.schedule')}</h3>
        <p className="mt-1 text-sm text-ink-muted">{summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-ink-muted">{t('settings.days')}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={draftDays.length <= 2}
              onClick={() => setLength(draftDays.length - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-surface text-lg font-bold text-ink transition hover:bg-surface-muted disabled:opacity-40"
              aria-label={t('settings.decDay')}
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
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-surface text-lg font-bold text-ink transition hover:bg-surface-muted disabled:opacity-40"
              aria-label={t('settings.incDay')}
            >
              +
            </button>
          </div>
          <span className="text-sm text-ink-faint">
            {t('settings.daysCount', { low: lowCount, high: highCount })}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={`${preset.low}-${preset.high}`}
              type="button"
              onClick={() => applyPreset(preset.low, preset.high)}
              className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink/20 hover:text-ink"
            >
              {t('settings.preset', { low: preset.low, high: preset.high })}
            </button>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-ink/8 border-t border-ink/8">
          {draftDays.map((day) => (
            <DayRow
              key={day.dayIndex}
              day={day}
              onToggle={() => toggleCarb(day.dayIndex)}
            />
          ))}
        </ul>

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

      <section className="glass-panel rounded-3xl p-5 sm:p-6">
        <h3 className="text-base font-bold text-ink">{t('settings.helpTitle')}</h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li>· {t('settings.help1')}</li>
          <li>· {t('settings.help2')}</li>
          <li>· {t('settings.help3')}</li>
          <li>· {t('settings.help4')}</li>
          <li>· {t('settings.help5')}</li>
          <li>· {t('settings.help6')}</li>
          <li>· {t('settings.help7')}</li>
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
  const t = useT();
  const isLow = day.carbType === 'low';

  return (
    <li className="flex items-center justify-between gap-3 py-3.5">
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
        {t('settings.toggleCarb', {
          carb: t(getCarbMessageKey(day.carbType as CarbType)),
        })}
      </button>
    </li>
  );
}
