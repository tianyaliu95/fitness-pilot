'use client';

import { usePathname } from 'next/navigation';
import { AmbientField } from './AmbientField';
import { PullToRefresh } from './PullToRefresh';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppStateProvider, useAppState } from '@/lib/storage';
import { useLoginPrompt } from '@/lib/login-prompt';
import { LocaleProvider, useT } from '@/lib/i18n';
import { TodayProvider, useTodayISO } from '@/lib/today-context';
import { UserLocaleSync } from './UserLocaleSync';
import { ScrollToTopOnNavigate } from './ScrollToTopOnNavigate';
import { BackToTop } from './BackToTop';
import { SEO_SHELL_BYPASS_PATHS } from '@/lib/seo';

function GuestBanner() {
  const { isGuest } = useAppState();
  const { openLogin } = useLoginPrompt();
  const t = useT();
  if (!isGuest) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-sm text-amber-950 sm:px-4">
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

function ShellContent({ children }: { children: React.ReactNode }) {
  const { cloudSyncing } = useAppState();
  useTodayISO();

  return (
    <div className="relative z-[1] min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Tab bar stays outside PullToRefresh so translateY does not re-root fixed. */}
      <Sidebar cloudSyncing={cloudSyncing} />
      <PullToRefresh>
        <main className="min-w-0 px-4 pb-mobile-nav pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-8 md:pb-10">
          <div className="mx-auto w-full max-w-4xl">
            <GuestBanner />
            {children}
          </div>
        </main>
      </PullToRefresh>
      <BackToTop aboveTabBar />
    </div>
  );
}

function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConfigured, authReady } = useAuth();
  const { hydrated } = useAppState();
  const t = useT();

  if (isConfigured && !authReady) {
    return (
      <div
        className="relative z-[1] flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{t('common.loading')}</span>
        <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
      </div>
    );
  }

  if (SEO_SHELL_BYPASS_PATHS.has(pathname)) {
    return <div className="relative z-[1]">{children}</div>;
  }

  if (!hydrated) {
    return (
      <div
        className="relative z-[1] flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{t('common.loading')}</span>
        <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
      </div>
    );
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
