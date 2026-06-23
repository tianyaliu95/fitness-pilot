'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppState, UserProfile } from '@/lib/types';
import { formatDisplayDate } from '@/lib/day-info';
import { todayISO } from '@/lib/cycle';
import { calculateBmi, getBmiCategory, parsePositiveNumber } from '@/lib/bmi';
import { getLatestWeight, getWeightSeries } from '@/lib/weight';
import { WeightChart } from './WeightChart';
import { BmiGauge } from './BmiGauge';
import { DatePicker } from './DatePicker';
import { SaveBar } from './SaveBar';
import { useAuth } from '@/lib/auth-context';

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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-low to-low-dark text-xl font-extrabold text-white shadow-soft">
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
      <dt className="text-[11px] font-medium text-ink-muted">{label}</dt>
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
        <h2 className="text-xl font-bold text-ink sm:text-2xl">个人信息</h2>
        <p className="mt-1 text-sm text-ink-muted">基础资料、BMI 与每日体重记录</p>
      </header>

      {/* Profile + BMI */}
      <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <ProfileAvatar
              name={editingProfile ? draftProfile.name : viewProfile.name}
              email={userEmail}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-ink">
                {(editingProfile ? draftProfile.name : viewProfile.name).trim() ||
                  '未设置姓名'}
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
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={!profileDirty || cloudSyncing}
                className="rounded-xl bg-ink px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cloudSyncing ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startProfileEdit}
              className="shrink-0 rounded-xl border border-ink/10 bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-ink/20 hover:bg-surface-muted"
            >
              编辑
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-3">
              <span className="mb-1 block text-xs font-medium text-ink-muted">姓名</span>
              <input
                type="text"
                value={draftProfile.name}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="你的姓名"
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">年龄</span>
              <input
                type="text"
                inputMode="numeric"
                value={draftProfile.age}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, age: e.target.value }))
                }
                placeholder="例如 28"
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink-muted">身高 (cm)</span>
              <input
                type="text"
                inputMode="decimal"
                value={draftProfile.height}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, height: e.target.value }))
                }
                placeholder="例如 175"
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
              />
            </label>
          </div>
        ) : (
          <dl className="mt-5 grid grid-cols-3 gap-3">
            <ProfileField label="姓名" value={viewProfile.name} placeholder="未填写" />
            <ProfileField label="年龄" value={viewProfile.age} placeholder="未填写" suffix="岁" />
            <ProfileField
              label="身高"
              value={viewProfile.height}
              placeholder="未填写"
              suffix="cm"
            />
          </dl>
        )}

        <div className="mt-6 border-t border-ink/5 pt-6">
          <BmiGauge bmi={bmi} category={bmiCategory} />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
          BMI 采用 WHO 标准：体重(kg) ÷ 身高(m)²。使用最新体重与所填身高计算，仅供参考。
        </p>
      </div>

      {/* Recent history + weight log */}
      <div className="grid gap-4 md:grid-cols-5 md:gap-5">
        <div className="flex h-96 flex-col rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft md:col-span-2 sm:p-6">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">体重记录</h3>
            {selectedDate === today && (
              <span className="text-xs font-medium text-ink-faint">今天</span>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <DatePicker value={selectedDate} max={today} onChange={setSelectedDate} />

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">体重 (kg)</span>
              <input
                type="text"
                inputMode="decimal"
                value={draftWeight}
                onChange={(e) => setDraftWeight(e.target.value)}
                placeholder="例如 72.5"
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/10"
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

        <div className="flex h-96 flex-col rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft md:col-span-3 sm:p-6">
          <h3 className="mb-3 shrink-0 text-sm font-semibold text-ink">近期体重</h3>
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
                        {formatDisplayDate(date)}
                      </span>
                      <span className="shrink-0 font-semibold text-ink">{weight} kg</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(date)}
                      aria-label={`删除 ${formatDisplayDate(date)} 的记录`}
                      className="shrink-0 cursor-pointer rounded-lg p-1.5 text-ink-faint transition hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-ink-faint">
                暂无记录
              </p>
            )}
          </div>
        </div>

      </div>

      {chartData.length > 0 && (
        <div className="rounded-3xl border border-ink/5 bg-surface-card p-5 shadow-soft sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">体重变化</h3>
          <WeightChart data={chartData} />
        </div>
      )}

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
            退出登录
          </button>
        </div>
      )}
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
