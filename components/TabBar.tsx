'use client';

import { useId, useRef } from 'react';

export type TabTone = 'default' | 'low' | 'high';

export interface Tab {
  id: string;
  label: string;
  dirty?: boolean;
  tone?: TabTone;
}

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** When set, inactive tabs use a subtle tint matching the active tab tone. */
  variant?: 'default' | 'carb';
  'aria-label'?: string;
  /** Prefix for aria-controls / tab ids; pair with matching tabpanel ids. */
  idPrefix?: string;
}

function tabButtonClasses(tab: Tab, active: boolean, variant: 'default' | 'carb'): string {
  const base =
    'relative flex min-h-[2.75rem] items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold transition sm:px-3';

  if (variant === 'carb' && tab.tone === 'low') {
    return `${base} ${
      active
        ? 'bg-low-dark text-white shadow-soft'
        : 'bg-low-light/60 text-low-dark hover:bg-low-light'
    }`;
  }

  if (variant === 'carb' && tab.tone === 'high') {
    return `${base} ${
      active
        ? 'bg-high-dark text-white shadow-soft'
        : 'bg-high-light/60 text-high-dark hover:bg-high-light'
    }`;
  }

  return `${base} ${
    active ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
  }`;
}

export function TabBar({
  tabs,
  activeId,
  onChange,
  className = '',
  variant = 'default',
  'aria-label': ariaLabel = '内容分类',
  idPrefix,
}: TabBarProps) {
  const autoId = useId();
  const prefix = idPrefix ?? `tabs${autoId.replace(/:/g, '')}`;
  const listRef = useRef<HTMLDivElement>(null);

  function focusTabAt(index: number) {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[index]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      next = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      next = tabs.length - 1;
    } else {
      return;
    }
    onChange(tabs[next].id);
    requestAnimationFrame(() => focusTabAt(next));
  }

  return (
    <div
      className={`rounded-2xl bg-surface-muted p-1 ${className}`}
      role="tablist"
      aria-label={ariaLabel}
      ref={listRef}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab, index) => {
          const active = tab.id === activeId;
          const tabId = `${prefix}-tab-${tab.id}`;
          const panelId = `${prefix}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={tabButtonClasses(tab, active, variant)}
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

export function tabPanelProps(
  idPrefix: string,
  tabId: string,
  activeId: string,
  className = ''
) {
  const active = activeId === tabId;
  return {
    id: `${idPrefix}-panel-${tabId}`,
    role: 'tabpanel' as const,
    'aria-labelledby': `${idPrefix}-tab-${tabId}`,
    hidden: !active,
    className: [className, active ? 'animate-enter' : ''].filter(Boolean).join(' '),
  };
}
