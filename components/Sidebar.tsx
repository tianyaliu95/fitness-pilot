'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  {
    href: '/',
    label: '日历',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    match: (path: string) => path === '/' || path.startsWith('/day/'),
  },
  {
    href: '/intake',
    label: '摄入要求',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    match: (path: string) => path === '/intake',
  },
  {
    href: '/planning',
    label: '训练规划',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    match: (path: string) => path === '/planning' || path === '/training' || path === '/settings',
  },
  {
    href: '/workout-log',
    label: '训练记录',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    match: (path: string) => path === '/workout-log',
  },
  {
    href: '/profile',
    label: '个人信息',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    match: (path: string) => path === '/profile',
  },
];

function NavLink({
  href,
  label,
  icon,
  active,
  layout,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  layout: 'sidebar' | 'bottom';
}) {
  const base =
    layout === 'sidebar'
      ? 'flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-medium transition'
      : 'flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight transition';

  const activeClass =
    layout === 'sidebar'
      ? 'bg-white text-ink shadow-soft'
      : 'bg-surface-muted text-low-dark';

  const inactiveClass =
    layout === 'sidebar'
      ? 'text-ink-muted hover:bg-white/60 hover:text-ink'
      : 'text-ink-faint hover:bg-surface-muted/80 hover:text-ink-muted';

  return (
    <Link href={href} className={`${base} ${active ? activeClass : inactiveClass}`}>
      <span className={`shrink-0 ${active && layout === 'bottom' ? 'text-low' : ''}`}>{icon}</span>
      <span className="max-w-full truncate text-center">{label}</span>
    </Link>
  );
}

export function Sidebar({ cloudSyncing }: { cloudSyncing: boolean }) {
  const pathname = usePathname();
  const { isConfigured, user, logOut } = useAuth();

  return (
    <>
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-r md:border-ink/5 md:bg-surface-muted/80 md:px-4 md:py-8 md:backdrop-blur-sm">
        <div className="mb-8 px-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink mb-2 mt-4">Fitness Pilot</h1>
          <p className="mt-0.5 text-xl font-bold text-ink-muted mb-6">碳循环训练助手</p>
          {isConfigured && user && (
            <p className="mt-2 text-lg font-medium text-ink-faint">
              {cloudSyncing ? '正在同步...' : '已自动云同步'}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.match(pathname)}
              layout="sidebar"
            />
          ))}
        </nav>

        {isConfigured && user && (
          <button
            type="button"
            onClick={() => logOut()}
            className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-medium text-ink-muted transition hover:bg-white/60 hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        )}
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex gap-0.5 border-t border-ink/5 bg-surface-card/95 px-1.5 py-1.5 backdrop-blur-md safe-bottom md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={item.match(pathname)}
            layout="bottom"
          />
        ))}
      </nav>
    </>
  );
}
