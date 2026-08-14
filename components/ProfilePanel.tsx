'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { AppState, UserProfile } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { todayISO } from '@/lib/cycle';
import { calculateBmi, getBmiCategory, parsePositiveNumber } from '@/lib/bmi';
import { getLatestWeight, getWeightSeries } from '@/lib/weight';
import { useLocale, useT } from '@/lib/i18n';
import { WeightChart } from './WeightChart';
import { BmiGauge } from './BmiGauge';
import { DatePicker } from './DatePicker';
import { SaveBar } from './SaveBar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/lib/auth-context';
import { useLoginPrompt } from '@/lib/login-prompt';

interface ProfilePanelProps {
  state: AppState;
  userEmail: string | null;
  cloudSyncing: boolean;
  lastSavedAt: Date | null;
  cloudSaveError: string | null;
  onUpdate: (updater: (prev: AppState) => AppState) => void;
}

function profileEqual(a: UserProfile, b: UserProfile): boolean {
  return a.name === b.name && a.age === b.age && a.height === b.height;
}

function ProfileAvatar({ name, email }: { name: string; email: string | null }) {
  const initial = name.trim().charAt(0) || email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-low-dark to-[#2f5bb8] text-xl font-extrabold text-white shadow-soft">
      {initial}
    </div>
  );
}

