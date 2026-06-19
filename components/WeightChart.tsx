'use client';

import type { WeightPoint } from '@/lib/weight';
import { formatShortDate } from '@/lib/weight';

interface WeightChartProps {
  data: WeightPoint[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) return null;

  const W = 400;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const span = maxW - minW || 1;
  const yMin = minW - span * 0.1;
  const yMax = maxW + span * 0.1;
  const ySpan = yMax - yMin;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? pad.left + innerW / 2
        : pad.left + (i / (data.length - 1)) * innerW;
    const y = pad.top + innerH - ((d.weight - yMin) / ySpan) * innerH;
    return { ...d, x, y };
  });

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

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
                x1={pad.left}
                y1={y}
                x2={W - pad.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <text
                x={pad.left - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-ink-faint text-[9px]"
              >
                {tick.toFixed(1)}
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

        {points.map((p) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r={4} className="fill-low" />
            <text
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              className="fill-ink-faint text-[9px]"
            >
              {formatShortDate(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
