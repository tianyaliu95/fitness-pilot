'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

const SHOW_AFTER_PX = 320;

/** Sits in FloatingCorner under the chat FAB (not independently fixed). */
export function BackToTop() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-ink/90 text-white shadow-card backdrop-blur-md transition duration-200 hover:bg-ink active:scale-95"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.25}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
