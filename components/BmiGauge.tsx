'use client';

import {
  BMI_GAUGE_MAX,
  BMI_GAUGE_MIN,
  BMI_GAUGE_SEGMENTS,
  bmiToGaugeAngle,
  formatBmi,
  type BmiCategory,
} from '@/lib/bmi';

interface BmiGaugeProps {
  bmi: number | null;
  category: BmiCategory | null;
}

const CX = 140;
const CY = 128;
const R = 96;
const STROKE = 16;
const MARKER_OVERHANG = 5;

const SCALE_LABELS = [
  { label: '偏瘦', bmi: 16.5 },
  { label: '正常', bmi: 21.5 },
  { label: '超重', bmi: 27.5 },
  { label: '肥胖', bmi: 32.5 },
] as const;

function polar(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function bmiToDeg(bmi: number): number {
  const clamped = Math.min(BMI_GAUGE_MAX, Math.max(BMI_GAUGE_MIN, bmi));
  const t = (clamped - BMI_GAUGE_MIN) / (BMI_GAUGE_MAX - BMI_GAUGE_MIN);
  return 180 + t * 180;
}

/** Arc along the upper semicircle (clockwise from left → top → right). */
function arcPath(startDeg: number, endDeg: number, radius: number): string {
  const start = polar(startDeg, radius);
  const end = polar(endDeg, radius);
  const sweep = 1;
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

/** Short bar on the arc, radial (perpendicular to the arc tangent). */
function ArcMarker({ deg, color }: { deg: number; color: string }) {
  const inner = polar(deg, R - STROKE / 2 - MARKER_OVERHANG);
  const outer = polar(deg, R + STROKE / 2 + MARKER_OVERHANG);

  return (
    <line
      x1={inner.x}
      y1={inner.y}
      x2={outer.x}
      y2={outer.y}
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  );
}

export function BmiGauge({ bmi, category }: BmiGaugeProps) {
  const hasBmi = bmi !== null && category !== null;
  const markerDeg = hasBmi ? bmiToGaugeAngle(bmi) : null;

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative">
        <svg
          viewBox="0 0 280 150"
          className="w-full"
          role="img"
          aria-label={hasBmi ? `BMI ${formatBmi(bmi)}，${category.label}` : 'BMI 暂无数据'}
        >
          {/* background track */}
          <path
            d={arcPath(180, 360, R)}
            fill="none"
            stroke="#ebe8e3"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* colored zones */}
          {BMI_GAUGE_SEGMENTS.map((seg) => (
            <path
              key={`${seg.from}-${seg.to}`}
              d={arcPath(bmiToDeg(seg.from), bmiToDeg(seg.to), R)}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              opacity={0.95}
            />
          ))}

          {/* round caps on outer ends */}
          <circle cx={polar(180, R).x} cy={polar(180, R).y} r={STROKE / 2} fill="#5b8def" />
          <circle cx={polar(360, R).x} cy={polar(360, R).y} r={STROKE / 2} fill="#ef4444" />

          {/* BMI marker — radial tick on the arc */}
          {markerDeg !== null && category && (
            <ArcMarker deg={markerDeg} color={category.color} />
          )}
        </svg>

        {/* center readout — sits inside the arc */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-8 flex flex-col items-center justify-end pb-1">
          {hasBmi ? (
            <>
              <p className="text-[2.75rem] font-extrabold leading-none tracking-tight text-ink mb-6">
                {formatBmi(bmi)}
              </p>
              {/* <p
                className="mt-2 text-lg font-bold"
                style={{ color: category.color }}
              >
                {category.label}
              </p> */}
              {/* <p className="mt-0.5 text-xs text-ink-muted">{category.description}</p> */}
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-ink-faint">—</p>
              <p className="mt-2 mb-4 text-sm text-ink-muted">填写身高并记录体重</p>
            </>
          )}
        </div>
      </div>

      {/* scale labels */}
      <div className="mt-1 flex justify-between px-8 text-sm font-medium text-ink-faint items-center">
        {SCALE_LABELS.map(({ label }) => {
          const active = category?.label === label;
          return (
            <span
              key={label}
              className={active ? 'font-extrabold text-xl' : undefined}
              style={active ? { color: category.color } : undefined}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
