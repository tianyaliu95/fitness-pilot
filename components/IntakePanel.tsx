'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, MealPlan } from '@/lib/types';
import { MEAL_FIELDS, mealPlanEquals } from '@/lib/intake';
import { MealMacroFields } from '@/components/MacroDisplay';
import { getLatestWeight } from '@/lib/weight';
import { useT } from '@/lib/i18n';
import { SaveBar } from './SaveBar';
import { TabBar, tabPanelProps } from './TabBar';
import {
  tourScrollMarginClass,
  useOnboardingStep,
  useScrollTourTarget,
} from './Onboarding';

interface IntakePanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

type IntakeTab = 'low' | 'high';

function MealPlanForm({
  color,
  plan,
  weightKg,
  onChange,
}: {
  color: 'low' | 'high';
  plan: MealPlan;
  weightKg: number | null;
  onChange: (field: keyof MealPlan, value: string) => void;
}) {
  const t = useT();
  const accent =
    color === 'low' ? 'border-low/30 focus-visible:ring-low/40' : 'border-high/30 focus-visible:ring-high-dark/40';

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6">
      <div className="space-y-3">
        {MEAL_FIELDS.map(({ key, labelKey }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-ink-muted">{t(labelKey)}</span>
            <input
              type="text"
              value={plan[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-base text-ink outline-none transition focus-visible:ring-2 ${accent}`}
            />
          </label>
        ))}
      </div>

      <MealMacroFields
        plan={plan}
        weightKg={weightKg}
        accent={accent}
        onChange={onChange}
        color={color}
      />

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-medium text-ink-muted">{t('intake.notes')}</span>
        <textarea
          value={plan.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder={t('intake.notesPlaceholder')}
          rows={2}
          className={`w-full resize-none rounded-xl border bg-surface px-3 py-2.5 text-base text-ink outline-none transition focus-visible:ring-2 ${accent}`}
        />
      </label>
    </div>
  );
}

export function IntakePanel({
  state,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
}: IntakePanelProps) {
  const t = useT();
  const highlight = useOnboardingStep() === 'intake';
  const titleRef = useRef<HTMLDivElement>(null);
  useScrollTourTarget(highlight, titleRef, 160, 4);
  const [tab, setTab] = useState<IntakeTab>('low');
  const [draftLow, setDraftLow] = useState(state.intakeLow);
  const [draftHigh, setDraftHigh] = useState(state.intakeHigh);

  const weightKg = useMemo(() => getLatestWeight(state.weightLog), [state.weightLog]);

  const lowDirty = !mealPlanEquals(draftLow, state.intakeLow);
  const highDirty = !mealPlanEquals(draftHigh, state.intakeHigh);

  useEffect(() => {
    if (!lowDirty) setDraftLow(state.intakeLow);
  }, [state.intakeLow, lowDirty]);

  useEffect(() => {
    if (!highDirty) setDraftHigh(state.intakeHigh);
  }, [state.intakeHigh, highDirty]);

  function handleSaveLow() {
    onUpdate((prev) => ({ ...prev, intakeLow: { ...draftLow } }));
  }

  function handleSaveHigh() {
    onUpdate((prev) => ({ ...prev, intakeHigh: { ...draftHigh } }));
  }

  return (
    <div className="space-y-5">
      <div
        ref={titleRef}
        id="tour-intake"
        className={tourScrollMarginClass}
      >
        <header>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('intake.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t('intake.subtitle')}
            {weightKg && t('intake.weightBasis', { weight: weightKg })}
          </p>
        </header>
      </div>

      <TabBar
        idPrefix="intake"
        aria-label={t('intake.ariaTabs')}
        variant="carb"
        tabs={[
          { id: 'low', label: t('intake.tabLow'), dirty: lowDirty, tone: 'low' },
          { id: 'high', label: t('intake.tabHigh'), dirty: highDirty, tone: 'high' },
        ]}
        activeId={tab}
        onChange={(id) => setTab(id as IntakeTab)}
      />

      <div {...tabPanelProps('intake', 'low', tab, 'space-y-5')}>
        <MealPlanForm
          color="low"
          plan={draftLow}
          weightKg={weightKg}
          onChange={(field, value) => setDraftLow((p) => ({ ...p, [field]: value }))}
        />
        <SaveBar
          dirty={lowDirty}
          saving={cloudSyncing}
          lastSavedAt={lastSavedAt}
          saveError={cloudSaveError}
          onSave={handleSaveLow}
        />
      </div>

      <div {...tabPanelProps('intake', 'high', tab, 'space-y-5')}>
        <MealPlanForm
          color="high"
          plan={draftHigh}
          weightKg={weightKg}
          onChange={(field, value) => setDraftHigh((p) => ({ ...p, [field]: value }))}
        />
        <SaveBar
          dirty={highDirty}
          saving={cloudSyncing}
          lastSavedAt={lastSavedAt}
          saveError={cloudSaveError}
          onSave={handleSaveHigh}
        />
      </div>
    </div>
  );
}
