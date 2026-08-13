'use client';

import { usePathname } from 'next/navigation';
import { AmbientField } from './AmbientField';
import { PullToRefresh } from './PullToRefresh';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppStateProvider, useAppState } from '@/lib/storage';
import { useLoginPrompt } from '@/lib/login-prompt';
import { TodayProvider, useTodayISO } from '@/lib/today-context';

function GuestBanner() {
  const { isGuest } = useAppState();
  const { openLogin } = useLoginPrompt();
  if (!isGuest) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-sm text-amber-950 sm:px-4">
      <p className="min-w-0 flex-1 leading-snug">
        当前为<strong className="font-semibold">演示数据</strong>
        ，可随意浏览。保存到云端前请先登录（登录不会同步游客改动）。
      </p>
      <button
        type="button"
        onClick={openLogin}
        className="shrink-0 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-white transition hover:bg-ink/90"
      >
        登录
      </button>
    </div>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { cloudSyncing } = useAppState();
  useTodayISO();

  return (
    <div className="relative z-[1] min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <Sidebar cloudSyncing={cloudSyncing} />
      <main className="min-w-0 px-4 pb-mobile-nav pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-8 md:pb-10">
        <div className="mx-auto w-full max-w-4xl">
          <GuestBanner />
          {children}
        </div>
      </main>
    </div>
  );
}

function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConfigured, authReady } = useAuth();
  const { hydrated } = useAppState();

  if (isConfigured && !authReady) {
    return (
      <div
        className="relative z-[1] flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">加载中</span>
        <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
      </div>
    );
  }

  // Full-page login — no tab bar / guest chrome (matches classic auth screen).
  if (pathname === '/login') {
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
        <span className="sr-only">加载中</span>
        <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
      </div>
    );
  }

  return <ShellContent>{children}</ShellContent>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <TodayProvider>
          <AmbientField />
          <PullToRefresh>
            <ShellGate>{children}</ShellGate>
          </PullToRefresh>
        </TodayProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
