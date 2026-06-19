'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatAuthError } from '@/lib/auth-errors';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthForm() {
  const { signIn, signUp, signInWithGoogle, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  async function runAuth(action: () => Promise<void>) {
    setError('');
    clearAuthError();
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runAuth(async () => {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    });
  }

  function handleGoogleSignIn() {
    void runAuth(() => signInWithGoogle());
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-surface-card p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Fitness Pilot</h1>
        <p className="mt-2 text-sm text-ink-muted">
          登录后数据会自动保存到云端，电脑和手机打开都是最新内容。
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-surface disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? '处理中...' : '使用 Google 账号登录'}
        </button>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-xs text-ink-faint">或</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-muted">邮箱</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-low/30"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-muted">密码</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-low/30"
              placeholder="至少 6 位"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-low px-4 py-3 text-sm font-semibold text-white transition hover:bg-low-dark disabled:opacity-60"
          >
            {busy ? '处理中...' : mode === 'signin' ? '邮箱登录' : '邮箱注册'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 w-full text-center text-sm text-ink-muted hover:text-ink"
        >
          {mode === 'signin' ? '没有账号？注册' : '已有账号？登录'}
        </button>
      </div>
    </div>
  );
}
