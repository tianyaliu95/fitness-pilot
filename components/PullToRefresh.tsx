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

function SafariSpinner({ progress, spinning }: { progress: number; spinning: boolean }) {
  const p = Math.max(0, Math.min(1, progress));
  const r = 9;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.01, p) * c * 0.85;

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className={spinning ? 'animate-spin' : undefined}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        strokeDashoffset="0"
        transform="rotate(-90 12 12)"
        opacity={spinning ? 1 : 0.35 + p * 0.65}
      />
    </svg>
  );
}

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    setEnabled(isStandalonePwa());
  }, []);

  useEffect(() => {
    if (!enabled) return;

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
        setPull(0);
        setDragging(false);
        return;
      }

      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0;
          setPull(0);
          setDragging(false);
        }
        return;
      }

      e.preventDefault();
      const next = Math.min(MAX_PULL, dy * RESISTANCE);
      pullRef.current = next;
      setDragging(true);
      setPull(next);
    };

    const onEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      setDragging(false);
      const dist = pullRef.current;

      if (dist >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        pullRef.current = THRESHOLD;
        setRefreshing(true);
        setPull(THRESHOLD);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }

      pullRef.current = 0;
      setPull(0);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  const progress = Math.min(1, pull / THRESHOLD);
  const showSpinner = pull > 8 || refreshing;
  // Spinner sits in the revealed band above the sliding page
  const spinnerY = Math.max(0, pull * 0.5 - 4);

  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center text-ink/45"
        style={{
          top: 'max(0.35rem, env(safe-area-inset-top, 0px))',
          opacity: showSpinner ? 1 : 0,
          transform: `translateY(${spinnerY}px)`,
          transition: dragging || refreshing ? 'none' : 'opacity 0.22s ease, transform 0.22s ease',
        }}
        aria-hidden={!showSpinner}
      >
        <SafariSpinner progress={refreshing ? 1 : progress} spinning={refreshing} />
      </div>

      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: dragging || refreshing ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: pull > 0 ? 'transform' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
