export interface GramRange {
  min: number;
  max: number;
}

/** Parse "150-170g" or "160" into a gram range */
export function parseGramRange(value: string): GramRange | null {
  const nums = value.match(/\d+(\.\d+)?/g)?.map(Number);
  if (!nums?.length) return null;
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/** e.g. "1.8 g/kg" or "1.7-2.0 g/kg" */
export function formatGramsPerKg(range: GramRange, weightKg: number): string {
  if (weightKg <= 0) return '';
  const lo = range.min / weightKg;
  const hi = range.max / weightKg;
  if (Math.abs(lo - hi) < 0.05) return `${lo.toFixed(1)} g/kg`;
  return `${lo.toFixed(1)}–${hi.toFixed(1)} g/kg`;
}

export function macroPerKgLabel(
  macroValue: string,
  weightKg: number | null
): string | null {
  if (!weightKg) return null;
  const range = parseGramRange(macroValue);
  if (!range) return null;
  return formatGramsPerKg(range, weightKg);
}
