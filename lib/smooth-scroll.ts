/** Shared ease-in-out scroll used by onboarding and hash navigation. */

export const SMOOTH_SCROLL_MS = 900;

export type SmoothScrollAlign = 'start' | 'center';

export type SmoothScrollOptions = {
  duration?: number;
  align?: SmoothScrollAlign;
  /**
   * Extra gap below the floating tour card (`--fp-onboarding-h`).
   * When set, overrides CSS scroll-margin for `align: 'start'`.
   */
  belowOverlayPx?: number;
};

export function smoothScrollToElement(
  el: HTMLElement,
  durationOrOpts: number | SmoothScrollOptions = SMOOTH_SCROLL_MS,
  alignArg: SmoothScrollAlign = 'start'
): () => void {
  const opts: Required<Pick<SmoothScrollOptions, 'duration' | 'align'>> &
    Pick<SmoothScrollOptions, 'belowOverlayPx'> =
    typeof durationOrOpts === 'number'
      ? { duration: durationOrOpts, align: alignArg }
      : {
          duration: durationOrOpts.duration ?? SMOOTH_SCROLL_MS,
          align: durationOrOpts.align ?? 'start',
          belowOverlayPx: durationOrOpts.belowOverlayPx,
        };

  const rect = el.getBoundingClientRect();
  const overlayH =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--fp-onboarding-h')
    ) || 0;

  let targetY: number;
  if (opts.align === 'center') {
    const visibleTop = overlayH;
    const visibleHeight = Math.max(1, window.innerHeight - visibleTop);
    targetY =
      window.scrollY + rect.top - visibleTop - (visibleHeight - rect.height) / 2;
  } else {
    const styleMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const marginTop =
      opts.belowOverlayPx != null
        ? overlayH + opts.belowOverlayPx
        : Math.max(styleMargin, overlayH + 12);
    targetY = window.scrollY + rect.top - marginTop;
  }

  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  targetY = Math.max(0, Math.min(targetY, maxY));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || Math.abs(targetY - window.scrollY) < 2) {
    window.scrollTo(0, targetY);
    return () => {};
  }

  const startY = window.scrollY;
  const delta = targetY - startY;
  const start = performance.now();
  let raf = 0;
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / opts.duration);
    window.scrollTo(0, startY + delta * ease(t));
    if (t < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
