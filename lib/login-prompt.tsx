'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LoginPromptContextValue {
  openLogin: () => void;
  closeLogin: () => void;
}

/** Navigate to the full-page login screen (no modal - Safari private-safe). */
export function useLoginPrompt(): LoginPromptContextValue {
  const router = useRouter();
  const pathname = usePathname();

  const openLogin = useCallback(() => {
    const next =
      pathname && pathname !== '/login'
        ? `?next=${encodeURIComponent(pathname)}`
        : '';
    router.push(`/login${next}`);
  }, [router, pathname]);

  const closeLogin = useCallback(() => {
    router.push('/');
  }, [router]);

  return { openLogin, closeLogin };
}

/** Only allow same-origin relative paths. */
export function safeReturnPath(raw: string | null | undefined, fallback = '/'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) {
    return fallback;
  }
  return raw;
}
