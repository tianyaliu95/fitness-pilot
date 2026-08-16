'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { PullToRefresh } from './PullToRefresh';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppStateProvider, useAppState } from '@/lib/storage';
import { useLoginPrompt } from '@/lib/login-prompt';
import { LocaleProvider, useT } from '@/lib/i18n';
import { TodayProvider, useTodayISO } from '@/lib/today-context';
import { UserLocaleSync } from './UserLocaleSync';
import { ScrollToTopOnNavigate } from './ScrollToTopOnNavigate';
import { OnboardingProvider, OnboardingSpacer, useOnboardingStep } from './Onboarding';
import { SEO_SHELL_BYPASS_PATHS } from '@/lib/seo';

const AmbientField = dynamic(
  () => import('./AmbientField').then((m) => m.AmbientField),
  { ssr: false }
);

const FloatingCorner = dynamic(
  () => import('./FloatingCorner').then((m) => m.FloatingCorner),
  { ssr: false }
);

function GuestBanner() {
  const { isGuest, hydrated } = useAppState();
  const { isConfigured, authReady, user } = useAuth();
  const { openLogin } = useLoginPrompt();
  const t = useT();

  // Reserve banner height while auth/hydrate settles so guest copy does not push LCP (CLS).
  const reserveSlot =
    isConfigured && (!authReady || !hydrated || (authReady && !user));
  if (!reserveSlot) return null;

  if (!(isGuest && hydrated)) {
    return (
      <div
        className="mb-4 h-[3.25rem] sm:h-[3.35rem]"
        aria-hidden
      />
    );
  }

  return (
    <div className="mb-4 flex min-h-[3.25rem] flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-sm text-amber-950 sm:min-h-[3.35rem] sm:px-4">
      <p className="min-w-0 flex-1 leading-snug">{t('guest.banner')}</p>
      <button
        type="button"
        onClick={openLogin}
        className="shrink-0 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-white transition hover:bg-ink/90"
      >
        {t('guest.bannerCta')}
      </button>
    </div>
  );
}

function ShellLoading() {
  const t = useT();
  return (
    <div
      className="relative z-[1] min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="hidden md:block" aria-hidden />
      <main className="min-w-0 px-4 pb-mobile-nav pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-8 md:pb-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-4 h-[3.25rem] sm:h-[3.35rem]" aria-hidden />
          <header className="md:hidden">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Fitness Pilot
            </h1>
            <p className="mt-2.5 text-sm text-ink-muted">{t('brand.tagline')}</p>
          </header>
          <span className="sr-only">{t('common.loading')}</span>
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <ShellLayout>{children}</ShellLayout>
    </OnboardingProvider>
  );
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { cloudSyncing } = useAppState();
  const touring = useOnboardingStep() !== null;
  useTodayISO();

  return (
    <div className="relative z-[1] min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Tab bar stays outside PullToRefresh so translateY does not re-root fixed. */}
      <Sidebar cloudSyncing={cloudSyncing} />
      <PullToRefresh>
        <main
          className={`min-w-0 px-4 pb-mobile-nav sm:px-6 md:pb-10 ${
            touring
              ? 'pt-0'
              : 'pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:pt-8'
          }`}
        >
          <div className="mx-auto w-full max-w-4xl">
            <OnboardingSpacer />
            <GuestBanner />
            {children}
          </div>
        </main>
      </PullToRefresh>
      <FloatingCorner />
    </div>
  );
}

function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConfigured, authReady } = useAuth();
  const { hydrated } = useAppState();

  if (isConfigured && !authReady) {
    return <ShellLoading />;
  }

  if (SEO_SHELL_BYPASS_PATHS.has(pathname)) {
    return <div className="relative z-[1]">{children}</div>;
  }

  if (!hydrated) {
    return <ShellLoading />;
  }

  return <ShellContent>{children}</ShellContent>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AppStateProvider>
          <UserLocaleSync />
          <ScrollToTopOnNavigate />
          <TodayProvider>
            <AmbientField />
            <ShellGate>{children}</ShellGate>
          </TodayProvider>
        </AppStateProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
