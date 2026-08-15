'use client';

import { useEffect, useRef, useState } from 'react';
import type { AppState } from '@/lib/types';
import { useT } from '@/lib/i18n';
import { TrainingPanel } from './TrainingPanel';
import { SettingsPanel } from './SettingsPanel';
import { TabBar, tabPanelProps } from './TabBar';
import {
  TOUR_PLANNING_BELOW_OVERLAY_PX,
  tourScrollMarginClass,
  useOnboardingStep,
  useScrollTourTarget,
} from './Onboarding';

interface PlanningPanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

type PlanningTab = 'training' | 'cycle';

function tabForTourStep(tourStep: string | null): PlanningTab | null {
  if (tourStep === 'carbCycle') return 'cycle';
  if (tourStep === 'planning') return 'training';
  return null;
}

export function PlanningPanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
}: PlanningPanelProps) {
  const t = useT();
  const tourStep = useOnboardingStep();
  const [tab, setTab] = useState<PlanningTab>(
    () => tabForTourStep(tourStep) ?? 'training'
  );
  const [trainingDirty, setTrainingDirty] = useState(false);
  const [cycleDirty, setCycleDirty] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollToTabs =
    tourStep === 'planning' || tourStep === 'carbCycle';
  useScrollTourTarget(
    scrollToTabs,
    tabsRef,
    160,
    TOUR_PLANNING_BELOW_OVERLAY_PX,
    tourStep
  );

  // Entering a tour step selects the matching tab once; the user can still switch.
  useEffect(() => {
    const next = tabForTourStep(tourStep);
    if (next) setTab(next);
  }, [tourStep]);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('planning.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('planning.subtitle')}</p>
      </header>

      <div
        ref={tabsRef}
        id="tour-planning"
        className={`${tourScrollMarginClass} space-y-5`}
      >
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
    </div>
  );
}
