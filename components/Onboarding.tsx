'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { todayISO } from '@/lib/cycle';
import { applyOnboarding, needsOnboarding } from '@/lib/onboarding';
import { SMOOTH_SCROLL_MS, smoothScrollToElement } from '@/lib/smooth-scroll';
import { useAppState } from '@/lib/storage';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/en';

const DISMISS_KEY = 'fp-onboarding-dismissed';
const ONBOARDING_H_VAR = '--fp-onboarding-h';

export const tourScrollMarginClass =
  'scroll-mt-[calc(var(--fp-onboarding-h,0px)+0.75rem)]';

/** Last step: keep a slice of today's macros and the calendar header in view. */
export const tourScrollMarginPauseClass =
  'scroll-mt-[calc(var(--fp-onboarding-h,0px)+7.25rem)]';

/** Gap under the tour card when scrolling the planning tabs into view. */
export const TOUR_PLANNING_BELOW_OVERLAY_PX = 2;

/** Gap under the tour card for the home shortcut buttons. */
export const TOUR_PAUSE_BELOW_OVERLAY_PX = 116;

export type OnboardingStepId =
  | 'calendar'
  | 'intake'
  | 'planning'
  | 'carbCycle'
  | 'workoutLog'
  | 'profileInfo'
  | 'profileWeight'
  | 'pause';

const STEPS: {
  id: OnboardingStepId;
  href: string;
  titleKey: MessageKey;
  bodyKeys: MessageKey[];
}[] = [
  {
    id: 'calendar',
    href: '/',
    titleKey: 'onboarding.step1Title',
    bodyKeys: ['onboarding.step1Body'],
  },
  {
    id: 'intake',
    href: '/intake',
    titleKey: 'onboarding.step2Title',
    bodyKeys: ['onboarding.step2Body'],
  },
  {
    id: 'planning',
    href: '/planning',
    titleKey: 'onboarding.step3Title',
    bodyKeys: ['onboarding.step3Body'],
  },
  {
    id: 'carbCycle',
    href: '/planning',
    titleKey: 'onboarding.step4Title',
    bodyKeys: ['onboarding.step4Body'],
  },
  {
    id: 'workoutLog',
    href: '/workout-log',
    titleKey: 'onboarding.step5Title',
    bodyKeys: ['onboarding.step5Body'],
  },
  {
    id: 'profileInfo',
    href: '/profile',
    titleKey: 'onboarding.step6Title',
    bodyKeys: ['onboarding.step6Body'],
  },
  {
    id: 'profileWeight',
    href: '/profile',
    titleKey: 'onboarding.step7Title',
    bodyKeys: ['onboarding.step7Body'],
  },
  {
    id: 'pause',
    href: '/',
    titleKey: 'onboarding.step8Title',
    bodyKeys: [
      'onboarding.step8Log',
      'onboarding.step8Weight',
      'onboarding.step8Pause',
      'onboarding.step8Reset',
    ],
  },
];

const OnboardingStepContext = createContext<OnboardingStepId | null>(null);

export function useOnboardingStep(): OnboardingStepId | null {
  return useContext(OnboardingStepContext);
}

/** Scroll a highlighted target into view below the floating tour card. */
export function useScrollTourTarget<T extends HTMLElement>(
  active: boolean,
  ref: RefObject<T | null>,
  delayMs = 120,
  belowOverlayPx?: number,
  /** Re-fire while still active (e.g. planning → carbCycle on the same tabs). */
  scrollKey?: string | number | boolean | null
) {
  useEffect(() => {
    if (!active) return;
    let cancelScroll = () => {};
    const timer = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      cancelScroll = smoothScrollToElement(el, {
        duration: SMOOTH_SCROLL_MS,
        align: 'start',
        belowOverlayPx,
      });
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
      cancelScroll();
    };
  }, [active, ref, delayMs, belowOverlayPx, scrollKey]);
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* private mode */
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { state, isGuest, hydrated } = useAppState();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setDismissed(readDismissed());
    setReady(true);
  }, []);

  const show = ready && hydrated && !dismissed && (isGuest || needsOnboarding(state));
  const stepId = show ? STEPS[step]?.id ?? null : null;

  return (
    <OnboardingStepContext.Provider value={stepId}>
      {children}
      {show
        ? createPortal(
            <OnboardingCard
              step={step}
              onStep={setStep}
              onDismiss={() => {
                writeDismissed();
                setDismissed(true);
              }}
            />,
            document.body
          )
        : null}
    </OnboardingStepContext.Provider>
  );
}

