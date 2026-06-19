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
