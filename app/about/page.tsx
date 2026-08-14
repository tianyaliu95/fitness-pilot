import type { Metadata } from 'next';
import Link from 'next/link';
import { AmbientField } from '@/components/AmbientField';
import { JsonLd } from '@/components/JsonLd';
import { BackToTop } from '@/components/BackToTop';
import {
  SITE_NAME,
  SITE_TAGLINE_EN,
  SITE_TAGLINE_ZH,
  buildAboutFaqJsonLd,
  buildPageMetadata,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('about');

const FEATURES = [
  {
    zh: '碳循环日历',
    en: 'Carb-cycling Calendar',
    detailZh: '按周期自动映射低碳日 / 高碳日与训练内容，一目了然。',
    detailEn: 'Map low/high-carb days and workouts across your cycle at a glance.',
  },
  {
    zh: '摄入与宏量目标',
    en: 'Nutrition & Macros',
    detailZh: '分别为低碳 / 高碳日设置餐食与蛋白质、碳水、脂肪参考范围。',
    detailEn: 'Separate meal plans and protein / carb / fat targets for low and high days.',
  },
  {
    zh: '训练计划与暂停日',
    en: 'Plans & Pause Days',
    detailZh: '自定义每日训练重点；暂停一天时，原计划顺延到明天。',
    detailEn: 'Customize daily workout focus; pausing a day defers that plan to tomorrow.',
  },
  {
    zh: '体重、BMI 与训练日志',
    en: 'Weight, BMI & Logs',
    detailZh: '记录称重趋势，查看完成率与连续打卡。',
    detailEn: 'Track weigh-ins, BMI reference, completion rate, and streaks.',
  },
  {
    zh: '云端同步与 PWA',
    en: 'Cloud Sync & PWA',
    detailZh: '登录后手机与电脑同步；可添加到主屏幕像 App 一样使用。',
    detailEn: 'Sign in to sync across devices; install to your home screen like an app.',
  },
  {
    zh: '中英双语界面',
    en: 'Chinese & English',
    detailZh: '界面语言可随时切换，适合中英文用户。',
    detailEn: 'Switch the UI language anytime for Chinese or English users.',
  },
] as const;

const FAQS = [
  {
    qZh: '需要付费吗？未登录可以试用吗？',
    aZh: '可以免费浏览演示数据。登录后可将数据保存到云端，并在手机与电脑之间同步。',
    qEn: 'Is it free? Can I try without an account?',
    aEn: 'Yes. Browse demo data for free. Sign in to save to the cloud and sync across phone and computer.',
  },
  {
    qZh: '什么是「暂停一天」？',
    aZh: '勾选暂停后，当天的周期计划会顺延到下一天，当天训练记为未完成，方便生病或出差时不打乱后续节奏。',
    qEn: 'What does "pause a day" do?',
    aEn: "Pausing defers today's cycle plan to tomorrow and marks the workout incomplete — useful when you're sick or traveling.",
  },
  {
    qZh: '如何在手机上安装？',
    aZh: '在 Safari 等浏览器中打开本站，使用「分享 → 添加到主屏幕」即可。',
    qEn: 'How do I install on my phone?',
    aEn: 'Open the site in Safari (or your browser) and use Share → Add to Home Screen.',
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildAboutFaqJsonLd()} />
      <AmbientField />
      <BackToTop />
      <div className="relative z-[1] min-h-screen px-4 pb-16 pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pt-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-3">
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
              返回应用 · Back to App
            </Link>
          </div>

          <article className="animate-enter">
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-wide text-low-dark">
              {SITE_NAME}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {SITE_TAGLINE_ZH}
            </h1>
            <p className="mt-2 text-lg font-semibold text-ink-muted">{SITE_TAGLINE_EN}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              Fitness Pilot
              帮你把碳循环训练落到日历上：低碳 / 高碳日、训练安排、营养目标、体重与日志集中管理，支持演示试用与登录后云端同步。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
              Fitness Pilot helps you run carb cycling on a calendar — low/high-carb days,
              workouts, nutrition targets, weight, and logs — with a free demo and optional
              cloud sync after sign-in.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink/90"
              >
                打开App · Open App
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-ink/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white"
              >
                登录同步 · Sign In
              </Link>
            </div>
          </header>

          <section className="glass-panel rounded-3xl p-5 sm:p-7" aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-lg font-bold text-ink sm:text-xl">
              功能 · Features
            </h2>
            <ul className="mt-5 space-y-5">
              {FEATURES.map((f) => (
                <li key={f.en} className="border-t border-ink/5 pt-5 first:border-0 first:pt-0">
                  <h3 className="text-base font-semibold text-ink">
                    {f.zh} · {f.en}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{f.detailZh}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{f.detailEn}</p>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="mt-6 glass-panel rounded-3xl p-5 sm:p-7"
            aria-labelledby="faq-heading"
          >
            <h2 id="faq-heading" className="text-lg font-bold text-ink sm:text-xl">
              常见问题 · FAQ
            </h2>
            <div className="mt-5 space-y-6">
              {FAQS.map((item) => (
                <div key={item.qEn}>
                  <h3 className="text-sm font-semibold text-ink">{item.qZh}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.aZh}</p>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{item.qEn}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.aEn}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-10 space-y-3 border-t border-ink/5 pt-6 text-center text-xs text-ink-muted">
            <p>
              <Link href="/" className="underline-offset-2 hover:text-ink hover:underline">
                ← 返回应用 · Back to App
              </Link>
            </p>
            <p>
              <Link
                href="/privacy"
                className="font-medium underline-offset-2 hover:text-ink hover:underline"
              >
                隐私政策 · Privacy Policy
              </Link>
            </p>
            <p>
              © {new Date().getFullYear()}{' '}
              <a
                href="https://tianyaliu.ca"
                target="_blank"
                rel="noopener noreferrer me author"
                className="font-medium underline-offset-2 hover:text-ink hover:underline"
              >
                Tianya Liu
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
