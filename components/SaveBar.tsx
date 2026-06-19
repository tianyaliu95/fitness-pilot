'use client';

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  onSave: () => void;
}

export function SaveBar({
  dirty,
  saving,
  lastSavedAt,
  saveError,
  onSave,
}: SaveBarProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-ink/5 bg-surface-card p-4 shadow-soft sm:p-5">
      {dirty && (
        <p className="text-xs font-medium text-amber-700">有未保存的修改</p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存修改'}
      </button>

      {saveError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          保存失败：{saveError}
        </p>
      )}

      {!dirty && !saveError && lastSavedAt && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">
          已保存 ·{' '}
          {lastSavedAt.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      )}

      {!dirty && !saveError && !lastSavedAt && (
        <p className="text-xs text-ink-muted">修改后点击「保存修改」确认</p>
      )}
    </div>
  );
}
