'use client';

import { useEffect, useMemo, useState } from 'react';
import { diffDays } from '@/lib/cycle';
import { formatDisplayDate } from '@/lib/day-info';
import type { WeightPoint } from '@/lib/weight';
import {
  formatShortDate,
  monthThirdMarkers,
  niceWeightYDomain,
  thinDateMarkers,
} from '@/lib/weight';

interface WeightChartProps {
  data: WeightPoint[];
}

interface ChartPoint extends WeightPoint {
  x: number;
  y: number;
}

function useMaxXLabels(): number {
  const [max, setMax] = useState(5);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setMax(mq.matches ? 10 : 5);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return max;
}

export function WeightChart({ data }: WeightChartProps) {
  const maxLabels = useMaxXLabels();
  const [active, setActive] = useState<ChartPoint | null>(null);

  const domain = useMemo(() => {
    if (data.length === 0) return null;
    const startIso = data[0].date;
    const endIso = data[data.length - 1].date;
    const daySpan = Math.max(diffDays(startIso, endIso), 1);
    const calendar = monthThirdMarkers(startIso, endIso);
    const markers = thinDateMarkers(
      calendar.length > 0 ? calendar : [startIso, endIso],
      maxLabels
    );
    return { startIso, endIso, daySpan, markers };
  }, [data, maxLabels]);

  if (data.length === 0 || !domain) return null;

  const { startIso, daySpan, markers } = domain;
  const W = 400;
  const H = 200;
  const pad = { top: 16, right: 12, bottom: 36, left: 28 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const { yMin, yMax, ticks: yTicks } = niceWeightYDomain(minW, maxW);
  const ySpan = yMax - yMin;

  function xForDate(iso: string): number {
    if (data.length === 1 || daySpan <= 0) {
      return pad.left + innerW / 2;
    }
    const t = diffDays(startIso, iso) / daySpan;
    return pad.left + Math.min(1, Math.max(0, t)) * innerW;
  }

  const points: ChartPoint[] = data.map((d) => ({
    ...d,
    x: xForDate(d.date),
    y: pad.top + innerH - ((d.weight - yMin) / ySpan) * innerH,
  }));

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const dense = data.length > 12;
  const tipLeftPct = active ? (active.x / W) * 100 : 0;
  const tipTopPct = active ? (active.y / H) * 100 : 0;
  const tipSide =
    tipLeftPct < 18 ? 'start' : tipLeftPct > 82 ? 'end' : 'center';
  const tipTranslateX =
    tipSide === 'start' ? '0%' : tipSide === 'end' ? '-100%' : '-50%';
  const tipAlign =
    tipSide === 'start'
      ? 'items-start'
      : tipSide === 'end'
        ? 'items-end'
        : 'items-center';
  const tipPad =
    tipSide === 'start' ? 'pl-1' : tipSide === 'end' ? 'pr-1' : '';

  return (
    <div
      className="relative w-full overflow-visible"
      onMouseLeave={() => setActive(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[280px]"
        role="img"
        aria-label="体重变化折线图"
      >
        {yTicks.map((tick) => {
          const y = pad.top + innerH - ((tick - yMin) / ySpan) * innerH;
          return (
            <g key={tick}>
              <line
                x1={pad.left + 6}
                y1={y}
                x2={W - pad.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <text
                x={0}
                y={y + 4}
                textAnchor="start"
                className="fill-ink-faint text-[16px] sm:text-[9px]"
              >
                {Number.isInteger(tick) ? String(tick) : tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="stroke-low"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((p) => {
          const isActive = active?.date === p.date;
          const r = dense ? 3 : 4;
          return (
            <g key={p.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill="transparent"
                onMouseEnter={() => setActive(p)}
                onFocus={() => setActive(p)}
                onClick={() => setActive((cur) => (cur?.date === p.date ? null : p))}
              />
              {isActive && (
                <circle cx={p.x} cy={p.y} r={r + 5} className="fill-low/25" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? r + 1.5 : r}
                className={`pointer-events-none transition-[r] ${
                  isActive ? 'fill-low-dark' : 'fill-low'
                }`}
              />
            </g>
          );
        })}

        {markers.map((iso, i) => {
          const x = xForDate(iso);
          const isFirst = i === 0;
          const isLast = i === markers.length - 1;
          return (
            <text
              key={iso}
              x={x}
              y={H - 10}
              textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
              className="fill-ink-faint text-[16px] sm:text-[9px]"
            >
              {formatShortDate(iso)}
            </text>
          );
        })}
      </svg>

      {active && (
        <div
          className={`pointer-events-none absolute z-10 flex flex-col ${tipAlign} ${tipPad}`}
          style={{
            left: `${tipLeftPct}%`,
            top: `${tipTopPct}%`,
            transform: `translate(${tipTranslateX}, calc(-100% - 14px))`,
          }}
        >
          <div className="rounded-2xl border border-ink/5 bg-white/95 px-3.5 py-2.5 shadow-card backdrop-blur-sm">
            <p className="text-[11px] font-medium leading-snug text-ink-muted sm:text-xs">
              {formatDisplayDate(active.date)}
            </p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-extrabold tracking-tight text-ink">
                {active.weight}
              </span>
              <span className="text-xs font-semibold text-ink-faint">kg</span>
            </p>
            <div className="mt-1.5 h-0.5 w-8 rounded-full bg-low/70" />
          </div>
          <div className="mt-[-3px] h-2.5 w-2.5 rotate-45 border-b border-r border-ink/5 bg-white/95 shadow-soft" />
        </div>
      )}
    </div>
  );
}
