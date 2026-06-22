'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState, MealPlan } from '@/lib/types';
import { MEAL_FIELDS, mealPlanEquals } from '@/lib/intake';
import { MealMacroFields } from '@/components/MacroDisplay';
import { getLatestWeight } from '@/lib/weight';
import { SaveBar } from './SaveBar';
import { TabBar } from './TabBar';

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
  const accent =
    color === 'low' ? 'border-low/30 focus:ring-low/30' : 'border-high/30 focus:ring-high/30';

  return (
    <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
      <div className="space-y-3">
        {MEAL_FIELDS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
            <input
              type="text"
              value={plan[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 ${accent}`}
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
        <span className="mb-1 block text-xs font-medium text-ink-muted">备注</span>
        <textarea
          value={plan.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="其他饮食注意事项..."
          rows={2}
          className={`w-full resize-none rounded-xl border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 ${accent}`}
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
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">摄入要求</h2>
        <p className="mt-1 text-sm text-ink-muted">
          按餐次填写吃什么、吃多少，每个 tab 独立保存。
          {weightKg && (
            <span className="text-ink-faint"> 按最近体重 {weightKg} kg 计算 g/kg</span>
          )}
        </p>
      </header>

      <TabBar
        aria-label="摄入日类型"
        tabs={[
          { id: 'low', label: '低碳日', dirty: lowDirty },
          { id: 'high', label: '高碳日', dirty: highDirty },
        ]}
        activeId={tab}
        onChange={(id) => setTab(id as IntakeTab)}
      />

      <div className={tab === 'low' ? 'space-y-5' : 'hidden'} role="tabpanel">
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

      <div className={tab === 'high' ? 'space-y-5' : 'hidden'} role="tabpanel">
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
