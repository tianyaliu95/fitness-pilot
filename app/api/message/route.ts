const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const MAX_MESSAGE = 1000;

function firstHeader(value: string | null) {
  if (!value) return '';
  return String(value).split(',')[0].trim();
}

function decodeHeader(value: string) {
  const raw = firstHeader(value);
  if (!raw) return '';
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return raw;
  }
}

function summarizeUserAgent(ua: string) {
  if (!ua) return 'Unknown device';

  let os = 'Unknown OS';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
  return `${device} · ${os} · ${browser}`;
}

function collectMeta(req: Request, client: Record<string, unknown> = {}) {
  const headers = req.headers;
  const ua = firstHeader(headers.get('user-agent'));
  const ip =
    firstHeader(headers.get('x-forwarded-for')) ||
    firstHeader(headers.get('x-real-ip')) ||
    'Unknown';

  const country = decodeHeader(headers.get('x-vercel-ip-country') || '');
  const region = decodeHeader(headers.get('x-vercel-ip-country-region') || '');
  const city = decodeHeader(headers.get('x-vercel-ip-city') || '');
  const geoParts = [city, region, country].filter(Boolean);

  return {
    device: summarizeUserAgent(ua),
    ip: ip || 'Unknown',
    geo: geoParts.length ? geoParts.join(', ') : 'Unknown',
    country: country || 'Unknown',
    region: region || 'Unknown',
    city: city || 'Unknown',
    language:
      (client.language as string | undefined) ||
      firstHeader(headers.get('accept-language')) ||
      'Unknown',
    timezone: (client.timezone as string | undefined) || 'Unknown',
    screen:
      client.screenWidth && client.screenHeight
        ? `${String(client.screenWidth)}×${String(client.screenHeight)}`
        : 'Unknown',
    // Original traffic source captured on first page load
    trafficReferrer:
      (client.trafficReferrer as string | undefined) || 'Direct / unknown',
    landingPath: (client.landingPath as string | undefined) || 'Unknown',
  };
}

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const webhookUrl = DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json(
      { error: 'Message inbox is not configured yet.' },
      { status: 503 }
    );
  }

  let body: {
    message?: string;
    website?: string;
    client?: Record<string, unknown>;
    source?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message = '', website = '', client = {} } = body || {};

  // Honeypot — bots fill hidden fields.
  if (typeof website === 'string' && website.trim()) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const trimmedMessage = String(message).trim().slice(0, MAX_MESSAGE);

  if (!trimmedMessage || trimmedMessage.length < 2) {
    return Response.json({ error: 'Message is too short.' }, { status: 400 });
  }

  const meta = collectMeta(req, client);
  const heading = '**New message from Fitness Pilot AI Chatbot**';
  const fixedBody = trimmedMessage;

  const content = [
    '================================================',
    heading,
    '',
    fixedBody,
    '',
    '------------------------------------------------',
    `**Device:** ${meta.device}`,
    `**Geo:** ${meta.geo}`,
    `**IP:** ${meta.ip}`,
    `**Timezone:** ${meta.timezone}`,
    `**Language:** ${meta.language}`,
    `**Screen:** ${meta.screen}`,
    `**Traffic referrer:** ${meta.trafficReferrer}`,
    `**Landing path:** ${meta.landingPath}`,
    '================================================',
  ].join('\n');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to deliver message.' },
        { status: 502 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json(
      { error: 'Failed to deliver message.' },
      { status: 502 }
    );
  }
}

