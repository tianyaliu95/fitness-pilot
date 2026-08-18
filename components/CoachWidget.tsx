'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useT } from '@/lib/i18n';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const SUGGESTION_KEYS = [
  'coach.suggest1',
  'coach.suggest2',
  'coach.suggest3',
  'coach.suggest4',
] as const;

const TRAFFIC_REF_KEY = 'tl_traffic_referrer';
const LANDING_PATH_KEY = 'tl_landing_path';

function captureTrafficSource() {
  if (typeof window === 'undefined') return;
  try {
    if (!sessionStorage.getItem(TRAFFIC_REF_KEY)) {
      const ref = document.referrer || 'Direct / none';
      sessionStorage.setItem(TRAFFIC_REF_KEY, ref);
    }
    if (!sessionStorage.getItem(LANDING_PATH_KEY)) {
      sessionStorage.setItem(
        LANDING_PATH_KEY,
        `${window.location.pathname}${window.location.search}`
      );
    }
  } catch {
    // sessionStorage may be blocked (privacy modes).
  }
}

function readClientMeta() {
  let trafficReferrer = 'Direct / unknown';
  let landingPath =
    typeof window !== 'undefined' ? window.location.pathname : 'Unknown';

  try {
    trafficReferrer =
      sessionStorage.getItem(TRAFFIC_REF_KEY) || document.referrer || trafficReferrer;
    landingPath = sessionStorage.getItem(LANDING_PATH_KEY) || landingPath;
  } catch {
    trafficReferrer = document.referrer || trafficReferrer;
  }

  return {
    language: typeof navigator !== 'undefined' ? navigator.language : '',
    timezone:
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : '',
    screenWidth: typeof window !== 'undefined' ? window.screen?.width : '',
    screenHeight: typeof window !== 'undefined' ? window.screen?.height : '',
    trafficReferrer,
    landingPath,
  };
}

function reportToDiscord(message: string) {
  // Best-effort: never block coach UX.
  void fetch('/api/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'coach',
      message,
      website: '', // honeypot field
      client: readClientMeta(),
    }),
    keepalive: true,
  }).catch(() => {});
}

/** Chat panel + FAB; stacked above BackToTop inside FloatingCorner. */
export function CoachWidget() {
  const t = useT();
  const { locale } = useLocale();
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelExiting, setPanelExiting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();

  function openPanel() {
    setPanelMounted(true);
    setPanelExiting(false);
    // Warm serverless route so the first real ask is less cold.
    void fetch('/api/coach', { method: 'GET', cache: 'no-store' }).catch(() => {});
  }

  function closePanel() {
    if (!panelMounted || panelExiting) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPanelMounted(false);
      setPanelExiting(false);
      return;
    }
    setPanelExiting(true);
  }

  function onPanelAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!panelExiting) return;
    setPanelMounted(false);
    setPanelExiting(false);
  }

  const expanded = panelMounted && !panelExiting;

  useEffect(() => {
    // Capture traffic source once for better Discord meta.
    captureTrafficSource();
  }, []);

  useEffect(() => {
    if (!expanded) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded, panelExiting, panelMounted]);

  useEffect(() => {
    if (!expanded) return;
    const tmr = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(tmr);
  }, [expanded]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    // Report the user's prompt to Discord asynchronously.
    reportToDiscord(content);

    setError(null);
    setInput('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
    };
    const assistantId = `a-${Date.now()}`;
    const next = [...messages, userMsg];
    setMessages([
      ...next,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setBusy(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          messages: next.map(({ role, content: c }) => ({ role, content: c })),
        }),
      });

      if (!res.ok || !res.body) {
        let message = t('coach.error');
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let gotText = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const block of parts) {
          const line = block
            .split('\n')
            .map((l) => l.trim())
            .find((l) => l.startsWith('data:'));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;

          let event: { text?: string; error?: string; done?: boolean };
          try {
            event = JSON.parse(payload) as {
              text?: string;
              error?: string;
              done?: boolean;
            };
          } catch {
            continue;
          }

          if (event.error) throw new Error(event.error);
          if (event.text) {
            gotText = true;
            const chunk = event.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          }
        }
      }

      if (!gotText) throw new Error(t('coach.error'));
    } catch (err) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantId || m.content.trim().length > 0)
      );
      setError(err instanceof Error ? err.message : t('coach.error'));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="flex flex-col items-end">
      {panelMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('coach.title')}
          aria-modal="false"
          onAnimationEnd={onPanelAnimationEnd}
          className={`mb-3 flex h-[min(32rem,calc(100dvh-10rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-card backdrop-blur-xl ${
            panelExiting
              ? 'pointer-events-none coach-panel-exit'
              : 'pointer-events-auto coach-panel-enter'
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-ink/5 bg-gradient-to-br from-low-light/80 via-white to-white px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
                <ChatIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold text-ink">{t('coach.title')}</p>
                  <span className="rounded-md bg-low-dark px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {t('coach.badge')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">{t('coach.poweredBy')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label={t('coach.close')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-white/80 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-ink-muted">
                  {t('coach.welcome')}
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTION_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      disabled={busy}
                      onClick={() => void send(t(key))}
                      className="rounded-2xl border border-ink/10 bg-surface px-3 py-2 text-left text-xs font-medium text-ink transition hover:border-ink/20 hover:bg-white disabled:opacity-50"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' ? (
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-low-light text-low-dark"
                      aria-hidden
                    >
                      <ChatIcon className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed sm:text-sm ${
                      m.role === 'user'
                        ? 'bg-ink text-white'
                        : 'border border-ink/8 bg-surface text-ink'
                    }`}
                  >
                    {m.content || (busy ? t('coach.thinking') : '')}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-ink/5 bg-white/70 px-3 py-2.5"
          >
            {error ? (
              <p className="mb-1.5 text-[11px] text-danger-text" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                maxLength={1500}
                disabled={busy}
                placeholder={t('coach.placeholder')}
                className="min-h-[2.5rem] flex-1 resize-none rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/20 focus-visible:ring-2 focus-visible:ring-low/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="shrink-0 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('coach.send')}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
              {t('coach.disclaimer')}
            </p>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (expanded ? closePanel() : openPanel())}
        aria-expanded={expanded}
        aria-controls={panelMounted ? panelId : undefined}
        aria-label={expanded ? t('coach.close') : t('coach.open')}
        className={`pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink text-white shadow-card transition hover:bg-ink/90 active:scale-[0.98] ${
          expanded ? 'h-14 w-14 justify-center' : 'h-14 pl-4 pr-5'
        }`}
      >
        {expanded ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <>
            <ChatIcon className="coach-fab-sparkle h-[1.15rem] w-[1.15rem]" />
            <span className="text-sm font-bold tracking-tight">{t('coach.fabLabel')}</span>
          </>
        )}
      </button>
    </div>
  );
}

function ChatIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}

function CloseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
