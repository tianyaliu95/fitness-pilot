import {
  streamCoachReply,
  type CoachChatMessage,
} from '@/lib/gemini';

export const runtime = 'nodejs';

const MAX_MESSAGES = 6;
const MAX_CONTENT_LEN = 800;

type Body = {
  messages?: CoachChatMessage[];
  locale?: string;
};

function parseMessages(body: Body): { locale: string; messages: CoachChatMessage[] } | Response {
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
    return Response.json({ error: 'Send a user message.' }, { status: 400 });
  }
  return { locale, messages };
}

export async function GET() {
  // Cheap warm for serverless / HR demo: no Gemini call.
  return Response.json({ ok: true });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'Coach is not configured.' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseMessages(body);
  if (parsed instanceof Response) return parsed;
  const { locale, messages } = parsed;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      try {
        for await (const text of streamCoachReply({ apiKey, locale, messages })) {
          send({ text });
        }
        send({ done: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Coach request failed';
        console.error('[coach]', message);
        send({ error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
