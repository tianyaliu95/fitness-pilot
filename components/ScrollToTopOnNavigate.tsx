'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SMOOTH_SCROLL_MS, smoothScrollToElement } from '@/lib/smooth-scroll';

/** Jump to top after bottom-nav / route changes (mobile keeps prior scroll otherwise). */
export function scrollPageToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function focusTargetId(): string | null {
  const section = new URLSearchParams(window.location.search).get('section');
  if (section) return section;
  const hash = window.location.hash.replace(/^#/, '');
  return hash || null;
}

export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    const focusId = focusTargetId();
    if (!focusId) {
      scrollPageToTop();
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let raf = 0;
    let cancelScroll = () => {};

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(focusId);
      if (el) {
        // Wait one more frame so layout (charts, fonts) can settle before measuring.
        raf = requestAnimationFrame(() => {
          if (cancelled) return;
          cancelScroll = smoothScrollToElement(el, SMOOTH_SCROLL_MS, 'center');
        });
        return;
      }
      if (attempts++ < 40) {
        raf = requestAnimationFrame(tryScroll);
      }
    };

    // Defer past Next's own scroll reset and the page mount.
    const timer = window.setTimeout(tryScroll, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      cancelScroll();
    };
  }, [pathname]);

  return null;
}
