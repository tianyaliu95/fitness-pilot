'use client';

import { PlanningPanel } from '@/components/PlanningPanel';
import { useAppState } from '@/lib/storage';

export default function PlanningPage() {
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();

  return (
    <PlanningPanel
      state={state}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onUpdate={updateState}
    />
  );
}
