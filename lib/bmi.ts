/** WHO adult BMI classification */
export type BmiCategoryId = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BmiCategory {
  id: BmiCategoryId;
  label: string;
  description: string;
  color: string;
}

export const BMI_GAUGE_MIN = 15;
export const BMI_GAUGE_MAX = 35;

const CATEGORIES: Array<{
  id: BmiCategoryId;
  min: number;
  max: number;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: 'underweight',
    min: 0,
    max: 18.5,
    label: '偏瘦',
    description: 'BMI 低于正常范围',
    color: '#5b8def',
  },
  {
    id: 'normal',
    min: 18.5,
    max: 25,
    label: '正常',
    description: '体重在健康范围内',
    color: '#34d399',
  },
  {
    id: 'overweight',
    min: 25,
    max: 30,
    label: '超重',
    description: '略高于健康范围',
    color: '#f59e42',
  },
  {
    id: 'obese',
    min: 30,
    max: Infinity,
    label: '肥胖',
    description: '明显高于健康范围',
    color: '#ef4444',
  },
];

/** BMI = weight(kg) / height(m)² — WHO standard */
export function calculateBmi(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function parsePositiveNumber(value: string): number | null {
  const n = parseFloat(value.trim());
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export function getBmiCategory(bmi: number): BmiCategory {
  const match =
    CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ??
    CATEGORIES[CATEGORIES.length - 1];
  return {
    id: match.id,
    label: match.label,
    description: match.description,
    color: match.color,
  };
}

export function formatBmi(bmi: number): string {
  return bmi.toFixed(1);
}

export function bmiToGaugeAngle(bmi: number): number {
  const clamped = Math.min(BMI_GAUGE_MAX, Math.max(BMI_GAUGE_MIN, bmi));
  const t = (clamped - BMI_GAUGE_MIN) / (BMI_GAUGE_MAX - BMI_GAUGE_MIN);
  // SVG: 180° = left, 270° = up, 360°/0° = right (arc opens upward)
  return 180 + t * 180;
}

export const BMI_GAUGE_SEGMENTS = [
  { from: 15, to: 18.5, color: '#5b8def' },
  { from: 18.5, to: 25, color: '#34d399' },
  { from: 25, to: 30, color: '#f59e42' },
  { from: 30, to: 35, color: '#ef4444' },
] as const;
