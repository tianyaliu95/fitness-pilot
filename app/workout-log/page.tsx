'use client';

import { WorkoutLogPanel } from '@/components/WorkoutLogPanel';
import { useAppState } from '@/lib/storage';

export default function WorkoutLogPage() {
  const { state } = useAppState();

  return <WorkoutLogPanel state={state} />;
}
