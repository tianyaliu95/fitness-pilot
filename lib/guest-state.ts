import type { AppState, CycleDayTemplate, MealPlan } from './types';
import { addDays, getDefaultState, todayISO } from './cycle';
import type { Locale } from './i18n/locale';

const CYCLE_DAYS_ZH: CycleDayTemplate[] = [
  { dayIndex: 0, carbType: 'low', workout: '练胸', label: 'Day 1' },
  { dayIndex: 1, carbType: 'low', workout: '练背', label: 'Day 2' },
  { dayIndex: 2, carbType: 'low', workout: '休息 / 篮球 / 有氧', label: 'Day 3' },
  { dayIndex: 3, carbType: 'high', workout: '练肩 + 练腿', label: 'Day 4' },
];

const CYCLE_DAYS_EN: CycleDayTemplate[] = [
  { dayIndex: 0, carbType: 'low', workout: 'Chest', label: 'Day 1' },
  { dayIndex: 1, carbType: 'low', workout: 'Back', label: 'Day 2' },
  { dayIndex: 2, carbType: 'low', workout: 'Rest / Basketball / Cardio', label: 'Day 3' },
  { dayIndex: 3, carbType: 'high', workout: 'Shoulders + Legs', label: 'Day 4' },
];

const MEAL_LOW_ZH: MealPlan = {
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

const MEAL_HIGH_ZH: MealPlan = {
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

const MEAL_LOW_EN: MealPlan = {
  breakfast: 'Protein yogurt ×1',
  lunch: '2 chicken breasts + 2 eggs + veggies + 100g rice (¼ bowl)',
  dinner: '2 beef portions + 2 eggs + veggies + 100g rice (¼ bowl)',
  proteinPowder: '1 scoop',
  nuts: 'Small handful (or every other day)',
  protein: '150-170g',
  carbs: '100-130g',
  fat: '50-65g',
  notes: '',
};

const MEAL_HIGH_EN: MealPlan = {
  breakfast: 'Protein yogurt ×1 + 1 banana',
  lunch: '2 chicken breasts + veggies + 400g rice (1 bowl)',
  dinner: '2 beef portions + veggies + 400g rice (1 bowl)',
  proteinPowder: '1 scoop',
  nuts: 'Skip',
  protein: '100-115g',
  carbs: '320-360g',
  fat: '20-30g',
  notes: '',
};

/**
 * In-memory demo data for logged-out browsing.
 * Never persisted to localStorage or Firestore.
 */
export function getGuestPlaceholderState(locale: Locale = 'en'): AppState {
  const today = todayISO();
  const start = addDays(today, -10);
  const isZh = locale === 'zh';

  return {
    ...getDefaultState(),
    locale,
    anchorDate: start,
    cycleStartDate: start,
    cycleDays: (isZh ? CYCLE_DAYS_ZH : CYCLE_DAYS_EN).map((d) => ({ ...d })),
    intakeLow: { ...(isZh ? MEAL_LOW_ZH : MEAL_LOW_EN) },
    intakeHigh: { ...(isZh ? MEAL_HIGH_ZH : MEAL_HIGH_EN) },
    profile: {
      name: isZh ? '访客（演示）' : 'Alex (Demo)',
      age: '28',
      height: '175',
    },
    weightLog: {
      [addDays(today, -11)]: '80.0',
      [addDays(today, -10)]: '79.8',
      [addDays(today, -9)]: '79.5',
      [addDays(today, -8)]: '78.5',
      [addDays(today, -7)]: '78.9',
      [addDays(today, -6)]: '78.2',
      [addDays(today, -5)]: '77.9',
      [addDays(today, -4)]: '78.5',
      [addDays(today, -3)]: '77.9',
      [addDays(today, -2)]: '77.5',
      [addDays(today, -1)]: '76.8',
    },
    trainingLog: {
      [addDays(today, -4)]: {
        completed: 'yes',
        notes: isZh ? '演示：练胸已完成' : 'Demo: chest day done',
      },
      [addDays(today, -3)]: {
        completed: 'yes',
        notes: isZh ? '演示：练背已完成' : 'Demo: back day done',
      },
      [addDays(today, -2)]: {
        completed: 'no',
        notes: isZh ? '演示：休息日' : 'Demo: rest day',
      },
    },
  };
}
