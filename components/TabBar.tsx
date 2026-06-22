'use client';

export interface Tab {
  id: string;
  label: string;
  dirty?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function TabBar({
  tabs,
  activeId,
  onChange,
  className = '',
  'aria-label': ariaLabel = '内容分类',
}: TabBarProps) {
  return (
    <div
      className={`rounded-2xl bg-surface-muted p-1 ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`
                relative flex min-h-[2.5rem] items-center justify-center gap-1.5
                rounded-xl px-2 py-2 text-sm font-semibold transition
                sm:px-3
                ${active
                  ? 'bg-surface-card text-ink shadow-soft'
                  : 'text-ink-muted hover:text-ink'
                }
              `}
            >
              <span className="truncate">{tab.label}</span>
              {tab.dirty && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                  aria-label="有未保存的修改"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
