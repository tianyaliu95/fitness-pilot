'use client';

import { AmbientField } from './AmbientField';
import { AuthForm } from './AuthForm';
import { PullToRefresh } from './PullToRefresh';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppStateProvider, useAppState } from '@/lib/storage';
import { TodayProvider, useTodayISO } from '@/lib/today-context';

function ShellContent({ children }: { children: React.ReactNode }) {
  const { cloudSyncing } = useAppState();
  useTodayISO();

  return (
    <div className="relative z-[1] min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <Sidebar cloudSyncing={cloudSyncing} />
      <main className="min-w-0 px-4 pb-mobile-nav pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-8 md:pb-10">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}

function ShellGate({ children }: { children: React.ReactNode }) {
  const { isConfigured, authReady, user } = useAuth();
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

  if (isConfigured && !user) {
    return (
      <div className="relative z-[1]">
        <AuthForm />
      </div>
    );
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
