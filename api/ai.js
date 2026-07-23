export const config = {
  runtime: 'edge',
};

// Server-side proxy for the uncledev.net AI API. The secret key lives only in the
// Vercel env var UNCLEDEV_AI_KEY and is attached here, so the browser never sees
// it. The client posts to /api/ai?path=chat|generate-image|attachments with the
// same body it would send upstream (JSON or multipart), and we forward it.
const BASE = 'https://ai.uncledev.net';
const ALLOWED = new Set(['chat', 'generate-image', 'attachments']);

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const key = process.env.UNCLEDEV_AI_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get('path') || 'chat';
  if (!ALLOWED.has(path)) {
    return new Response(JSON.stringify({ error: 'bad_path' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    // Forward the incoming body untouched (JSON or multipart/form-data — the
    // original content-type carries the multipart boundary), adding only auth.
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${key}`);
    const ct = req.headers.get('content-type');
    if (ct) headers.set('content-type', ct);

    const upstream = await fetch(`${BASE}/api/v1/${path}`, {
      method: 'POST',
      headers,
      body: req.body,
      duplex: 'half',
    });

    const respHeaders = new Headers(cors);
    respHeaders.set('content-type', upstream.headers.get('content-type') || 'application/json');
    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
