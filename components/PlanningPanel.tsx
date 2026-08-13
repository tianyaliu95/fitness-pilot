'use client';

import { useState } from 'react';
import type { AppState } from '@/lib/types';
import { TrainingPanel } from './TrainingPanel';
import { SettingsPanel } from './SettingsPanel';
import { TabBar, tabPanelProps } from './TabBar';

interface PlanningPanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

type PlanningTab = 'training' | 'cycle';

export function PlanningPanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
}: PlanningPanelProps) {
  const [tab, setTab] = useState<PlanningTab>('training');
  const [trainingDirty, setTrainingDirty] = useState(false);
  const [cycleDirty, setCycleDirty] = useState(false);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">训练规划</h2>
        <p className="mt-1 text-sm text-ink-muted">
          安排每日训练内容与碳循环日程，每个 tab 独立保存
        </p>
      </header>

      <TabBar
        idPrefix="planning"
        aria-label="训练规划分类"
        tabs={[
          { id: 'training', label: '训练安排', dirty: trainingDirty },
          { id: 'cycle', label: '碳循环设置', dirty: cycleDirty },
        ]}
        activeId={tab}
        onChange={(id) => setTab(id as PlanningTab)}
      />

      <div {...tabPanelProps('planning', 'training', tab)}>
        <TrainingPanel
          tabbed
          state={state}
          cloudSyncing={cloudSyncing}
          lastSavedAt={lastSavedAt}
          cloudSaveError={cloudSaveError}
          onUpdate={onUpdate}
          onDirtyChange={setTrainingDirty}
        />
      </div>

      <div {...tabPanelProps('planning', 'cycle', tab)}>
        <SettingsPanel
          tabbed
          state={state}
          cloudSyncing={cloudSyncing}
          lastSavedAt={lastSavedAt}
          cloudSaveError={cloudSaveError}
          onUpdate={onUpdate}
          onDirtyChange={setCycleDirty}
        />
      </div>
    </div>
  );
}
