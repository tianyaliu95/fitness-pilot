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

/** date (YYYY-MM-DD) → weight in kg */
export type WeightLog = Record<string, string>;

export interface AppState {
  anchorDate: string;
  delayedDates: string[];
  intakeLow: MealPlan;
  intakeHigh: MealPlan;
  cycleDays: CycleDayTemplate[];
  weightLog: WeightLog;
}

export interface DayInfo {
  date: string;
  cycleDayIndex: number;
  carbType: CarbType;
  workout: string;
  label: string;
  intake: MealPlan;
  weight: string | null;
  isToday: boolean;
  isDelayed: boolean;
}
