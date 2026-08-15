'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { DayDetail } from '@/components/DayDetail';
import { buildDayInfo } from '@/lib/day-info';
import type { AppState, TrainingLogEntry } from '@/lib/types';
import { setDateDelayed } from '@/lib/delay';
import { useAppState } from '@/lib/storage';

export default function DayPage() {
  const params = useParams();
  const date = params.date as string;
  const { state, updateState, persistStateNow, cloudSyncing, lastSavedAt, cloudSaveError } =
    useAppState();
  const day = buildDayInfo(date, state);

  const savedTraining = useMemo(
    () => state.trainingLog[date] ?? null,
    [state.trainingLog, date]
  );
  const savedWeight = state.weightLog[date] ?? '';

  function applyTrainingLogUpdate(prev: AppState, entry: TrainingLogEntry): AppState {
    return {
      ...prev,
      trainingLog: {
        ...prev.trainingLog,
        [date]: entry,
      },
    };
  }

  function handleSave(entry: TrainingLogEntry) {
    updateState((prev) => {
      const next = applyTrainingLogUpdate(prev, entry);
      void persistStateNow(next);
      return next;
    });
  }

  function handleSaveWeight(weight: string) {
    updateState((prev) => {
      const nextLog = { ...prev.weightLog };
      if (weight.trim()) {
        nextLog[date] = weight.trim();
      } else {
        delete nextLog[date];
      }
      const next = { ...prev, weightLog: nextLog };
      void persistStateNow(next);
      return next;
    });
  }

  function handleToggleDelay(delayed: boolean) {
    updateState((prev) => {
      const next = setDateDelayed(prev, date, delayed);
      void persistStateNow(next);
      return next;
    });
  }

  return (
    <DayDetail
      day={day}
      savedTraining={savedTraining}
      savedWeight={savedWeight}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onSave={handleSave}
      onSaveWeight={handleSaveWeight}
      onToggleDelay={handleToggleDelay}
    />
  );
}
