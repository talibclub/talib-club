import { afterEach, expect, it, vi } from 'vitest';
import { Writable } from 'node:stream';
import { once } from 'node:events';
vi.mock('../../api/_firebase-admin.js', () => ({ verifyIdToken: async () => ({ uid: 'user' }) }));
import handler from '../../api/_legacy-pdf.js';
function response() {
  const res = new Writable({ write(chunk, _enc, cb) { res.chunks.push(chunk); cb(); } });
  res.chunks = []; res.headers = {}; res.statusCode = 200;
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = code => { res.statusCode = code; return res; };
  res.send = text => res.end(text);
  return res;
}
afterEach(() => vi.unstubAllGlobals());
it('forwards byte ranges and preserves partial response headers', async () => {
  const fetcher = vi.fn(async () => new Response('pdf', { status: 206, headers: { 'content-type': 'application/pdf', 'accept-ranges': 'bytes', 'content-range': 'bytes 0-2/9999', 'content-length': '3' } }));
  vi.stubGlobal('fetch', fetcher);
  const res = response(); const finished = once(res, 'finish');
  await handler({ method: 'GET', headers: { authorization: 'Bearer token', range: 'bytes=0-2' }, query: { url: 'https://example.com/book.pdf' } }, res);
  await finished;
  expect(fetcher.mock.calls[0][1].headers.Range).toBe('bytes=0-2');
  expect(res.statusCode).toBe(206);
  expect(res.headers['Content-Range']).toBe('bytes 0-2/9999');
  expect(res.headers['Accept-Ranges']).toBe('bytes');
});
it('normalizes Drive preview links while retaining the resource key', async () => {
  const fetcher = vi.fn(async () => new Response('login', { headers: { 'content-type': 'text/html' } }));
  vi.stubGlobal('fetch', fetcher);
  const res = response();
  await handler({ method: 'GET', headers: { authorization: 'Bearer token' }, query: { url: 'https://drive.google.com/file/d/abc123/preview?resourcekey=secret' } }, res);
  const url = new URL(fetcher.mock.calls[0][0]);
  expect(url.hostname).toBe('drive.usercontent.google.com');
  expect(url.searchParams.get('id')).toBe('abc123');
  expect(url.searchParams.get('resourcekey')).toBe('secret');
  expect(res.statusCode).toBe(415);
});
