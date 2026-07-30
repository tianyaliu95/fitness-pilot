'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WeightPoint } from '@/lib/weight';
import { formatShortDate, niceWeightYDomain } from '@/lib/weight';

interface WeightChartProps {
  data: WeightPoint[];
}

/** Evenly spaced indices including first & last. */
function pickLabelIndices(count: number, maxLabels: number): Set<number> {
  if (count <= maxLabels) {
    return new Set(Array.from({ length: count }, (_, i) => i));
  }

  const indices = new Set<number>([0, count - 1]);
  const inner = maxLabels - 2;
  for (let k = 1; k <= inner; k++) {
    indices.add(Math.round((k / (inner + 1)) * (count - 1)));
  }
  return indices;
}

function useMaxXLabels(): number {
  const [max, setMax] = useState(5);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setMax(mq.matches ? 7 : 4);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return max;
}

export function WeightChart({ data }: WeightChartProps) {
  const maxLabels = useMaxXLabels();
  const labelIndices = useMemo(
    () => pickLabelIndices(data.length, maxLabels),
    [data.length, maxLabels]
  );

  if (data.length === 0) return null;

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

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? pad.left + innerW / 2
        : pad.left + (i / (data.length - 1)) * innerW;
    const y = pad.top + innerH - ((d.weight - yMin) / ySpan) * innerH;
    return { ...d, x, y, index: i };
  });

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const dense = data.length > maxLabels;

  return (
    <div className="w-full overflow-x-auto">
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
          const showLabel = labelIndices.has(p.index);
          return (
            <g key={p.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r={dense ? 3 : 4}
                className="fill-low"
              >
                <title>{`${formatShortDate(p.date)} · ${p.weight} kg`}</title>
              </circle>
              {showLabel && (
                <text
                  x={p.x}
                  y={H - 10}
                  textAnchor={
                    p.index === 0 ? 'start' : p.index === data.length - 1 ? 'end' : 'middle'
                  }
                  className="fill-ink-faint text-[16px] sm:text-[9px]"
                >
                  {formatShortDate(p.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
