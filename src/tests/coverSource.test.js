import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../../api/_firebase-admin.js', () => ({ verifyIdToken: async () => ({ uid: 'user' }) }));
import handler, { anyFlipCover } from '../../api/_cover-source.js';
import { detectCoverFormat } from '../utils/coverFormat.js';
function response() {
  return { headers: {}, statusCode: 200, setHeader(k,v) { this.headers[k] = v; }, status(n) { this.statusCode=n; return this; }, json(data) { this.body=data; return this; }, end(data) { this.body=data; return this; } };
}
const request = (query = {}) => ({ method: 'GET', headers: { authorization: 'Bearer token' }, query: { url: 'https://example.com/book', ...query } });
afterEach(() => vi.unstubAllGlobals());
it('detects file signatures rather than assuming every link is PDF', () => {
  expect(detectCoverFormat(new TextEncoder().encode('%PDF-1.7'))).toBe('pdf');
  expect(detectCoverFormat(new Uint8Array([0xff, 0xd8, 0xff]))).toBe('image');
  expect(detectCoverFormat(new TextEncoder().encode('PK\x03\x04'))).toBe('epub');
  expect(detectCoverFormat(new TextEncoder().encode('<html>login</html>'))).toBeNull();
});
it('finds public AnyFlip metadata without executing reader scripts', () => {
  expect(anyFlipCover('<meta content="https://online.anyflip.com/a/b/files/thumb/1.jpg?x=1&amp;y=2" property="og:image">', 'https://anyflip.com/a/b')).toContain('x=1&y=2');
  expect(() => anyFlipCover('<meta property="og:image" content="http://127.0.0.1/private">', 'https://anyflip.com/a/b')).toThrow();
});
it('requires authentication and refuses private targets', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  const res = response();
  await handler({ ...request(), headers: {} }, res);
  expect(res.statusCode).toBe(401);
  await handler(request({ url: 'https://127.0.0.1/file' }), res);
  expect(res.statusCode).toBe(422);
  expect(fetcher).not.toHaveBeenCalled();
});
it('reports blocked AnyFlip sources without retrying or bypassing them', async () => {
  const fetcher = vi.fn(async () => new Response('blocked', { status: 403 })); vi.stubGlobal('fetch', fetcher);
  const res = response(); await handler(request({ url: 'https://online.anyflip.com/a/b/mobile/' }), res);
  expect(res.statusCode).toBe(403);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it('sniffs a short prefix and reports byte-range support', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('%PDF-1.7', { status: 206, headers: { 'content-range': 'bytes 0-7/9999' } })));
  const res = response(); await handler(request(), res);
  expect(res.body).toMatchObject({ kind: 'pdf', size: 9999, range: true });
});
it('delivers bounded image bytes for canvas rendering', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([0xff, 0xd8, 0xff, 0]))));
  const res = response(); await handler(request({ asset: '1' }), res);
  expect(res.statusCode).toBe(200);
  expect(res.headers['Content-Disposition']).toBe('attachment');
});
