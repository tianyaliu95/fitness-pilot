'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Jump to top after bottom-nav / route changes (mobile keeps prior scroll otherwise). */
export function scrollPageToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    scrollPageToTop();
  }, [pathname]);

  return null;
}
