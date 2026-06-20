'use client';

import { SettingsPanel } from '@/components/SettingsPanel';
import { useAppState } from '@/lib/storage';

export default function SettingsPage() {
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();

  return (
    <SettingsPanel
      state={state}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onUpdate={updateState}
    />
  );
}
