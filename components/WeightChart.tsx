'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, diffDays } from '@/lib/cycle';
import { formatDisplayDate } from '@/lib/day-info';
import type { WeightPoint } from '@/lib/weight';
import {
  dynamicXMarkers,
  formatShortDate,
  niceWeightYDomain,
} from '@/lib/weight';

interface WeightChartProps {
  data: WeightPoint[];
}

interface ChartPoint extends WeightPoint {
  x: number;
  y: number;
  day: number;
}

const W = 400;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 36, left: 28 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
/** Keep first/last dots fully inside the plot (avoid edge cutoff). */
const POINT_INSET = 10;
const PLOT_LEFT = PAD.left + POINT_INSET;
const PLOT_WIDTH = INNER_W - POINT_INSET * 2;
const MIN_VIEW_DAYS = 5;

function useMaxXLabels(): number {
  const [max, setMax] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setMax(mq.matches ? 8 : 6);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return max;
}

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

function nearestPoint(points: ChartPoint[], svgX: number): ChartPoint | null {
  if (!points.length) return null;
  let best = points[0];
  let bestDist = Math.abs(points[0].x - svgX);
  for (let i = 1; i < points.length; i++) {
    const d = Math.abs(points[i].x - svgX);
    if (d < bestDist) {
      best = points[i];
      bestDist = d;
    }
  }
  return best;
}

