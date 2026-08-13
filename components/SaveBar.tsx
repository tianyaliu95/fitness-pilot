'use client';

import { useAppState } from '@/lib/storage';
import { useLoginPrompt } from '@/lib/login-prompt';
import { useLocale, useT } from '@/lib/i18n';

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  onSave: () => void;
  embedded?: boolean;
}

export function SaveBar({
  dirty,
  saving,
  lastSavedAt,
  saveError,
  onSave,
  embedded = false,
}: SaveBarProps) {
  const { isGuest } = useAppState();
  const { openLogin } = useLoginPrompt();
  const t = useT();
  const { bcp47 } = useLocale();

  const shell = embedded
    ? 'space-y-2 border-t border-ink/5 pt-3'
    : 'space-y-3 glass-panel rounded-3xl p-5 sm:p-6 animate-enter';

  if (isGuest) {
    return (
      <div className={shell}>
        <p className="text-center text-xs text-ink-muted">{t('save.guestHint')}</p>
        <button
          type="button"
          onClick={openLogin}
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-ink/90"
        >
          {t('save.guestCta')}
        </button>
      </div>
    );
  }

  if (!dirty && !saveError) {
    return (
      <div className={shell}>
        {lastSavedAt ? (
          <p className="rounded-xl bg-success-soft px-3 py-2 text-center text-xs font-bold text-success-text">
            {t('save.saved', {
              time: lastSavedAt.toLocaleString(bcp47, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </p>
        ) : (
          <p className="text-center text-xs text-ink-muted">{t('save.hint')}</p>
        )}
      </div>
    );
  }

  return (
    <div className={shell}>
      {dirty && <p className="text-xs font-medium text-amber-700">{t('save.dirty')}</p>}

      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? t('common.saving') : t('common.save')}
      </button>

      {saveError && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger-text" role="alert">
          {t('save.failed', { error: saveError })}
        </p>
      )}
    </div>
  );
}
