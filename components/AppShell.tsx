'use client';

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
    <div className="min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
      </div>
    );
  }

  if (isConfigured && !user) {
    return <AuthForm />;
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
          <PullToRefresh />
          <ShellGate>{children}</ShellGate>
        </TodayProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
