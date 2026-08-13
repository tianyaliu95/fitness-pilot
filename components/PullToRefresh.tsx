'use client';

import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 72;
const MAX_PULL = 128;
const RESISTANCE = 0.55;

function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  const mq =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  const ios =
    'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

function pageScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function nestedScrollBlocksPull(target: EventTarget | null) {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    const oy = style.overflowY;
    if (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      el.scrollHeight > el.clientHeight + 1 &&
      el.scrollTop > 0
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Jank cause (before): every touchmove called setPull → React re-rendered the
 * entire app shell, and paddingTop forced full-document layout each frame.
 * Fix: drive pull distance via refs + direct DOM writes during the gesture;
 * only use React state when refresh starts (spinner spin + reload).
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const rafRef = useRef(0);
  const pendingPull = useRef<number | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const spinnerWrapRef = useRef<HTMLDivElement>(null);
  const spinnerCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    setEnabled(isStandalonePwa());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const r = 9;
    const c = 2 * Math.PI * r;

    const paint = (pull: number, opts?: { transitioning?: boolean }) => {
      const content = contentRef.current;
      const wrap = spinnerWrapRef.current;
      const circle = spinnerCircleRef.current;
      if (!content || !wrap) return;

      const transitioning = opts?.transitioning ?? false;
      content.style.transition = transitioning
        ? 'padding-top 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)'
        : 'none';
      content.style.paddingTop = pull > 0 ? `${pull}px` : '';

      const progress = Math.min(1, pull / THRESHOLD);
      const show = pull > 8 || refreshingRef.current;
      const spinnerY = Math.max(0, pull * 0.5 - 4);
      wrap.style.transition = transitioning
        ? 'opacity 0.22s ease, transform 0.22s ease'
        : 'none';
      wrap.style.opacity = show ? '1' : '0';
      wrap.style.transform = `translateY(${spinnerY}px)`;

      if (circle && !refreshingRef.current) {
        const dash = Math.max(0.01, progress) * c * 0.85;
        circle.setAttribute('stroke-dasharray', `${dash} ${c}`);
        circle.setAttribute('opacity', String(0.35 + progress * 0.65));
      }
    };

    const schedulePaint = (pull: number) => {
      pendingPull.current = pull;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const next = pendingPull.current;
        if (next === null) return;
        pendingPull.current = null;
        paint(next);
      });
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || e.touches.length !== 1) return;
      if (pageScrollTop() > 0 || nestedScrollBlocksPull(e.target)) {
        pulling.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current || refreshingRef.current || e.touches.length !== 1) return;
      if (pageScrollTop() > 0) {
        pulling.current = false;
        pullRef.current = 0;
        schedulePaint(0);
        return;
      }

      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0;
          schedulePaint(0);
        }
        return;
      }

      e.preventDefault();
      const next = Math.min(MAX_PULL, dy * RESISTANCE);
      pullRef.current = next;
      schedulePaint(next);
    };

    const onEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      const dist = pullRef.current;

      if (dist >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        pullRef.current = THRESHOLD;
        paint(THRESHOLD);
        setRefreshing(true);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }

      pullRef.current = 0;
      paint(0, { transitioning: true });
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);

    // Initial spinner hidden state (not via React style — paint owns opacity/transform).
    paint(0);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled]);

  // After React marks refreshing, re-apply pull paint so spinner stays visible.
  useEffect(() => {
    if (!enabled || !refreshing) return;
    const content = contentRef.current;
    const wrap = spinnerWrapRef.current;
    if (content) content.style.paddingTop = `${THRESHOLD}px`;
    if (wrap) {
      wrap.style.opacity = '1';
      wrap.style.transform = `translateY(${Math.max(0, THRESHOLD * 0.5 - 4)}px)`;
      wrap.style.transition = 'none';
    }
  }, [enabled, refreshing]);

  if (!enabled) return <>{children}</>;

  const r = 9;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative">
      <div
        ref={spinnerWrapRef}
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center text-ink/45"
        style={{ top: 'max(0.35rem, env(safe-area-inset-top, 0px))' }}
        aria-hidden
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          className={refreshing ? 'animate-spin' : undefined}
          aria-hidden
        >
          <circle
            ref={spinnerCircleRef}
            cx="12"
            cy="12"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={refreshing ? `${c * 0.85} ${c}` : `${0.01 * c * 0.85} ${c}`}
            strokeDashoffset="0"
            transform="rotate(-90 12 12)"
            opacity={refreshing ? 1 : 0.35}
          />
        </svg>
      </div>

      {/*
        Use padding (not transform) so position:fixed chrome (bottom tab bar)
        stays viewport-pinned. Transform on an ancestor would re-root fixed.
        Pull distance is applied via contentRef during the gesture (no React).
      */}
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
