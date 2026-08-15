import type { Metadata } from 'next';

export const SITE_NAME = 'Fitness Pilot';
export const SITE_NAME_ZH = 'Fitness Pilot - 碳循环训练助手';

export const SITE_TAGLINE_ZH = '碳循环训练助手';
export const SITE_TAGLINE_EN = 'Carb-Cycling Training Helper';

export const SITE_DESCRIPTION_ZH =
  'Fitness Pilot 是免费的碳循环健身助手：按周期规划低碳/高碳日、训练安排、营养目标、体重与训练日志，支持云端同步与手机安装（PWA）。';

export const SITE_DESCRIPTION_EN =
  'Fitness Pilot is a free carb-cycling fitness app: plan low/high-carb days, workouts, nutrition targets, weight tracking, and training logs - with cloud sync and installable PWA.';

/** Combined description for bilingual SERP / social previews. */
export const SITE_DESCRIPTION = `${SITE_DESCRIPTION_ZH} ${SITE_DESCRIPTION_EN}`;

export const SITE_KEYWORDS = [
  'Fitness Pilot',
  '碳循环',
  '碳循环训练',
  '低碳日',
  '高碳日',
  '健身计划',
  '训练日志',
  '营养目标',
  '体重追踪',
  'carb cycling',
  'carb cycling app',
  'low carb high carb',
  'workout planner',
  'nutrition tracker',
  'fitness PWA',
] as const;

export type SeoRouteId =
  | 'home'
  | 'about'
  | 'privacy'
  | 'intake'
  | 'planning'
  | 'training'
  | 'settings'
  | 'workout-log'
  | 'profile'
  | 'login'
  | 'day';

