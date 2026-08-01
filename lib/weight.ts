import type { WeightLog } from './types';
import { addDays, diffDays } from './cycle';

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

/** Calendar tick dates (day 1 / 10 / 20) within [startIso, endIso]. */
export function monthThirdMarkers(startIso: string, endIso: string): string[] {
  if (!startIso || !endIso || startIso > endIso) return [];

  const markers: string[] = [];
  const [sy, sm] = startIso.split('-').map(Number);
  const [ey, em] = endIso.split('-').map(Number);

  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    for (const day of [1, 10, 20]) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (iso >= startIso && iso <= endIso) markers.push(iso);
    }
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return markers;
}

/** Keep first/last; thin middle markers when too many. Prefer month starts. */
export function thinDateMarkers(markers: string[], maxLabels: number): string[] {
  if (markers.length <= maxLabels) return markers;
  if (maxLabels <= 2) return [markers[0], markers[markers.length - 1]];

  const firsts = markers.filter((d) => d.endsWith('-01'));
  if (firsts.length >= 2 && firsts.length <= maxLabels) {
    return firsts;
  }

  const picked: string[] = [];
  for (let i = 0; i < maxLabels; i++) {
    const idx = Math.round((i / (maxLabels - 1)) * (markers.length - 1));
    picked.push(markers[idx]);
  }
  return [...new Set(picked)];
}

function niceDayStep(roughDays: number): number {
  const steps = [1, 2, 3, 4, 5, 7, 10, 14, 15, 20, 30, 45, 60];
  const rough = Math.max(roughDays, 0.5);
  for (const s of steps) {
    if (s >= rough * 0.9) return s;
  }
  return 60;
}

/**
 * X-axis labels that stay roughly `targetCount` dense for any zoom level.
 * Zoomed-in → daily/few-day ticks; zoomed-out → 1/10/20 or thinned.
 */
export function dynamicXMarkers(
  startIso: string,
  endIso: string,
  targetCount: number
): string[] {
  if (!startIso || !endIso || startIso > endIso) return [];
  if (startIso === endIso) return [startIso];

  const span = Math.max(diffDays(startIso, endIso), 1);
  const target = Math.max(4, Math.min(targetCount, 10));

  // Wide window: calendar thirds keep labels readable
  if (span >= 75) {
    const calendar = monthThirdMarkers(startIso, endIso);
    const base =
      calendar.length >= 2 ? calendar : [startIso, ...calendar, endIso];
    return thinDateMarkers([...new Set(base)].sort(), target);
  }

  const step = niceDayStep(span / (target - 1));
  const markers: string[] = [];
  for (let d = 0; d <= span; d += step) {
    markers.push(addDays(startIso, d));
  }

  const last = markers[markers.length - 1];
  const gapToEnd = diffDays(last, endIso);
  if (gapToEnd > 0) {
    // Snap/replace last tick with end if close; otherwise append end
    if (gapToEnd <= step * 0.45 && markers.length > 1) {
      markers[markers.length - 1] = endIso;
    } else {
      markers.push(endIso);
    }
  }

  if (markers.length > target + 1) {
    return thinDateMarkers(markers, target);
  }

  // Too sparse (e.g. awkward step) — fill with a finer step
  if (markers.length < Math.min(4, target) && step > 1) {
    const finer = niceDayStep(span / Math.max(target, 5));
    if (finer < step) {
      return dynamicXMarkersWithStep(startIso, endIso, finer, target);
    }
  }

  return markers;
}

function dynamicXMarkersWithStep(
  startIso: string,
  endIso: string,
  step: number,
  target: number
): string[] {
  const span = Math.max(diffDays(startIso, endIso), 1);
  const markers: string[] = [];
  for (let d = 0; d <= span; d += step) {
    markers.push(addDays(startIso, d));
  }
  if (markers[markers.length - 1] !== endIso) {
    markers.push(endIso);
  }
  return markers.length > target + 1
    ? thinDateMarkers(markers, target)
    : markers;
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
