'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '@/lib/storage';
import { useLocale } from '@/lib/i18n';
import { getGuestPlaceholderState } from '@/lib/guest-state';

/**
 * Keeps UI language and logged-in AppState.locale in sync.
 * Guests get locale-matched demo data (never written to cloud).
 */
export function UserLocaleSync() {
  const { state, updateState, isGuest, hydrated } = useAppState();
  const { locale, setLocale } = useLocale();
  const lastAppliedAccountLocale = useRef<string | null>(null);
  const lastGuestDemoLocale = useRef<string | null>(null);
  const applyingFromAccount = useRef(false);

  // Account preference → UI (when user data hydrates / account locale changes)
  useEffect(() => {
    if (!hydrated || isGuest) {
      lastAppliedAccountLocale.current = null;
      return;
    }
    if (lastAppliedAccountLocale.current === state.locale) return;
    lastAppliedAccountLocale.current = state.locale;
    applyingFromAccount.current = true;
    setLocale(state.locale);
  }, [hydrated, isGuest, state.locale, setLocale]);

  // UI preference → account (persists via normal cloud save)
  useEffect(() => {
    if (!hydrated || isGuest) return;
    if (applyingFromAccount.current) {
      applyingFromAccount.current = false;
      return;
    }
    if (state.locale === locale) return;
    updateState((prev) =>
      prev.locale === locale ? prev : { ...prev, locale }
    );
  }, [locale, hydrated, isGuest, state.locale, updateState]);

  // Guest: swap demo pack when language changes
  useEffect(() => {
    if (!hydrated || !isGuest) {
      lastGuestDemoLocale.current = null;
      return;
    }
    if (lastGuestDemoLocale.current === locale) return;
    lastGuestDemoLocale.current = locale;
    updateState(() => getGuestPlaceholderState(locale));
  }, [hydrated, isGuest, locale, updateState]);

  return null;
}
