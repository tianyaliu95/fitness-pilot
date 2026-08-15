'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackToTop } from './BackToTop';
import { CoachWidget } from './CoachWidget';

const STACK_BOTTOM =
  'bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:bottom-8';

/** Chat FAB above, back-to-top below — shared right-corner stack. */
export function FloatingCorner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`pointer-events-none fixed right-4 z-[55] flex flex-col items-end gap-2.5 ${STACK_BOTTOM}`}
    >
      <CoachWidget />
      <BackToTop />
    </div>,
    document.body
  );
}
