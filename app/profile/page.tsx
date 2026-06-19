'use client';

import { ProfilePanel } from '@/components/ProfilePanel';
import { useAppState } from '@/lib/storage';

export default function ProfilePage() {
  const { state, updateState, cloudSyncing, lastSavedAt, cloudSaveError } = useAppState();

  return (
    <ProfilePanel
      state={state}
      cloudSyncing={cloudSyncing}
      lastSavedAt={lastSavedAt}
      cloudSaveError={cloudSaveError}
      onUpdate={updateState}
    />
  );
}
