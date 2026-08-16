'use client';

import { useEffect, useState } from 'react';

/** Soft blurry depth field - motion starts after idle to protect LCP/INP. */
export function AmbientField() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const start = () => setMotion(true);
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 1800 });
    } else {
      timeoutId = setTimeout(start, 900);
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`ambient${motion ? ' ambient-motion' : ''}`} aria-hidden="true">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
    </div>
  );
}
