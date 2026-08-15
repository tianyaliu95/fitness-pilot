import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { AmbientField } from '@/components/AmbientField';
import { BackToTop } from '@/components/BackToTop';
import { SITE_NAME, absoluteUrl, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('privacy');

const LAST_UPDATED = 'January 1, 2026';
const LAST_UPDATED_ZH = '2026年1月1日';
const CONTACT_URL = 'tianyaliu0309@gmail.com';
const OPERATOR = 'Tianya Liu';

type Section = {
  id: string;
  titleZh: string;
  titleEn: string;
  bodyZh: ReactNode;
  bodyEn: ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'who',
    titleZh: '1. 我们是谁',
    titleEn: '1. Who we are',
    bodyZh: (
      <p>
        本政策适用于 {SITE_NAME}，由 {OPERATOR} 运营（
        <a className="underline underline-offset-2" href={absoluteUrl('/')}>
          tianyaliu.ca
        </a>
        ）。疑问请通过{' '}
        <a
          className="underline underline-offset-2"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          tianyaliu0309@gmail.com
        </a>{' '}
        联系。
      </p>
    ),
    bodyEn: (
      <p>
        This Policy applies to {SITE_NAME}, operated by {OPERATOR} (
        <a className="underline underline-offset-2" href={absoluteUrl('/')}>
          tianyaliu.ca
        </a>
        ). Questions? Contact us via{' '}
        <a
          className="underline underline-offset-2"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          tianyaliu0309@gmail.com
        </a>
        .
      </p>
    ),
  },
  {
    id: 'collect',
    titleZh: '2. 我们收集什么',
    titleEn: '2. What we collect',
    bodyZh: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <span className="font-medium text-ink">账号：</span>
          邮箱登录时的邮箱与认证信息（密码由 Firebase 处理，不以明文存储）；Google
          登录时 Google 授权提供的邮箱等信息。
        </li>
        <li>
          <span className="font-medium text-ink">你录入的内容：</span>
          姓名、年龄、身高、体重、训练与碳循环计划、摄入目标、训练日志与备注、语言偏好等。
        </li>
        <li>
          <span className="font-medium text-ink">本地与托管：</span>
          浏览器 localStorage 存演示数据与本地状态；托管方（如 Vercel）可能产生常规访问日志。
        </li>
      </ul>
    ),
    bodyEn: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <span className="font-medium text-ink">Account:</span> Email and auth
          credentials for email sign-in (passwords handled by Firebase, never
          stored in plaintext); identifiers Google shares when you use Google
          Sign-In.
        </li>
        <li>
          <span className="font-medium text-ink">What you enter:</span> Name,
          age, height, weight, training and carb-cycle plans, nutrition
          targets, workout logs/notes, language preference, etc.
        </li>
        <li>
          <span className="font-medium text-ink">Local & hosting:</span> Browser
          localStorage for demo data and local state; hosts such as Vercel may
          keep ordinary access logs.
        </li>
      </ul>
    ),
  },
  {
    id: 'use',
    titleZh: '3. 我们如何使用',
    titleEn: '3. How we use it',
    bodyZh: (
      <p>
        用于提供日历、训练、摄入、体重与日志等功能；登录后云端同步；账号安全与防滥用；排查问题及法律要求下的义务。我们不出售你的个人信息，也不做第三方广告追踪。
      </p>
    ),
    bodyEn: (
      <p>
        We use data to run core features (calendar, training, nutrition,
        weight, logs), sync after sign-in, secure accounts, troubleshoot, and
        meet legal duties. We do not sell your personal information or run
        third-party ad tracking.
      </p>
    ),
  },
  {
    id: 'sharing',
    titleZh: '4. 共享与第三方',
    titleEn: '4. Sharing & third parties',
    bodyZh: (
      <p>
        仅在必要时与服务提供商共享：Google Firebase（登录与云端数据）、Vercel（托管）。其处理受各自隐私政策约束。法律要求时也可能披露。
      </p>
    ),
    bodyEn: (
      <p>
        We share only as needed with providers: Google Firebase (auth & cloud
        data) and Vercel (hosting), under their own privacy terms. We may also
        disclose when required by law.
      </p>
    ),
  },
  {
    id: 'storage',
    titleZh: '5. 保存与安全',
    titleEn: '5. Retention & security',
    bodyZh: (
      <p>
        云端数据在提供服务及法律所需期间保留；本地数据随你清除浏览器站点数据或卸载
        PWA 而删除。我们使用传输加密、云端按用户隔离等合理措施；请妥善保管登录凭证。本服务仅供个人健身参考，不构成医疗建议。
      </p>
    ),
    bodyEn: (
      <p>
        Cloud data is kept while needed to provide the Service and meet legal
        requirements; local data goes away when you clear site data or remove
        the PWA. We use reasonable measures such as encryption in transit and
        per-user cloud isolation - please protect your credentials. The Service
        is for personal fitness planning only, not medical advice.
      </p>
    ),
  },
  {
    id: 'rights',
    titleZh: '6. 你的权利',
    titleEn: '6. Your rights',
    bodyZh: (
      <p>
        你可在应用内查看与修改自己的数据，也可通过{' '}
        <a
          className="underline underline-offset-2"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          tianyaliu0309@gmail.com
        </a>{' '}
        联系我们，请求删除账号及相关云端数据。
      </p>
    ),
    bodyEn: (
      <p>
        You can view and edit your data in the app. Contact us via{' '}
        <a
          className="underline underline-offset-2"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          tianyaliu0309@gmail.com
        </a>{' '}
        to request deletion of your account and related cloud data.
      </p>
    ),
  },
  {
    id: 'changes',
    titleZh: '7. 更新',
    titleEn: '7. Changes',
    bodyZh: (
      <p>
        我们可能更新本政策，并在此页更新生效日期。继续使用即表示你了解更新后的内容。
      </p>
    ),
    bodyEn: (
      <p>
        We may update this Policy and revise the effective date on this page.
        Continued use means you acknowledge the updated Policy.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <AmbientField />
      <BackToTop />
      <div className="relative z-[1] min-h-screen px-4 pb-16 pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink/90 active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.25}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回应用 · Back to app
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center rounded-2xl border border-ink/10 bg-white/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-white"
            >
              关于 · About
            </Link>
          </div>

          <article className="animate-enter">
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                隐私政策 · Privacy Policy
              </h1>
              <p className="mt-3 text-sm text-ink-muted">
                生效 / Effective: {LAST_UPDATED_ZH} · {LAST_UPDATED}
              </p>
            </header>

            <div className="space-y-5">
              {SECTIONS.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-24 glass-panel rounded-3xl p-5 sm:p-6"
                >
                  <h2 className="text-base font-bold text-ink">{s.titleZh}</h2>
                  <p className="mt-0.5 text-sm font-semibold text-ink-muted">
                    {s.titleEn}
                  </p>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
                    <div>{s.bodyZh}</div>
                    <div className="border-t border-ink/5 pt-3">{s.bodyEn}</div>
                  </div>
                </section>
              ))}
            </div>

            <footer className="mt-10 space-y-3 border-t border-ink/5 pt-6 text-center text-xs text-ink-muted">
              <p>
                <Link
                  href="/about"
                  className="underline-offset-2 hover:text-ink hover:underline"
                >
                  关于 · About
                </Link>
                <span className="mx-2 text-ink-faint">·</span>
                <Link
                  href="/"
                  className="underline-offset-2 hover:text-ink hover:underline"
                >
                  返回应用 · Back to app
                </Link>
              </p>
              <p>
                © {new Date().getFullYear()}{' '}
                <a
                  href={CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer me author"
                  className="font-medium underline-offset-2 hover:text-ink hover:underline"
                >
                  {OPERATOR}
                </a>
                . All rights reserved.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}
