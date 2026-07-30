import admin, { verifyIdToken } from './_firebase-admin.js';

// Server-side proxy for the OpenRouter AI API. The secret key lives only in the
// Vercel env var OPENROUTER_API_KEY and is attached here, so the browser never
// sees it.
//
// Hardened: requires a Firebase ID token, restricts CORS, rebuilds the upstream
// payload from an allowlist (the client can no longer pick an arbitrary model or
// token budget), and enforces a per-user daily quota — an open proxy on a paid
// key is an unbounded bill.

const BASE = 'https://openrouter.ai/api/v1/chat/completions';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://talibclub.org';

const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const ALLOWED_MODELS = new Set([
  DEFAULT_MODEL,
  ...(process.env.AI_ALLOWED_MODELS || '').split(',').map((s) => s.trim()).filter(Boolean),
]);
const MAX_TOKENS = 2048;
const MAX_MESSAGES = 20;
const DAILY_QUOTA = Number(process.env.AI_DAILY_QUOTA || 60);

// Best-effort per-instance burst limiter on top of the Firestore daily quota.
const burst = new Map(); // uid -> { count, resetAt }
function burstLimited(uid) {
  const now = Date.now();
  const entry = burst.get(uid);
  if (!entry || entry.resetAt <= now) {
    burst.set(uid, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

function dayKey() {
  // Asia/Bangkok day boundary, matching the rest of the app.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
}

async function underDailyQuota(uid) {
  const db = admin.firestore();
  const ref = db.doc(`ai_usage/${uid}`);
  const today = dayKey();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const count = data.dayKey === today ? Number(data.count || 0) : 0;
    if (count >= DAILY_QUOTA) return false;
    tx.set(ref, { dayKey: today, count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return true;
  });
}

function send(res, status, data) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(status).json(data);
}

function parseBody(req) {
  if (!req.body) return {};
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString('utf8')); } catch { return {}; }
  }
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const key = process.env.OPENROUTER_API_KEY;

  // Health probe: lets the UI say "the key isn't set on the server" up front.
  if (req.method === 'GET' && req.query?.path === 'health') {
    return send(res, 200, { configured: !!key, upstream: 'OpenRouter' });
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (!key) return send(res, 503, { error: 'not_configured' });

  // Require a signed-in user — this proxy spends real money per call.
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) return send(res, 401, { error: 'unauthorized' });
  let uid;
  try {
    uid = (await verifyIdToken(authHeader.substring(7))).uid;
  } catch {
    return send(res, 401, { error: 'unauthorized' });
  }

  if (burstLimited(uid)) return send(res, 429, { error: 'rate_limited' });
  try {
    if (!(await underDailyQuota(uid))) return send(res, 429, { error: 'daily_quota_exceeded' });
  } catch (e) {
    console.error('ai quota check failed', e);
    // Fail open on quota bookkeeping errors — auth already gates the endpoint.
  }

  const body = parseBody(req);
  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  if (!messages.length) return send(res, 400, { error: 'missing_messages' });

  // Rebuild the payload from an allowlist — never forward the client's object.
  const payload = {
    model: ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL,
    messages,
    max_tokens: Math.min(Math.max(Number(body.max_tokens) || 1024, 1), MAX_TOKENS),
    temperature: Math.min(Math.max(Number(body.temperature ?? 0.2), 0), 1),
  };

  try {
    const upstream = await fetch(BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': ALLOWED_ORIGIN,
        'X-Title': 'Talib Club',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const raw = (await upstream.text().catch(() => '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (upstream.status === 401 || upstream.status === 403) {
        return send(res, upstream.status, { error: 'ai_auth_failed' });
      }
      return send(res, upstream.status, { error: 'ai_upstream_error', status: upstream.status, detail: raw.slice(0, 300) });
    }

    const data = await upstream.json();
    return send(res, 200, data);
  } catch (error) {
    return send(res, 502, { error: String(error?.message || error) });
  }
}
