import type { WeightLog } from './types';

export interface WeightPoint {
  date: string;
  weight: number;
}

export function getWeightSeries(weightLog: WeightLog): WeightPoint[] {
  return Object.entries(weightLog)
    .map(([date, w]) => ({ date, weight: parseFloat(w) }))
    .filter((p) => !Number.isNaN(p.weight) && p.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getLatestWeight(weightLog: WeightLog): number | null {
  const series = getWeightSeries(weightLog);
  if (!series.length) return null;
  return series[series.length - 1].weight;
}

export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

/** Pick a 1/2/5 × 10^n step for chart axes. */
function niceStep(rough: number): number {
  const safe = Math.max(rough, 1e-6);
  const exp = Math.floor(Math.log10(safe));
  const mag = 10 ** exp;
  const norm = safe / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

/**
 * Expand data min/max into a roomier Y domain snapped to nice round ticks.
 * e.g. 82.8–88.5 → about 80–90 (not hardcoded).
 */
export function niceWeightYDomain(
  minWeight: number,
  maxWeight: number,
  tickCount = 4
): { yMin: number; yMax: number; step: number; ticks: number[] } {
  const lo = Math.min(minWeight, maxWeight);
  const hi = Math.max(minWeight, maxWeight);
  const span = Math.max(hi - lo, 0.5);
  // ~25% of span each side, at least 1.5 kg — opens the chart without hugging data
  const pad = Math.max(span * 0.25, 1.5);
  const paddedLo = lo - pad;
  const paddedHi = hi + pad;
  const step = niceStep((paddedHi - paddedLo) / Math.max(tickCount - 1, 1));

  let yMin = Math.floor(paddedLo / step) * step;
  let yMax = Math.ceil(paddedHi / step) * step;
  if (yMin > lo) yMin -= step;
  if (yMax < hi) yMax += step;
  if (yMax <= yMin) yMax = yMin + step;

  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step * 1e-9; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }

  return { yMin, yMax, step, ticks };
}
