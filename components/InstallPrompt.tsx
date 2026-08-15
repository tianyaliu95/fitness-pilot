'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

const DISMISS_KEY = 'fp-install-prompt-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOther = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && webkit && notOther;
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setDismissed(readDismissed());
    setStandalone(isStandaloneDisplay());
    setIos(isIosSafari());
    setReady(true);

    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode */
    }
    setDismissed(true);
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (!ready || dismissed) return null;

  const closeBtn = (
    <button
      type="button"
      onClick={handleDismiss}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition hover:bg-white/70 hover:text-ink"
      aria-label={t('install.dismiss')}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  if (standalone) {
    return (
      <section className="relative glass-panel rounded-3xl p-5 pr-12 sm:p-6">
        {closeBtn}
        <p className="text-sm font-semibold text-ink">{t('install.installed')}</p>
        <p className="mt-1 text-sm text-ink-muted">{t('install.installedHint')}</p>
      </section>
    );
  }

  return (
    <section className="relative rounded-3xl border border-low/30 bg-low-light/60 p-5 pr-12 sm:p-6">
      {closeBtn}
      <h3 className="text-base font-bold text-ink">{t('install.title')}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t('install.subtitle')}</p>

      {installEvent ? (
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="mt-4 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-ink/90 sm:w-auto sm:px-5"
        >
          {t('install.cta')}
        </button>
      ) : ios ? (
        <ol className="mt-4 space-y-2 text-sm text-ink">
          <li>1. {t('install.iosStep1')}</li>
          <li>2. {t('install.iosStep2')}</li>
          <li>3. {t('install.iosStep3')}</li>
        </ol>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">{t('install.browserHint')}</p>
      )}
    </section>
  );
}
