export type Locale = 'en' | 'zh';

export const LOCALES: Locale[] = ['en', 'zh'];
export const LOCALE_STORAGE_KEY = 'fitness-pilot-locale';

export function parseLocale(value: unknown): Locale | null {
  return value === 'en' || value === 'zh' ? value : null;
}

export function localeToBcp47(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US';
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh';
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return parseLocale(v);
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}
