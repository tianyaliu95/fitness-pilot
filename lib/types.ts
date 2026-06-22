export type CarbType = 'low' | 'high';

export interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  proteinPowder: string;
  nuts: string;
  protein: string;
  carbs: string;
  fat: string;
  notes: string;
}

export interface CycleDayTemplate {
  dayIndex: number;
  carbType: CarbType;
  workout: string;
  label: string;
}

/** Frozen cycle assignment for a past date (survives anchor resets) */
export interface HistoricalDaySnapshot {
  cycleDayIndex: number;
  carbType: CarbType;
  workout: string;
  label: string;
  isDelayed: boolean;
}

export type HistoricalDays = Record<string, HistoricalDaySnapshot>;

/** date (YYYY-MM-DD) → weight in kg */
export type WeightLog = Record<string, string>;

/** yes = 按计划完成, no = 未完成, unknown = 未选择或已重置 */
export type TrainingStatus = 'yes' | 'no' | 'unknown';

export interface TrainingLogEntry {
  completed: TrainingStatus;
  notes: string;
}

/** date (YYYY-MM-DD) → training log */
export type TrainingLog = Record<string, TrainingLogEntry>;

export interface UserProfile {
  name: string;
  age: string;
  /** height in cm */
  height: string;
}

export interface AppState {
  anchorDate: string;
  /** ISO date — calendar cycle styling starts here; empty = all dates active */
  cycleStartDate: string;
  delayedDates: string[];
  /** Past dates frozen on cycle reset — carb/workout unchanged */
  historicalDays: HistoricalDays;
  intakeLow: MealPlan;
  intakeHigh: MealPlan;
  cycleDays: CycleDayTemplate[];
  weightLog: WeightLog;
  trainingLog: TrainingLog;
  profile: UserProfile;
}

export interface DayInfo {
  date: string;
  cycleDayIndex: number;
  cycleLength: number;
  carbType: CarbType;
  workout: string;
  label: string;
  intake: MealPlan;
  weight: string | null;
  isToday: boolean;
  isDelayed: boolean;
  /** On/after cycleStartDate — show carb/workout styling */
  isCycleActive: boolean;
  /** Recorded training marked 否 */
  trainingIncomplete: boolean;
  /** Recorded training marked 是 */
  trainingComplete: boolean;
}
