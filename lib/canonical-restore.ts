import type { AppState, TrainingLog, WeightLog } from './types';
import { mergeState } from './cycle';

export const RESTORE_USER_EMAIL = 'tianyaliu1995@gmail.com';

/** Authoritative backup from Firebase payload.state (2026-06). */
export const CANONICAL_RESTORE: AppState = mergeState({
  anchorDate: '2026-06-19',
  cycleStartDate: '2026-06-15',
  delayedDates: ['2026-06-20'],
  historicalDays: {},
  cycleDays: [
    { dayIndex: 0, carbType: 'low', workout: '练胸', label: 'Day 1' },
    { dayIndex: 1, carbType: 'low', workout: '练背', label: 'Day 2' },
    { dayIndex: 2, carbType: 'low', workout: '休息', label: 'Day 3' },
    { dayIndex: 3, carbType: 'high', workout: '肩+腿', label: 'Day 4' },
  ],
  profile: { name: 'Tianya Liu', age: '30', height: '186' },
  intakeLow: {
    breakfast: '蛋白酸奶 * 1',
    lunch: '鸡胸 * 2 + 鸡蛋 * 2 + 蔬菜 + 香蕉 * 1',
    dinner: '牛肉 * 2 + 鸡蛋 * 1 + 蔬菜 + 香蕉 * 1',
    proteinPowder: '1勺',
    nuts: '半小把',
    protein: '160 g',
    carbs: '100 g',
    fat: '60 g',
    notes: '保证蛋白摄入, 压低碳水',
  },
  intakeHigh: {
    breakfast: '蛋白酸奶 x1',
    lunch: '鸡胸 * 1 + 蔬菜 + 400g 米饭（1大碗）',
    dinner: '牛肉 * 1 + 蔬菜 + 400g 米饭（1大碗）',
    proteinPowder: '❌',
    nuts: '❌ ',
    protein: '100 g',
    carbs: '300 g',
    fat: '30 g',
    notes: '',
  },
  trainingLog: {
    '2026-06-15': { completed: 'yes', notes: '照常完成, 50lb哑铃冲了两组*8' },
    '2026-06-16': { completed: 'yes', notes: '引体+平拉+榨二头' },
    '2026-06-17': { completed: 'yes', notes: '🏀+练腹' },
    '2026-06-18': { completed: 'yes', notes: '肩+凯谭三分化的臀腿跟练' },
    '2026-06-19': { completed: 'yes', notes: '在家俯卧撑+夹胸; 下胸为主; 中量' },
    '2026-06-20': { completed: 'no', notes: '出门玩, 放纵餐pizza+姜虎东' },
    '2026-06-21': { completed: 'yes', notes: '引体向上+高位下拉+拉背+二头*3个动作' },
    '2026-06-22': { completed: 'no', notes: '' },
  },
  weightLog: {
    '2026-05-10': '88',
    '2026-06-13': '87.2',
    '2026-06-14': '86',
    '2026-06-15': '86',
    '2026-06-16': '86',
    '2026-06-17': '86',
    '2026-06-18': '86',
    '2026-06-19': '85.8',
    '2026-06-21': '86.5',
  },
});

export function isRestoreUser(email: string | null | undefined): boolean {
  return email?.toLowerCase() === RESTORE_USER_EMAIL;
}

function fillMissingTrainingLog(canonical: TrainingLog, cloud: TrainingLog): TrainingLog {
  const result = { ...cloud };
  for (const [date, entry] of Object.entries(canonical)) {
    if (!(date in result)) {
      result[date] = entry;
    }
  }
  return result;
}

function fillMissingWeightLog(canonical: WeightLog, cloud: WeightLog): WeightLog {
  const result = { ...cloud };
  for (const [date, weight] of Object.entries(canonical)) {
    if (!(date in result)) {
      result[date] = weight;
    }
  }
  return result;
}

/** Only fill dates missing from cloud — never overwrite existing entries. */
export function applyCanonicalFloor(cloud: AppState | null): AppState {
  if (!cloud) return CANONICAL_RESTORE;

  return mergeState({
    ...CANONICAL_RESTORE,
    ...cloud,
    cycleStartDate: cloud.cycleStartDate || CANONICAL_RESTORE.cycleStartDate,
    profile: cloud.profile.name.trim() ? cloud.profile : CANONICAL_RESTORE.profile,
    trainingLog: fillMissingTrainingLog(CANONICAL_RESTORE.trainingLog, cloud.trainingLog),
    weightLog: fillMissingWeightLog(CANONICAL_RESTORE.weightLog, cloud.weightLog),
  });
}

export function trainingLogNeedsRepair(cloud: AppState | null): boolean {
  if (!cloud) return true;
  return Object.keys(cloud.trainingLog).length === 0;
}
