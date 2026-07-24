export const config = {
  runtime: 'edge',
};

// Server-side proxy for the OpenRouter AI API. The secret key lives only in the
// Vercel env var OPENROUTER_API_KEY and is attached here, so the browser never sees
// it.
const BASE = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const key = process.env.OPENROUTER_API_KEY;

  // Health probe: lets the UI say "the key isn't set on the server" up front
  if (req.method === 'GET' && new URL(req.url).searchParams.get('path') === 'health') {
    return new Response(JSON.stringify({ configured: !!key, upstream: 'OpenRouter' }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  if (!key) {
    return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    const payload = await req.json();

    // Default to gpt-4o-mini if no model is provided
    if (!payload.model) {
      payload.model = 'openai/gpt-4o-mini';
    }

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${key}`);
    headers.set('Content-Type', 'application/json');
    headers.set('HTTP-Referer', 'https://samong.app'); // Update this to your actual app URL if needed
    headers.set('X-Title', 'Talib Club');

    const upstream = await fetch(BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const respHeaders = new Headers(cors);
    respHeaders.set('content-type', upstream.headers.get('content-type') || 'application/json');

    if (!upstream.ok) {
      const raw = (await upstream.text().catch(() => '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return new Response(JSON.stringify({ error: 'ai_upstream_error', status: upstream.status, detail: raw.slice(0, 300) }), {
        status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}

