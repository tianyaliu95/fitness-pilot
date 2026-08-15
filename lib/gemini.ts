/** Server-only Gemini helpers for the coach chatbot. */

export const GEMINI_MODEL = 'gemini-flash-latest';

export type CoachChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT_ZH = `你是 Fitness Pilot 的碳循环健身助手。用简洁、友好的中文回答。
专注：低碳/高碳日、训练节奏、宏观营养大致原则、如何用本应用的日历与计划。
不要给出医疗诊断或处方式建议；涉及健康问题请建议咨询专业人士。
回答尽量短（通常 3–8 句或几个短要点）。不要使用 Markdown（不要 **、#、\`\`\`）；列表用「· 」开头即可。`;

const SYSTEM_PROMPT_EN = `You are the Fitness Pilot carb-cycling coach. Answer in clear, friendly English.
Focus on: low/high-carb days, training rhythm, general macro principles, and how to use this app's calendar and plans.
Do not give medical diagnoses or prescription-style advice; suggest seeing a professional for health concerns.
Keep answers short (usually 3–8 sentences or a few short bullets). Do not use Markdown (no **, #, or code fences); start bullets with "· ".`;

export function coachSystemPrompt(locale: string): string {
  return locale.startsWith('zh') ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
}

export async function generateCoachReply(opts: {
  apiKey: string;
  locale: string;
  messages: CoachChatMessage[];
}): Promise<string> {
  const { apiKey, locale, messages } = opts;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: coachSystemPrompt(locale) }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        // Flash models may spend part of the budget on internal "thinking".
        maxOutputTokens: 2048,
      },
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((p) => p.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('Empty model response');
  return text;
}