type RouteSeo = {
  path: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  index: boolean;
  follow?: boolean;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

export const SEO_ROUTES: Record<SeoRouteId, RouteSeo> = {
  home: {
    path: '/',
    titleZh: '碳循环日历与训练助手',
    titleEn: 'Carb-Cycling Calendar & Training Helper',
    descriptionZh:
      '用日历查看每日低碳/高碳与训练安排，记录完成情况与体重，支持暂停日与周期重置。',
    descriptionEn:
      'See daily low/high-carb and workout plans on a calendar, log sessions and weight, pause days, and reset your cycle.',
    index: true,
    changeFrequency: 'weekly',
    priority: 1,
  },
  about: {
    path: '/about',
    titleZh: '关于 Fitness Pilot',
    titleEn: 'About Fitness Pilot',
    descriptionZh:
      '了解 Fitness Pilot：碳循环日程、摄入目标、训练计划、体重与日志如何帮助你坚持训练。免费试用演示数据，登录后云端同步。',
    descriptionEn:
      'Learn how Fitness Pilot helps with carb-cycling schedules, nutrition targets, training plans, weight, and logs. Try the demo free; sign in to sync to the cloud.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  privacy: {
    path: '/privacy',
    titleZh: '隐私政策',
    titleEn: 'Privacy Policy',
    descriptionZh:
      'Fitness Pilot 隐私政策：我们如何收集、使用、存储与保护你的账号与健身数据。',
    descriptionEn:
      'Fitness Pilot Privacy Policy: how we collect, use, store, and protect your account and fitness data.',
    index: true,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
  intake: {
    path: '/intake',
    titleZh: '摄入要求',
    titleEn: 'Nutrition Targets',
    descriptionZh: '分别为低碳日与高碳日设置餐食与宏量营养目标（蛋白质、碳水、脂肪）。',
    descriptionEn:
      'Set meal plans and macro targets (protein, carbs, fat) separately for low-carb and high-carb days.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  planning: {
    path: '/planning',
    titleZh: '训练计划',
    titleEn: 'Training Plan',
    descriptionZh: '配置周期内每日训练内容与碳循环天数（低碳 + 高碳）。',
    descriptionEn: 'Configure daily workouts and your carb-cycle length (low + high days).',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  training: {
    path: '/training',
    titleZh: '训练安排',
    titleEn: 'Workouts',
    descriptionZh: '编辑周期中每一天的训练重点。',
    descriptionEn: 'Edit the workout focus for each day in your cycle.',
    index: false,
    changeFrequency: 'monthly',
    priority: 0.3,
  },
  settings: {
    path: '/settings',
    titleZh: '碳循环设置',
    titleEn: 'Carb Cycle Settings',
    descriptionZh: '设置周期起始日、天数与每日低碳/高碳类型。',
    descriptionEn: 'Set cycle start date, length, and low/high-carb type per day.',
    index: false,
    changeFrequency: 'monthly',
    priority: 0.3,
  },
  'workout-log': {
    path: '/workout-log',
    titleZh: '训练日志',
    titleEn: 'Workout Log',
    descriptionZh: '回顾过往训练完成情况、完成率与连续打卡。',
    descriptionEn: 'Review past sessions, completion rate, and streaks.',
    index: true,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  profile: {
    path: '/profile',
    titleZh: '个人资料与体重',
    titleEn: 'Profile & Weight',
    descriptionZh: '管理身高体重、BMI 参考与每日称重记录，并可切换中英文界面。',
    descriptionEn:
      'Manage height, weight, BMI reference, daily weigh-ins, and switch between Chinese and English.',
    index: true,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  login: {
    path: '/login',
    titleZh: '登录 / 注册',
    titleEn: 'Sign In / Sign Up',
    descriptionZh: '登录 Fitness Pilot，将训练与摄入数据同步到云端。',
    descriptionEn: 'Sign in to Fitness Pilot to sync training and nutrition data to the cloud.',
    index: false,
    follow: false,
  },
  day: {
    path: '/day',
    titleZh: '日程详情',
    titleEn: 'Day Detail',
    descriptionZh: '查看并记录某一天的训练与营养完成情况。',
    descriptionEn: 'View and log training and nutrition for a specific day.',
    index: false,
    follow: true,
  },
};

/** Routes that render without waiting for auth/app hydration (crawlable HTML). */
export const SEO_SHELL_BYPASS_PATHS = new Set(['/login', '/about', '/privacy']);

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/\/$/, '')}`;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  // Production Vercel default domain (no custom domain yet).
  if (process.env.NODE_ENV === 'production') {
    return 'https://fitness-pilot.vercel.app';
  }

  return 'http://localhost:3000';
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function bilingualDescription(zh: string, en: string): string {
  return `${zh} ${en}`;
}

function bilingualTitle(zh: string, en: string): string {
  return `${zh} · ${en}`;
}

export function buildPageMetadata(routeId: SeoRouteId, extras?: Metadata): Metadata {
  const route = SEO_ROUTES[routeId];
  const title = bilingualTitle(route.titleZh, route.titleEn);
  const description = bilingualDescription(route.descriptionZh, route.descriptionEn);
  const url = absoluteUrl(route.path);
  const index = route.index;
  const follow = route.follow ?? true;

  return {
    title: {
      absolute: `${title} | ${SITE_NAME}`,
    },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: 'website',
      locale: 'zh_CN',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    ...extras,
  };
}

export function buildRootMetadata(): Metadata {
  const home = SEO_ROUTES.home;
  const url = absoluteUrl('/');

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${SITE_NAME_ZH} | ${SITE_TAGLINE_EN}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: 'Tianya Liu', url: 'https://tianyaliu.ca' }],
    creator: 'Tianya Liu',
    publisher: SITE_NAME,
    category: 'health',
    keywords: [...SITE_KEYWORDS],
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: SITE_NAME,
    },
    icons: {
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: ['/favicon-32.png'],
    },
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': url,
        en: url,
        'x-default': url,
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: SITE_NAME_ZH,
      description: SITE_DESCRIPTION,
      url,
      locale: 'zh_CN',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME_ZH,
      description: SITE_DESCRIPTION_EN,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
  };
}

export function buildWebsiteJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: [SITE_NAME_ZH, SITE_TAGLINE_EN],
    url,
    description: SITE_DESCRIPTION,
    inLanguage: ['zh-CN', 'en'],
    potentialAction: {
      '@type': 'ViewAction',
      target: url,
    },
  };
}

export function buildSoftwareApplicationJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    alternateName: SITE_NAME_ZH,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'FitnessApplication',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    url,
    description: SITE_DESCRIPTION,
    inLanguage: ['zh-CN', 'en'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Carb cycling calendar (low/high carb days)',
      'Custom training plan per cycle day',
      'Nutrition / macro targets',
      'Weight log and BMI reference',
      'Workout completion log',
      'Cloud sync after sign-in',
      'Installable Progressive Web App',
      'Chinese and English UI',
    ],
    screenshot: absoluteUrl('/icons/icon-512.png'),
    author: {
      '@type': 'Person',
      name: 'Tianya Liu',
      url: 'https://tianyaliu.ca',
    },
    creator: {
      '@type': 'Person',
      name: 'Tianya Liu',
      url: 'https://tianyaliu.ca',
    },
  };
}

export function buildOrganizationJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    logo: absoluteUrl('/icons/icon-512.png'),
    description: SITE_DESCRIPTION,
    founder: {
      '@type': 'Person',
      name: 'Tianya Liu',
      url: 'https://tianyaliu.ca',
    },
    sameAs: ['https://tianyaliu.ca'],
  };
}

export function buildAboutFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '什么是碳循环？Fitness Pilot 如何帮助我？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '碳循环是在训练周期内安排低碳日与高碳日。Fitness Pilot 用日历展示每日碳水类型与训练安排，并支持摄入目标、体重记录与训练日志。',
        },
      },
      {
        '@type': 'Question',
        name: 'What is carb cycling and how does Fitness Pilot help?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Carb cycling alternates lower- and higher-carb days across a training cycle. Fitness Pilot maps each day on a calendar with workouts, nutrition targets, weight tracking, and a workout log.',
        },
      },
      {
        '@type': 'Question',
        name: '需要付费吗？未登录可以试用吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '可以免费浏览演示数据。登录后可将数据保存到云端，并在手机与电脑之间同步。',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Fitness Pilot free? Can I try without an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can browse demo data for free. Sign in to save to the cloud and sync across phone and computer.',
        },
      },
      {
        '@type': 'Question',
        name: '支持手机安装吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '支持。Fitness Pilot 是 PWA，可在手机浏览器中「添加到主屏幕」像 App 一样使用。',
        },
      },
    ],
  };
}

export function sitemapEntries() {
  return (Object.keys(SEO_ROUTES) as SeoRouteId[])
    .map((id) => SEO_ROUTES[id])
    .filter((route) => route.index && route.path !== '/day');
}
