import { describe, it, expect, vi, beforeEach } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn(), identify: vi.fn(), upstream: vi.fn() }));
vi.mock('../../api/_drive.js', () => ({
  database: () => ({ doc: () => ({ get: mocks.get }) }), identify: mocks.identify, driveFetch: mocks.upstream,
  sendError: (res, err) => res.status(err.status || 500).json({ error: err.message }),
}));
import handler from '../../api/_drive-file.js';
function response() {
  return { headers: {}, statusCode: 200, setHeader(k,v) { this.headers[k] = v; }, removeHeader(k) { delete this.headers[k]; }, status(n) { this.statusCode=n; return this; }, json(data) { this.body=data; return this; }, end(data) { this.body=data; return this; } };
}
const file = { path: 'library_covers/a.png', size: 6, type: 'image/png', access: 'public', completed: true };
beforeEach(() => mocks.get.mockResolvedValue({ data: () => file }));
describe('Drive media endpoint', () => {
  it('serves an exact byte range without exposing OAuth credentials', async () => {
    mocks.upstream.mockResolvedValue(new Response(new Uint8Array([2,3,4]), { status: 206 }));
    const res = response();
    await handler({ method: 'GET', query: { id: 'abcdefghijk' }, headers: { range: 'bytes=2-4' } }, res);
    expect(res.statusCode).toBe(206);
    expect(res.headers['Content-Range']).toBe('bytes 2-4/6');
    expect([...res.body]).toEqual([2,3,4]);
    expect(mocks.identify).not.toHaveBeenCalled();
  });
  it('denies guessed private file IDs', async () => {
    mocks.get.mockResolvedValue({ data: () => ({ ...file, access: 'owner', owner: 'alice' }) });
    mocks.identify.mockResolvedValue({ uid: 'bob', role: 'staff' });
    const res = response();
    await handler({ method: 'GET', query: { id: 'abcdefghijk', meta: '1' }, headers: {} }, res);
    expect(res.statusCode).toBe(403);
    expect(mocks.upstream).not.toHaveBeenCalled();
  });
  it('never delivers unpublished or deleted uploads', async () => {
    for (const state of [{ completed: false }, { deleted: true }]) {
      mocks.get.mockResolvedValue({ data: () => ({ ...file, ...state }) });
      const res = response();
      await handler({ method: 'GET', query: { id: 'abcdefghijk' }, headers: {} }, res);
      expect(res.statusCode).toBe(404);
    }
  });
  it('limits each backend response to a bounded chunk', async () => {
    mocks.get.mockResolvedValue({ data: () => ({ ...file, size: 20 * 1024 ** 2 }) });
    const res = response();
    await handler({ method: 'GET', query: { id: 'abcdefghijk' }, headers: {} }, res);
    expect(res.statusCode).toBe(413);
    expect(mocks.upstream).not.toHaveBeenCalled();
  });
});
