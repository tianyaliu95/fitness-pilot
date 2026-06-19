'use client';

import { TrainingPanel } from '@/components/TrainingPanel';
import { useAppState } from '@/lib/storage';

export default function TrainingPage() {
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();

  return (
    <TrainingPanel
      state={state}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onUpdate={updateState}
    />
  );
}
