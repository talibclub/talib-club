import { Readable } from 'node:stream';
import { verifyIdToken } from './_firebase-admin.js';

// CORS proxy so pdf.js can read book files cross-origin.
//
// Hardened against SSRF / open-proxy abuse:
//  - requires a Firebase ID token (the reader lives behind RequireLogin)
//  - https targets only, private/internal hosts rejected
//  - response must actually be a PDF (or octet-stream) — this is not a
//    general-purpose relay
//  - response headers are built fresh instead of copied from the target
//
// Member-added external books can point at arbitrary public hosts, so a strict
// host allowlist isn't possible; the private-network block is the boundary.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://talibclub.org';
const MAX_REDIRECTS = 4;

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h === '[::1]' || h === '::1') return true;
  // IPv4 literals
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
  }
  // Any other IPv6 literal — refuse rather than parse ranges.
  if (h.startsWith('[')) return true;
  return false;
}

function validateTarget(raw) {
  let target;
  try { target = new URL(raw); } catch { return { error: 'Invalid url' }; }
  if (target.protocol !== 'https:') return { error: 'https only' };
  if (isPrivateHost(target.hostname)) return { error: 'Host not allowed' };
  return { target };
}

// fetch with manual redirect handling so every hop is re-validated.
async function fetchValidated(url) {
  let current = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const response = await fetch(current, { redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      const loc = response.headers.get('location');
      if (!loc) return { error: 'Bad redirect' };
      const next = new URL(loc, current).toString();
      const check = validateTarget(next);
      if (check.error) return { error: check.error };
      current = next;
      continue;
    }
    return { response, finalUrl: current };
  }
  return { error: 'Too many redirects' };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
  try { await verifyIdToken(authHeader.substring(7)); }
  catch { return res.status(401).send('Unauthorized'); }

  const rawUrl = req.query?.url;
  if (!rawUrl) return res.status(400).send('Missing url parameter');
  const check = validateTarget(rawUrl);
  if (check.error) return res.status(check.error === 'Host not allowed' ? 403 : 400).send(check.error);

  try {
    let { response, finalUrl, error } = await fetchValidated(check.target.toString());
    if (error) return res.status(400).send(error);

    // Bypass Google Drive Virus Scan Warning
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') && finalUrl.includes('drive.google.com')) {
      const text = await response.text();
      const match = text.match(/confirm=([a-zA-Z0-9_-]+)/);
      if (!match) return res.status(502).send('Failed to bypass Google Drive virus scan.');
      const joinChar = finalUrl.includes('?') ? '&' : '?';
      const retry = await fetchValidated(finalUrl + joinChar + 'confirm=' + match[1]);
      if (retry.error) return res.status(400).send(retry.error);
      response = retry.response;
    }

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const finalType = response.headers.get('content-type') || '';
    if (!/application\/(pdf|octet-stream|x-download)|binary\/octet-stream/i.test(finalType)) {
      return res.status(415).send('Target is not a PDF');
    }

    // Fresh headers only — never mirror the upstream's (Set-Cookie etc).
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    const len = response.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) res.status(500).send(`Error proxying PDF: ${error.message}`);
  }
}