export function WeightChart({ data }: WeightChartProps) {
  const maxLabels = useMaxXLabels();
  const svgRef = useRef<SVGSVGElement>(null);
  const pinchRef = useRef<{
    startDist: number;
    midX: number;
    startLo: number;
    startHi: number;
  } | null>(null);
  const dragRef = useRef<{
    startSvgX: number;
    startLo: number;
    startHi: number;
    pointerId: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const fullStart = data[0]?.date ?? '';
  const fullEnd = data[data.length - 1]?.date ?? '';
  const fullSpan = Math.max(diffDays(fullStart, fullEnd), 1);

  const [view, setView] = useState({ lo: 0, hi: fullSpan });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [active, setActive] = useState<ChartPoint | null>(null);

  useEffect(() => {
    setView({ lo: 0, hi: fullSpan });
    setHoverX(null);
    setActive(null);
  }, [fullStart, fullEnd, fullSpan]);

  const viewStart = addDays(fullStart, view.lo);
  const viewEnd = addDays(fullStart, view.hi);
  const viewSpan = Math.max(view.hi - view.lo, 1);
  const isZoomed = view.lo > 0 || view.hi < fullSpan;

  const markers = useMemo(
    () => dynamicXMarkers(viewStart, viewEnd, maxLabels),
    [viewStart, viewEnd, maxLabels]
  );

  const visibleData = useMemo(() => {
    if (!data.length) return [];
    return data.filter((d) => {
      const day = diffDays(fullStart, d.date);
      return day >= view.lo && day <= view.hi;
    });
  }, [data, fullStart, view.lo, view.hi]);

  /** Y domain stays based on all data — only the time (X) axis zooms/pans. */
  const yDomain = useMemo(() => {
    const weights = data.map((d) => d.weight);
    return niceWeightYDomain(Math.min(...weights), Math.max(...weights));
  }, [data]);

  const { yMin, yMax, ticks: yTicks } = yDomain;
  const ySpan = yMax - yMin;

  const xForDay = useCallback(
    (day: number) => {
      if (viewSpan <= 0) return PLOT_LEFT + PLOT_WIDTH / 2;
      const t = (day - view.lo) / viewSpan;
      return PLOT_LEFT + Math.min(1, Math.max(0, t)) * PLOT_WIDTH;
    },
    [view.lo, viewSpan]
  );

  const xForDate = useCallback(
    (iso: string) => xForDay(diffDays(fullStart, iso)),
    [fullStart, xForDay]
  );

  const points: ChartPoint[] = useMemo(
    () =>
      visibleData.map((d) => {
        const day = diffDays(fullStart, d.date);
        return {
          ...d,
          day,
          x: xForDay(day),
          y: PAD.top + INNER_H - ((d.weight - yMin) / ySpan) * INNER_H,
        };
      }),
    [visibleData, fullStart, xForDay, yMin, ySpan]
  );

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const panBySvgDelta = useCallback(
    (deltaSvgX: number, base: { lo: number; hi: number }) => {
      const span = Math.max(base.hi - base.lo, 1);
      if (span >= fullSpan - 1e-6) return;
      const dayDelta = (-deltaSvgX / PLOT_WIDTH) * span;
      let lo = base.lo + dayDelta;
      let hi = base.hi + dayDelta;
      if (lo < 0) {
        hi -= lo;
        lo = 0;
      }
      if (hi > fullSpan) {
        lo -= hi - fullSpan;
        hi = fullSpan;
      }
      lo = Math.max(0, lo);
      hi = Math.min(fullSpan, hi);
      setView({ lo, hi });
    },
    [fullSpan]
  );

  const zoomAt = useCallback(
    (svgX: number, factor: number, base = viewRef.current) => {
      const baseSpan = Math.max(base.hi - base.lo, 1);
      const plotX = Math.min(PLOT_LEFT + PLOT_WIDTH, Math.max(PLOT_LEFT, svgX));
      const t = (plotX - PLOT_LEFT) / PLOT_WIDTH;
      const anchor = base.lo + t * baseSpan;
      let nextSpan = baseSpan * factor;
      nextSpan = Math.min(fullSpan, Math.max(MIN_VIEW_DAYS, nextSpan));
      let lo = anchor - t * nextSpan;
      let hi = lo + nextSpan;
      if (lo < 0) {
        hi -= lo;
        lo = 0;
      }
      if (hi > fullSpan) {
        lo -= hi - fullSpan;
        hi = fullSpan;
      }
      lo = Math.max(0, lo);
      hi = Math.min(fullSpan, hi);
      if (hi - lo < MIN_VIEW_DAYS) {
        hi = Math.min(fullSpan, lo + MIN_VIEW_DAYS);
        lo = Math.max(0, hi - MIN_VIEW_DAYS);
      }
      setView({ lo, hi });
    },
    [fullSpan]
  );

  const syncHover = useCallback(
    (svgX: number, svgY: number) => {
      const inPlot =
        svgX >= PAD.left &&
        svgX <= PAD.left + INNER_W &&
        svgY >= PAD.top &&
        svgY <= PAD.top + INNER_H;
      if (!inPlot) {
        setHoverX(null);
        setActive(null);
        return;
      }
      const clampedX = Math.min(PLOT_LEFT + PLOT_WIDTH, Math.max(PLOT_LEFT, svgX));
      setHoverX(clampedX);
      setActive(nearestPoint(points, clampedX));
    },
    [points]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x } = clientToSvg(svg, e.clientX, e.clientY);
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      zoomAt(x, factor);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        dragRef.current = null;
        setDragging(false);
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const factor = pinchRef.current.startDist / Math.max(dist, 1);
        zoomAt(pinchRef.current.midX, factor, {
          lo: pinchRef.current.startLo,
          hi: pinchRef.current.startHi,
        });
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const { x, y } = clientToSvg(svg, t.clientX, t.clientY);
        if (dragRef.current) {
          e.preventDefault();
          const deltaX = x - dragRef.current.startSvgX;
          panBySvgDelta(deltaX, {
            lo: dragRef.current.startLo,
            hi: dragRef.current.startHi,
          });
          return;
        }
        syncHover(x, y);
      }
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('touchmove', onTouchMove);
    };
  }, [zoomAt, syncHover, panBySvgDelta]);

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'touch') return;
    const svg = svgRef.current;
    if (!svg) return;
    const zoomed =
      viewRef.current.lo > 0 || viewRef.current.hi < fullSpan - 1e-6;
    if (!zoomed) return;

    const { x, y } = clientToSvg(svg, e.clientX, e.clientY);
    const inPlot =
      x >= PAD.left &&
      x <= PAD.left + INNER_W &&
      y >= PAD.top &&
      y <= PAD.top + INNER_H;
    if (!inPlot) return;

    dragRef.current = {
      startSvgX: x,
      startLo: viewRef.current.lo,
      startHi: viewRef.current.hi,
      pointerId: e.pointerId,
    };
    setDragging(true);
    setHoverX(null);
    setActive(null);
    svg.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'touch') return;
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y } = clientToSvg(svg, e.clientX, e.clientY);

    if (dragRef.current && dragRef.current.pointerId === e.pointerId) {
      const deltaX = x - dragRef.current.startSvgX;
      panBySvgDelta(deltaX, {
        lo: dragRef.current.startLo,
        hi: dragRef.current.startHi,
      });
      return;
    }

    syncHover(x, y);
  }

  function endDrag(pointerId?: number) {
    if (
      pointerId != null &&
      dragRef.current &&
      dragRef.current.pointerId !== pointerId
    ) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    endDrag(e.pointerId);
  }

  function handlePointerLeave() {
    if (dragRef.current) return;
    setHoverX(null);
    setActive(null);
    pinchRef.current = null;
  }

  function handleTouchStart(e: React.TouchEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;

    if (e.touches.length === 2) {
      dragRef.current = null;
      setDragging(false);
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const mid = clientToSvg(
        svg,
        (a.clientX + b.clientX) / 2,
        (a.clientY + b.clientY) / 2
      );
      pinchRef.current = {
        startDist: dist,
        midX: mid.x,
        startLo: viewRef.current.lo,
        startHi: viewRef.current.hi,
      };
      return;
    }

    if (e.touches.length === 1) {
      const zoomed =
        viewRef.current.lo > 0 || viewRef.current.hi < fullSpan - 1e-6;
      if (!zoomed) return;
      const t = e.touches[0];
      const { x } = clientToSvg(svg, t.clientX, t.clientY);
      dragRef.current = {
        startSvgX: x,
        startLo: viewRef.current.lo,
        startHi: viewRef.current.hi,
        pointerId: -1,
      };
      setDragging(true);
      setHoverX(null);
      setActive(null);
    }
  }

  function resetZoom() {
    setView({ lo: 0, hi: fullSpan });
  }

  if (data.length === 0) return null;

  const dense = points.length > 12;
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
  const crossX = active?.x ?? hoverX;

  return (
    <div className="relative w-full overflow-visible">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-ink-faint sm:text-xs">
          移动查看 · 滚轮缩放时间轴 · 放大后可拖拽平移
        </p>
        {isZoomed && (
          <button
            type="button"
            onClick={resetZoom}
            className="text-[11px] font-medium text-low-dark hover:underline sm:text-xs"
          >
            重置缩放
          </button>
        )}
      </div>

      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full min-w-[280px] touch-none select-none ${
            isZoomed ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          role="img"
          aria-label="体重变化折线图"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onDoubleClick={resetZoom}
          onTouchStart={handleTouchStart}
          onTouchEnd={() => {
            pinchRef.current = null;
            dragRef.current = null;
            setDragging(false);
          }}
        >
          <defs>
            <clipPath id="weight-plot-clip">
              <rect
                x={PAD.left - 2}
                y={PAD.top - 2}
                width={INNER_W + 4}
                height={INNER_H + 4}
              />
            </clipPath>
          </defs>

          {yTicks.map((tick) => {
            const y = PAD.top + INNER_H - ((tick - yMin) / ySpan) * INNER_H;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left + 6}
                  y1={y}
                  x2={W - PAD.right}
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

          <g clipPath="url(#weight-plot-clip)">
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="pointer-events-none stroke-low"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {points.map((p) => {
              const isActive = active?.date === p.date;
              const r = dense ? 3 : 4;
              return (
                <g key={p.date} className="pointer-events-none">
                  {isActive && (
                    <circle cx={p.x} cy={p.y} r={r + 5} className="fill-low/25" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? r + 1.5 : r}
                    className={isActive ? 'fill-low-dark' : 'fill-low'}
                  />
                </g>
              );
            })}

            {crossX != null && (
              <line
                x1={crossX}
                y1={PAD.top}
                x2={crossX}
                y2={PAD.top + INNER_H}
                stroke="currentColor"
                strokeWidth={1}
                className="pointer-events-none stroke-ink/25"
                strokeDasharray="3 3"
              />
            )}
          </g>

          {/* Invisible plot hit area */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={INNER_W}
            height={INNER_H}
            fill="transparent"
          />

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
                className="pointer-events-none fill-ink-faint text-[16px] sm:text-[9px]"
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
    </div>
  );
}