function ProfileField({
  label,
  value,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  placeholder: string;
  suffix?: string;
}) {
  const hasValue = value.trim().length > 0;

  return (
    <div className="rounded-2xl bg-surface px-3 py-2.5">
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm font-semibold ${hasValue ? 'text-ink' : 'text-ink-faint'}`}>
        {hasValue ? (
          <>
            {value.trim()}
            {suffix ? ` ${suffix}` : ''}
          </>
        ) : (
          placeholder
        )}
      </dd>
    </div>
  );
}

export function ProfilePanel({
  state,
  userEmail,
  cloudSyncing,
  lastSavedAt,
  cloudSaveError,
  onUpdate,
}: ProfilePanelProps) {
  const t = useT();
  const { bcp47 } = useLocale();
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [draftProfile, setDraftProfile] = useState(state.profile);
  const [draftWeight, setDraftWeight] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  const savedWeight = state.weightLog[selectedDate] ?? '';
  const profileDirty = !profileEqual(draftProfile, state.profile);
  const weightDirty = draftWeight !== savedWeight;
  const viewProfile = state.profile;

  const { isConfigured, user, logOut } = useAuth();
  const { openLogin } = useLoginPrompt();

  useEffect(() => {
    if (!profileDirty) {
      setDraftProfile({ ...state.profile });
    }
  }, [state.profile, profileDirty]);

  useEffect(() => {
    setDraftWeight(savedWeight);
  }, [selectedDate, savedWeight]);

  const chartData = useMemo(() => getWeightSeries(state.weightLog), [state.weightLog]);

  const history = useMemo(() => {
    return Object.entries(state.weightLog)
      .filter(([, w]) => w.trim().length > 0)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30);
  }, [state.weightLog]);

  const displayWeight = useMemo(() => {
    if (selectedDate === today) {
      const fromDraft = parsePositiveNumber(draftWeight);
      if (fromDraft) return fromDraft;
    }
    return getLatestWeight(state.weightLog);
  }, [selectedDate, today, draftWeight, state.weightLog]);

  const heightCm = parsePositiveNumber(
    editingProfile ? draftProfile.height : viewProfile.height
  );
  const bmi = useMemo(() => {
    if (!displayWeight || !heightCm) return null;
    return calculateBmi(displayWeight, heightCm);
  }, [displayWeight, heightCm]);

  const bmiCategory = bmi !== null ? getBmiCategory(bmi) : null;

  function startProfileEdit() {
    setDraftProfile({ ...state.profile });
    setEditingProfile(true);
  }

  function cancelProfileEdit() {
    setDraftProfile({ ...state.profile });
    setEditingProfile(false);
  }

  function handleSaveProfile() {
    onUpdate((prev) => ({
      ...prev,
      profile: { ...draftProfile },
    }));
    setEditingProfile(false);
  }

  function handleSaveWeight() {
    onUpdate((prev) => {
      const nextLog = { ...prev.weightLog };
      if (draftWeight.trim()) {
        nextLog[selectedDate] = draftWeight.trim();
      } else {
        delete nextLog[selectedDate];
      }
      return { ...prev, weightLog: nextLog };
    });
  }

  function handleDeleteEntry(date: string) {
    onUpdate((prev) => {
      const nextLog = { ...prev.weightLog };
      delete nextLog[date];
      return { ...prev, weightLog: nextLog };
    });
    if (date === selectedDate) {
      setDraftWeight('');
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">{t('profile.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('profile.subtitle')}</p>
      </header>

      <section className="glass-panel rounded-3xl px-5 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">{t('language.section')}</h3>
          <LanguageSwitcher compact />
        </div>
      </section>

      {/* Profile + BMI */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <ProfileAvatar
              name={editingProfile ? draftProfile.name : viewProfile.name}
              email={userEmail}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-ink">
                {(editingProfile ? draftProfile.name : viewProfile.name).trim() ||
                  t('profile.nameUnset')}
              </p>
              {userEmail && (
                <p className="mt-0.5 truncate text-sm text-ink-muted">{userEmail}</p>
              )}
              {heightCm && displayWeight && (
                <p className="mt-1 text-xs text-ink-faint">
                  {heightCm} cm · {displayWeight} kg
                </p>
              )}
            </div>
          </div>
          {editingProfile ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={cancelProfileEdit}
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={!profileDirty || cloudSyncing}
                className="rounded-xl bg-ink px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cloudSyncing ? t('common.saving') : t('common.save')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startProfileEdit}
              className="shrink-0 rounded-xl border border-ink/10 bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-ink/20 hover:bg-surface-muted"
            >
              {t('profile.editProfile')}
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-3">
              <span className="mb-1 block text-xs font-medium text-ink-muted">{t('profile.name')}</span>
              <input
                type="text"
                value={draftProfile.name}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t('profile.namePlaceholder')}
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-low/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">{t('profile.age')}</span>
              <input
                type="text"
                inputMode="numeric"
                value={draftProfile.age}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, age: e.target.value }))
                }
                placeholder={t('profile.agePlaceholder')}
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-low/40"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink-muted">{t('profile.height')}</span>
              <input
                type="text"
                inputMode="decimal"
                value={draftProfile.height}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, height: e.target.value }))
                }
                placeholder={t('profile.heightPlaceholder')}
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-low/40"
              />
            </label>
          </div>
        ) : (
          <dl className="mt-5 grid grid-cols-3 gap-3">
            <ProfileField
              label={t('profile.name')}
              value={viewProfile.name}
              placeholder={t('profile.empty')}
            />
            <ProfileField
              label={t('profile.age')}
              value={viewProfile.age}
              placeholder={t('profile.empty')}
              suffix={t('profile.ageSuffix')}
            />
            <ProfileField
              label={t('profile.heightShort')}
              value={viewProfile.height}
              placeholder={t('profile.empty')}
              suffix="cm"
            />
          </dl>
        )}

        <div className="mt-6 border-t border-ink/5 pt-6">
          <BmiGauge bmi={bmi} category={bmiCategory} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-faint">{t('profile.bmiHint')}</p>
      </div>

      {/* Weight log + recent history + chart */}
      <div className="grid gap-4 md:grid-cols-5 md:gap-5">
        <div className="relative z-20 order-1 flex h-96 flex-col overflow-visible glass-panel rounded-3xl p-5 md:col-span-2 sm:p-6">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{t('controls.weightLog')}</h3>
            {selectedDate === today && (
              <span className="text-xs font-medium text-ink-faint">{t('common.today')}</span>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-visible">
            <DatePicker value={selectedDate} max={today} onChange={setSelectedDate} />

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">{t('profile.weightKg')}</span>
              <input
                type="text"
                inputMode="decimal"
                value={draftWeight}
                onChange={(e) => setDraftWeight(e.target.value)}
                placeholder={t('profile.weightPlaceholder')}
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-low/40"
              />
            </label>
          </div>

          <SaveBar
            embedded
            dirty={weightDirty}
            saving={cloudSyncing}
            lastSavedAt={lastSavedAt}
            saveError={cloudSaveError}
            onSave={handleSaveWeight}
          />
        </div>

        <div className="relative z-0 order-3 flex h-96 flex-col glass-panel rounded-3xl p-5 md:order-2 md:col-span-3 sm:p-6">
          <h3 className="mb-3 shrink-0 text-sm font-semibold text-ink">{t('profile.history')}</h3>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map(([date, weight]) => (
                  <li
                    key={date}
                    className="group flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setDraftWeight(weight);
                      }}
                      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left transition hover:opacity-80"
                    >
                      <span className="truncate text-ink-muted">
                        {formatDisplayDate(date, bcp47)}
                      </span>
                      <span className="shrink-0 font-semibold text-ink">{weight} kg</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(date)}
                      aria-label={t('profile.deleteWeight', {
                        date: formatDisplayDate(date, bcp47),
                      })}
                      className="shrink-0 cursor-pointer rounded-lg p-1.5 text-ink-faint transition hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-ink-faint">
                {t('profile.noHistory')}
              </p>
            )}
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="relative z-0 order-2 glass-panel rounded-3xl p-5 md:order-3 md:col-span-5 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">{t('profile.chart')}</h3>
            <WeightChart data={chartData} />
          </div>
        )}
      </div>

      <p className="px-1 text-center text-xs leading-relaxed text-ink-faint sm:hidden">
        {t('profile.pwaHint')}
      </p>

      {isConfigured && user && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => logOut()}
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-white/60 hover:text-ink sm:gap-3 sm:px-4 sm:py-3 sm:text-lg sm:underline"
          >
            <svg className="inline-block h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('nav.signOut')}
          </button>
        </div>
      )}
      {isConfigured && !user && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openLogin}
            className="rounded-2xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink/90"
          >
            {t('auth.signInRegister')}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-ink-faint">
        <Link href="/about" className="underline-offset-2 hover:text-ink-muted hover:underline">
          {t('nav.about')} · Fitness Pilot
        </Link>
      </p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
