'use client';

import { useState } from 'react';
import type { AppState } from '@/lib/types';
import { useT } from '@/lib/i18n';
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
  const t = useT();
  const [tab, setTab] = useState<PlanningTab>('training');
  const [trainingDirty, setTrainingDirty] = useState(false);
  const [cycleDirty, setCycleDirty] = useState(false);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('planning.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('planning.subtitle')}</p>
      </header>

      <TabBar
        idPrefix="planning"
        aria-label={t('planning.ariaTabs')}
        tabs={[
          { id: 'training', label: t('planning.tabTraining'), dirty: trainingDirty },
          { id: 'cycle', label: t('planning.tabCycle'), dirty: cycleDirty },
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
