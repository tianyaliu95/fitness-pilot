'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { DayDetail } from '@/components/DayDetail';
import { buildDayInfo } from '@/lib/day-info';
import type { TrainingLogEntry } from '@/lib/types';
import { isRecordedEntry } from '@/lib/training-log';
import { setDateDelayed } from '@/lib/delay';
import { useAppState } from '@/lib/storage';

export default function DayPage() {
  const params = useParams();
  const date = params.date as string;
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();
  const day = buildDayInfo(date, state);

  const savedTraining = useMemo(() => {
    const entry = state.trainingLog[date];
    return isRecordedEntry(entry) ? entry : null;
  }, [state.trainingLog, date]);

  function handleSave(entry: TrainingLogEntry | null) {
    updateState((prev) => {
      const nextLog = { ...prev.trainingLog };
      if (entry === null) {
        delete nextLog[date];
      } else {
        nextLog[date] = entry;
      }
      return { ...prev, trainingLog: nextLog };
    });
  }

  function handleToggleDelay(delayed: boolean) {
    updateState((prev) => setDateDelayed(prev, date, delayed));
  }

  return (
    <DayDetail
      day={day}
      savedTraining={savedTraining}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onSave={handleSave}
      onToggleDelay={handleToggleDelay}
    />
  );
}
