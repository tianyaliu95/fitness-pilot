/** Server-only Gemini helpers for the coach chatbot. */

/**
 * Fast lite alias for free-tier / HR demos.
 * (2.5 flash/lite are closed to many new API keys.)
 */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest';

export type CoachChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT_ZH = `你是 Fitness Pilot 的碳循环助手。用简短友好的中文回答（1–3 句或最多 3 个「· 」要点）。
只谈低碳/高碳日、训练节奏、本应用日历与计划；勿给医疗诊断。不要用 Markdown。`;

const SYSTEM_PROMPT_EN = `You are the Fitness Pilot carb-cycling coach. Reply in short friendly English (1–3 sentences or up to 3 "· " bullets).
Stick to low/high-carb days, training rhythm, and this app's calendar/plans; no medical diagnoses. No Markdown.`;

export function coachSystemPrompt(locale: string): string {
  return locale.startsWith('zh') ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
}

function buildRequestBody(locale: string, messages: CoachChatMessage[]) {
  return {
    systemInstruction: { parts: [{ text: coachSystemPrompt(locale) }] },
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: 0.55,
      // Short answers for snappy demo UX (recruiters poking the widget).
      maxOutputTokens: 320,
      // Gemini 3.x: cannot fully disable thinking; keep it minimal for TTFT.
      thinkingConfig: { thinkingLevel: 'minimal' },
    },
  };
}

type GeminiStreamChunk = {
  error?: { message?: string };
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
};

/** Stream reply text chunks from Gemini (SSE). */
export async function* streamCoachReply(opts: {
  apiKey: string;
  locale: string;
  messages: CoachChatMessage[];
}): AsyncGenerator<string> {
  const { apiKey, locale, messages } = opts;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody(locale, messages)),
  });

  if (!res.ok) {
    let message = `Gemini HTTP ${res.status}`;
    try {
      const err = (await res.json()) as GeminiStreamChunk;
      if (err.error?.message) message = err.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (!res.body) throw new Error('Empty stream body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let chunk: GeminiStreamChunk;
      try {
        chunk = JSON.parse(payload) as GeminiStreamChunk;
      } catch {
        continue;
      }
      if (chunk.error?.message) throw new Error(chunk.error.message);

      const text = chunk.candidates?.[0]?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text || '')
        .join('');
      if (text) yield text;
    }
  }
}
