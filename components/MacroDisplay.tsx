'use client';

import type { MealPlan } from '@/lib/types';
import { macroPerKgLabel } from '@/lib/macros';
import { MACRO_FIELDS, MEAL_FIELDS } from '@/lib/intake';
import { useT } from '@/lib/i18n';

export function MacroPerKgHint({
  plan,
  weightKg,
}: {
  plan: MealPlan;
  weightKg: number | null;
}) {
  const t = useT();

  if (!weightKg) {
    return (
      <p className="mt-2 text-xs text-ink-faint">{t('macro.needWeight')}</p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {MACRO_FIELDS.map(({ key, labelKey }) => {
        const perKg = macroPerKgLabel(plan[key], weightKg);
        if (!perKg) return null;
        return (
          <span
            key={key}
            className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-muted"
          >
            {t(labelKey)} {perKg}
          </span>
        );
      })}
    </div>
  );
}

export function MealMacroFields({
  plan,
  weightKg,
  accent,
  onChange,
  color
}: {
  plan: MealPlan;
  weightKg: number | null;
  accent: string;
  onChange: (field: keyof MealPlan, value: string) => void;
  color: 'low' | 'high';
}) {
  const t = useT();

  return (
    <div className="mt-5 border-t border-ink/5 pt-5">
      <p className="mb-3 text-xs font-semibold text-ink-muted">{t('macro.targets')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MACRO_FIELDS.map(({ key, labelKey, placeholderKey }) => {
          const perKg = macroPerKgLabel(plan[key], weightKg);
          return (
            <label key={key} className="block">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-ink-muted">{t(labelKey)}</span>
                {perKg && (
                  <span className={`shrink-0 text-base font-extrabold rounded-full px-4 py-0.5 ${color === 'low' ? 'text-low-dark bg-low-light' : 'text-high-dark bg-high-light'}`}>
                    {perKg}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={plan[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={t(placeholderKey)}
                className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus-visible:ring-2 ${accent}`}
              />
            </label>
          );
        })}
      </div>
      <MacroPerKgHint plan={plan} weightKg={weightKg} />
    </div>
  );
}

export { MEAL_FIELDS };
