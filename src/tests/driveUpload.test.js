import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocked = vi.hoisted(() => ({ docs: new Map(), writes: [], upstream: vi.fn(), user: { uid: 'alice', role: 'member', token: 'token' } }));
vi.mock('../../api/_drive.js', () => {
  const doc = path => ({ path,
    get: async () => ({ data: () => mocked.docs.get(path) }),
    set: async data => mocked.writes.push([path, data]),
    update: async data => mocked.writes.push([path, data]),
  });
  return {
    identify: async () => mocked.user,
    sameOrigin: () => {}, driveFetch: mocked.upstream,
    database: () => ({ doc, runTransaction: async fn => fn({ get: ref => ref.get(), set: (ref, data) => mocked.writes.push([ref.path, data]), update: (ref, data) => mocked.writes.push([ref.path, data]) }) }),
    sendError: (res, err) => res.status(err.status || 500).json({ code: err.code, error: err.message }),
  };
});
import handler from '../../api/_drive-storage.js';
const uploadId = '11111111-1111-1111-1111-111111111111';
const pending = { fileId: 'abcdefghijk', key: 'pathhash', path: 'notebooks/alice/book.json.gz', size: 10, type: 'application/gzip', uploader: 'alice', owner: 'alice', access: 'owner', version: null };
function response() {
  return { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.statusCode=n; return this; }, json(data) { this.body=data; return this; }, end() { return this; } };
}
async function complete() {
  const res = response();
  await handler({ method: 'POST', headers: { authorization: 'Bearer token' }, body: { action: 'complete', uploadId } }, res);
  return res;
}
beforeEach(() => {
  mocked.docs.clear(); mocked.writes.length = 0;
  mocked.docs.set(`_driveUploads/${uploadId}`, { ...pending, createdAt: Date.now() });
  vi.stubEnv('GOOGLE_DRIVE_FOLDER_ID', 'folder');
  mocked.upstream.mockResolvedValue(Response.json({ size: '10', mimeType: pending.type, parents: ['folder'], appProperties: { talibUpload: uploadId } }));
});
describe('Drive upload publication', () => {
  it('binds resumable uploads to the validated browser origin for CORS', async () => {
    mocked.upstream.mockResolvedValueOnce(Response.json({ ids: ['testfileid'] }))
      .mockResolvedValueOnce(new Response(null, { headers: { location: 'https://www.googleapis.com/upload/drive/v3/files?upload_id=test' } }));
    const res = response();
    await handler({ method: 'POST', headers: { authorization: 'Bearer token', origin: 'https://talibclub.org' }, body: { action: 'init', path: pending.path, size: 10, type: pending.type } }, res);
    expect(res.statusCode).toBe(200);
    expect(mocked.upstream.mock.calls.find(([path]) => path.startsWith('upload/'))[1].headers.Origin).toBe('https://talibclub.org');
  });
  it('does not accept a cookie alone for writes', async () => {
    const res = response();
    await handler({ method: 'POST', headers: {}, body: { action: 'complete', uploadId } }, res);
    expect(res.statusCode).toBe(401);
    expect(mocked.writes).toEqual([]);
  });
  it('publishes a verified upload and path atomically', async () => {
    expect((await complete()).statusCode).toBe(200);
    expect(mocked.writes.find(([path]) => path === '_driveFiles/abcdefghijk')?.[1].completed).toBe(true);
    expect(mocked.writes.find(([path]) => path === '_drivePaths/pathhash')?.[1].fileId).toBe('abcdefghijk');
  });
  it('rejects incomplete or changed upstream files before publishing', async () => {
    mocked.upstream.mockResolvedValue(Response.json({ size: '11', mimeType: pending.type, parents: ['folder'], appProperties: { talibUpload: uploadId } }));
    expect((await complete()).statusCode).toBe(409);
    expect(mocked.writes).toEqual([]);
  });
  it('does not overwrite a newer save from another device', async () => {
    mocked.docs.set('_drivePaths/pathhash', { fileId: 'newerfileid' });
    expect((await complete()).statusCode).toBe(409);
    expect(mocked.writes).toEqual([]);
  });
  it('does not complete somebody else’s upload', async () => {
    mocked.docs.set(`_driveUploads/${uploadId}`, { ...pending, uploader: 'bob', createdAt: Date.now() });
    expect((await complete()).statusCode).toBe(404);
    expect(mocked.upstream).not.toHaveBeenCalled();
  });
});
