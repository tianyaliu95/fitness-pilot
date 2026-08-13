import type { MealPlan } from './types';
import type { MessageKey } from './i18n/en';

export const MEAL_FIELDS: { key: keyof MealPlan; labelKey: MessageKey }[] = [
  { key: 'breakfast', labelKey: 'meal.breakfast' },
  { key: 'lunch', labelKey: 'meal.lunch' },
  { key: 'dinner', labelKey: 'meal.dinner' },
  { key: 'proteinPowder', labelKey: 'meal.proteinPowder' },
  { key: 'nuts', labelKey: 'meal.nuts' },
];

export const MACRO_FIELDS: {
  key: keyof MealPlan;
  labelKey: MessageKey;
  placeholderKey: MessageKey;
}[] = [
  { key: 'protein', labelKey: 'macro.protein', placeholderKey: 'macro.proteinPh' },
  { key: 'carbs', labelKey: 'macro.carbs', placeholderKey: 'macro.carbsPh' },
  { key: 'fat', labelKey: 'macro.fat', placeholderKey: 'macro.fatPh' },
];

export const DEFAULT_MEAL_LOW: MealPlan = {
  breakfast: '蛋白酸奶 x1',
  lunch: '2份鸡胸脯肉 + 2鸡蛋 + 蔬菜 + 100g 米饭（0.25碗）',
  dinner: '2份牛肉 + 2鸡蛋 + 蔬菜 + 100g 米饭（0.25碗）',
  proteinPowder: '1勺',
  nuts: '半小把（或隔天吃）',
  protein: '150-170g',
  carbs: '100-130g',
  fat: '50-65g',
  notes: '',
};

export const DEFAULT_MEAL_HIGH: MealPlan = {
  breakfast: '蛋白酸奶 x1 + 香蕉 1根',
  lunch: '2份鸡胸脯肉 + 蔬菜 + 400g 米饭（1碗）',
  dinner: '2份牛肉 + 蔬菜 + 400g 米饭（1碗）',
  proteinPowder: '1勺',
  nuts: '❌ 不吃',
  protein: '100-115g',
  carbs: '320-360g',
  fat: '20-30g',
  notes: '',
};

export function mealPlanEquals(a: MealPlan, b: MealPlan): boolean {
  return (
    a.breakfast === b.breakfast &&
    a.lunch === b.lunch &&
    a.dinner === b.dinner &&
    a.proteinPowder === b.proteinPowder &&
    a.nuts === b.nuts &&
    a.protein === b.protein &&
    a.carbs === b.carbs &&
    a.fat === b.fat &&
    a.notes === b.notes
  );
}

/** Migrate legacy intake shape (with calories field) to MealPlan */
export function migrateMealPlan(
  raw: Partial<MealPlan> & { calories?: string } | undefined,
  defaults: MealPlan
): MealPlan {
  if (!raw) return { ...defaults };

  if ('breakfast' in raw && raw.breakfast !== undefined) {
    return { ...defaults, ...raw };
  }

  return {
    ...defaults,
    protein: raw.protein ?? defaults.protein,
    carbs: raw.carbs ?? defaults.carbs,
    fat: raw.fat ?? defaults.fat,
    notes: raw.notes ?? defaults.notes,
  };
}
