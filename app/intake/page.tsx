'use client';

import { IntakePanel } from '@/components/IntakePanel';
import { useAppState } from '@/lib/storage';

export default function IntakePage() {
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();

  return (
    <IntakePanel
      state={state}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onUpdate={updateState}
    />
  );
}
