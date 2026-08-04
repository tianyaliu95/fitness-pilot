'use client';

import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 72;
const MAX_PULL = 112;
const RESISTANCE = 0.45;

function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  const mq =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  const ios = 'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

function pageScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

/** False when a nested scroller above the page is not at its top. */
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

export function PullToRefresh() {
  const [enabled, setEnabled] = useState(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
        return;
      }

      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0;
          setPull(0);
        }
        return;
      }

      // Own the overscroll so iOS rubber-band doesn't eat the gesture.
      e.preventDefault();
      const next = Math.min(MAX_PULL, dy * RESISTANCE);
      pullRef.current = next;
      setPull(next);
    };

    const onEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      const dist = pullRef.current;
      pullRef.current = 0;

      if (dist >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(THRESHOLD);
        window.location.reload();
        return;
      }
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

  if (!enabled) return null;

  const visible = pull > 4 || refreshing;
  const progress = Math.min(1, pull / THRESHOLD);
  const ready = pull >= THRESHOLD || refreshing;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center"
      style={{
        top: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        opacity: visible ? 1 : 0,
        transform: `translateY(${Math.max(0, pull - 12)}px)`,
        transition: pull > 0 || refreshing ? 'none' : 'opacity 0.2s ease',
      }}
      aria-hidden={!visible}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card ring-1 ring-ink/5 ${
          ready ? 'text-low' : 'text-ink/40'
        }`}
      >
        {refreshing ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/15 border-t-low" />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${progress * 180}deg)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <path d="M12 5v14" />
            <path d="M6 11l6-6 6 6" />
          </svg>
        )}
      </div>
    </div>
  );
}
