'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState, MealPlan } from '@/lib/types';
import { MEAL_FIELDS, mealPlanEquals } from '@/lib/intake';
import { MealMacroFields } from '@/components/MacroDisplay';
import { getLatestWeight } from '@/lib/weight';
import { SaveBar } from './SaveBar';

interface IntakePanelProps {
  state: AppState;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

function MealPlanForm({
  title,
  color,
  plan,
  weightKg,
  onChange,
}: {
  title: string;
  color: 'low' | 'high';
  plan: MealPlan;
  weightKg: number | null;
  onChange: (field: keyof MealPlan, value: string) => void;
}) {
  const accent =
    color === 'low' ? 'border-low/30 focus:ring-low/30' : 'border-high/30 focus:ring-high/30';
  const badge =
    color === 'low' ? 'bg-low-light text-low-dark' : 'bg-high-light text-high-dark';

  return (
    <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <span className={`rounded-full px-4 py-2 text-base font-extrabold ${badge}`}>{title}</span>
      </div>

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
  const [draftLow, setDraftLow] = useState(state.intakeLow);
  const [draftHigh, setDraftHigh] = useState(state.intakeHigh);

  const weightKg = useMemo(() => getLatestWeight(state.weightLog), [state.weightLog]);

  const dirty =
    !mealPlanEquals(draftLow, state.intakeLow) ||
    !mealPlanEquals(draftHigh, state.intakeHigh);

  useEffect(() => {
    if (!dirty) {
      setDraftLow(state.intakeLow);
      setDraftHigh(state.intakeHigh);
    }
  }, [state.intakeLow, state.intakeHigh, dirty]);

  function handleSave() {
    onUpdate((prev) => ({
      ...prev,
      intakeLow: { ...draftLow },
      intakeHigh: { ...draftHigh },
    }));
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">摄入要求</h2>
        <p className="mt-4 text-sm text-ink-muted">
          按餐次填写吃什么、吃多少，修改后点击保存。
          {weightKg && (
            <span className="text-ink-faint">  (按最近体重 {weightKg} kg 计算 g/kg)</span>
          )}
        </p>
      </header>

      <MealPlanForm
        title="低碳日 (Day 1-3)"
        color="low"
        plan={draftLow}
        weightKg={weightKg}
        onChange={(field, value) => setDraftLow((p) => ({ ...p, [field]: value }))}
      />
      <MealPlanForm
        title="高碳日 (Day 4)"
        color="high"
        plan={draftHigh}
        weightKg={weightKg}
        onChange={(field, value) => setDraftHigh((p) => ({ ...p, [field]: value }))}
      />

      <SaveBar
        dirty={dirty}
        saving={cloudSyncing}
        lastSavedAt={lastSavedAt}
        saveError={cloudSaveError}
        onSave={handleSave}
      />
    </div>
  );
}
