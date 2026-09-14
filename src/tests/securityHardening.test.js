import { beforeEach, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn(), transaction: vi.fn() }));
vi.mock('node:dns/promises', () => ({ lookup: mocks.lookup }));
vi.mock('node:https', () => ({ request: mocks.request }));
vi.mock('../../api/_firebase-admin.js', () => ({
  verifyIdToken: async () => ({ uid: 'alice' }),
  default: { firestore: () => ({ doc: vi.fn(), runTransaction: mocks.transaction }) },
}));
import { safeFetch, resolvePublicAddress, publicIPv4 } from '../../api/_safe-fetch.js';
import { selectPushRecipients, validPushEndpoint } from '../../api/_push-recipients.js';
import ai from '../../api/ai.js';

beforeEach(() => vi.unstubAllGlobals());
it('rejects private, metadata, shared and reserved address ranges', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '172.16.0.1', '192.168.1.1', '100.64.0.1', '224.0.0.1', '::1']) expect(publicIPv4(ip)).toBe(false);
  expect(publicIPv4('8.8.8.8')).toBe(true);
});
it('rejects DNS answers that include a private address', async () => {
  mocks.lookup.mockResolvedValue([{ address: '8.8.8.8' }, { address: '10.0.0.1' }]);
  await expect(resolvePublicAddress('public.example')).rejects.toThrow('Host not allowed');
  expect(mocks.request).not.toHaveBeenCalled();
});
it('pins the connection lookup to the validated address and keeps TLS hostname', async () => {
  mocks.lookup.mockResolvedValue([{ address: '8.8.8.8' }]);
  mocks.request.mockImplementation((url, options, callback) => {
    expect(url.hostname).toBe('public.example');
    expect(options.agent).toBe(false);
    options.lookup('public.example', {}, (error, address, family) => {
      expect(error).toBeNull(); expect(address).toBe('8.8.8.8'); expect(family).toBe(4);
    });
    const req = new EventEmitter();
    req.end = () => { callback({ statusCode: 204, headers: {}, resume() {} }); req.emit('close'); };
    return req;
  });
  expect((await safeFetch('https://public.example/file')).status).toBe(204);
  expect(mocks.lookup).toHaveBeenCalledTimes(1);
});
it('does not trust a forged staff subscription or its target userId', async () => {
  const rows = [
    { uid: 'member', isStaff: true, userId: 'staff', subscription: { endpoint: 'https://fcm.googleapis.com/member' } },
    { uid: 'staff', isStaff: false, subscription: { endpoint: 'https://fcm.googleapis.com/staff' } },
  ];
  const db = { collection: () => ({ limit: () => ({ get: async () => ({ docs: rows.map(row => ({ data: () => row })) }) }) }),
    doc: path => ({ get: async () => ({ data: () => ({ role: path === 'users/staff' ? 'staff' : 'member' }) }) }) };
  expect(await selectPushRecipients(db, { isStaffOnly: true })).toEqual([rows[1].subscription]);
});
it('rejects push destinations outside approved push providers', () => {
  for (const url of ['https://127.0.0.1/push', 'https://fcm.googleapis.com.evil.test/push', 'https://user:pass@fcm.googleapis.com/push']) expect(validPushEndpoint(url)).toBe(false);
  expect(validPushEndpoint('https://web.push.apple.com/test')).toBe(true);
});
it('never calls paid AI when quota storage is unavailable', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
  mocks.transaction.mockRejectedValue(new Error('quota offline'));
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await ai({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { messages: [{ role: 'user', content: 'test' }] } }, res);
  expect(res.code).toBe(503);
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});