export function OnboardingSpacer() {
  const stepId = useOnboardingStep();
  if (!stepId) return null;
  return (
    <div
      aria-hidden
      className="mb-4"
      style={{ height: `var(${ONBOARDING_H_VAR}, 0px)` }}
    />
  );
}

function OnboardingCard({
  step,
  onStep,
  onDismiss,
}: {
  step: number;
  onStep: (step: number) => void;
  onDismiss: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { state, isGuest, updateState, persistStateNow } = useAppState();
  const [busy, setBusy] = useState(false);
  const [stepDir, setStepDir] = useState<'forward' | 'back'>('forward');
  const measureRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(step);
  const current = STEPS[step];

  useEffect(() => {
    if (step > prevStepRef.current) setStepDir('forward');
    else if (step < prevStepRef.current) setStepDir('back');
    prevStepRef.current = step;
  }, [step]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty(
        ONBOARDING_H_VAR,
        `${el.getBoundingClientRect().height}px`
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty(ONBOARDING_H_VAR);
    };
  }, [step]);

  if (!current) return null;

  async function ensureStartDate() {
    if (state.cycleStartDate.trim()) return;
    const next = applyOnboarding(state, todayISO(), state.cycleDays[0]?.workout ?? '');
    updateState(() => next);
    if (!isGuest) await persistStateNow(next);
  }

  async function goNext() {
    if (busy) return;
    setBusy(true);
    if (current.id === 'carbCycle') await ensureStartDate();
    if (step >= STEPS.length - 1) {
      onDismiss();
      setBusy(false);
      return;
    }
    const nextStep = step + 1;
    onStep(nextStep);
    const href = STEPS[nextStep].href;
    if (href !== pathname) router.push(href);
    setBusy(false);
  }

  function goBack() {
    if (step <= 0) return;
    const prev = step - 1;
    onStep(prev);
    const href = STEPS[prev].href;
    if (href !== pathname) router.push(href);
  }

  return (
    <div
      ref={measureRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 md:left-60"
    >
      <div className="bg-gradient-to-b from-[#e8eef5] from-60% to-transparent px-3 pb-3 pt-[max(0.85rem,calc(env(safe-area-inset-top,0px)+0.85rem))] sm:px-4 sm:pt-3 md:px-5 md:pt-4">
        <section className="pointer-events-auto glass-panel rounded-3xl px-4 py-4 shadow-card sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div
              key={current.id}
              className={`min-w-0 flex-1 ${
                stepDir === 'forward' ? 'tour-step-forward' : 'tour-step-back'
              }`}
            >
              <p className="text-xs font-semibold tracking-wide text-ink-faint">
                {t('onboarding.progress', { current: step + 1, total: STEPS.length })}
              </p>
              <h2 className="mt-1 text-base font-bold text-ink">{t(current.titleKey)}</h2>
              <ul className="mt-2.5 space-y-1.5 text-sm text-ink-muted">
                {current.bodyKeys.map((key) => (
                  <li key={key}>· {t(key)}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 text-sm font-medium text-ink-faint underline-offset-2 hover:text-ink-muted hover:underline"
            >
              {t('onboarding.skip')}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-ink/20 hover:text-ink"
              >
                {t('onboarding.back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={busy}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink/90 disabled:opacity-50"
            >
              {step >= STEPS.length - 1 ? t('onboarding.done') : t('onboarding.next')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
