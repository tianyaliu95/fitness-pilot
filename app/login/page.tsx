'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/lib/auth-context';
import { safeReturnPath } from '@/lib/login-prompt';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authReady } = useAuth();
  const next = safeReturnPath(searchParams.get('next'));

  useEffect(() => {
    if (authReady && user) {
      router.replace(next);
    }
  }, [authReady, user, next, router]);

  return (
    <AuthForm
      onDismiss={() => {
        router.push(next);
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-low/30" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
