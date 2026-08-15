import { NextResponse } from 'next/server';
import {
  generateCoachReply,
  type CoachChatMessage,
} from '@/lib/gemini';

const MAX_MESSAGES = 12;
const MAX_CONTENT_LEN = 1500;

type Body = {
  messages?: CoachChatMessage[];
  locale?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Coach is not configured.' },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const locale = typeof body.locale === 'string' ? body.locale : 'en';
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: CoachChatMessage[] = raw
    .filter(
      (m): m is CoachChatMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_CONTENT_LEN),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_MESSAGES);

  if (messages.length === 0 || messages[messages.length - 1]?.role !== 'user') {
    return NextResponse.json({ error: 'Send a user message.' }, { status: 400 });
  }

  try {
    const reply = await generateCoachReply({ apiKey, locale, messages });
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Coach request failed';
    console.error('[coach]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
