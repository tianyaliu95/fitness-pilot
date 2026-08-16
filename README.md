# Fitness Pilot - 碳循环训练助手

**[Live demo →](https://fitness-pilot.vercel.app)**

A bilingual (中文 / English) carb-cycling training app: plan low/high-carb days on a calendar, track nutrition targets, workouts, weight, and logs - with optional cloud sync and an on-site AI coach.

Built as a production-style PWA (installable on phone), not a throwaway prototype.

---

## What it does

- **Carb-cycle calendar** - multi-day low / high schedule with today focus, pause/delay, and day detail
- **Planning & intake** - per-day workout focus plus separate macros for low vs high days
- **Workout log & profile** - training notes, weight history, BMI-oriented profile
- **Guest demo → sign-in sync** - try with sample data; Google / email login saves to the cloud
- **AI coach** - floating chat powered by Gemini; replies **stream token-by-token** (SSE)
- **i18n** - full ZH / EN UI
- **Onboarding tour** - short guided walkthrough for first-time visitors

---

## Stack


| Layer       | Choice                                                           |
| ----------- | ---------------------------------------------------------------- |
| App         | Next.js 14 (App Router), TypeScript, React 18                    |
| UI          | Tailwind CSS, custom ambient / glass shell                       |
| Auth & data | Firebase Auth + Firestore (guest mode without login)             |
| AI          | Google Gemini API via `POST /api/coach` (server-side, streaming) |
| Analytics   | Vercel Analytics                                                 |
| Deploy      | Vercel (`fitness-pilot.vercel.app`)                              |


---

## Engineering highlights

- **Streaming coach UX** - SSE from the API route into the chat bubble for a live, non-blocking reply feel
- **Offline-friendly guest path** - usable without an account; signed-in users get cloud persistence
- **PWA** - installable, mobile-first shell with bottom nav / desktop sidebar
- **SEO** - sitemap, metadata, Open Graph / Twitter cards, JSON-LD
- **Core Web Vitals** - early brand paint during auth hydrate, guest-banner layout reservation (CLS), deferred ambient motion, dynamic imports for non-critical UI

Lab snapshot (Lighthouse 12, mobile simulation, after CWV work):


| Perf | LCP   | CLS | FCP   | SI    |
| ---- | ----- | --- | ----- | ----- |
| 84   | 4.6 s | 0   | 0.8 s | 1.5 s |


---

## Try it

Open **[fitness-pilot.vercel.app](https://fitness-pilot.vercel.app)** - browse as guest, flip language, open the AI coach from the floating button, or sign in to sync across devices.