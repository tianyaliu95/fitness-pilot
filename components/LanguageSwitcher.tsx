'use client';

import { useLocale } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/locale';

interface LanguageSwitcherProps {
  /** denser control for tight layouts (e.g. auth card) */
  compact?: boolean;
}

/**
 * Segmented control with native language names (industry standard).
 * Global chrome: sidebar (desktop) + home header (mobile); also Profile / login.
 */
export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  const options: { id: Locale; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'zh', label: '中文' },
  ];

  return (
    <div className={compact ? 'shrink-0' : 'space-y-2'}>
      {!compact && (
        <p className="text-xs font-medium text-ink-muted">{t('language.label')}</p>
      )}
      <div
        role="group"
        aria-label={t('language.label')}
        className="inline-flex rounded-xl border border-ink/10 bg-surface p-0.5"
      >
        {options.map((opt) => {
          const active = locale === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLocale(opt.id)}
              aria-pressed={active}
              className={`min-w-[2.75rem] rounded-[0.625rem] px-2.5 py-1 text-xs font-semibold transition sm:min-w-[3.25rem] sm:px-3 sm:py-1.5 sm:text-sm ${
                active
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
