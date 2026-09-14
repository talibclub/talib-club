import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ select: vi.fn(), send: vi.fn() }));
vi.mock('web-push', () => ({ default: { setVapidDetails: vi.fn(), sendNotification: mocks.send } }));
vi.mock('../../api/_firebase-admin.js', () => ({ verifyIdToken: async () => ({ uid: 'staff' }), default: {
  firestore: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => ({ role: 'staff' }) }) }) }),
} }));
vi.mock('../../api/_push-recipients.js', () => ({ selectPushRecipients: mocks.select }));
let handler;
beforeEach(async () => {
  vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'test'); vi.stubEnv('VAPID_PRIVATE_KEY', 'test');
  handler = (await import('../../api/send-push.js')).default;
  mocks.select.mockResolvedValue([{ endpoint: 'https://fcm.googleapis.com/allowed' }]);
});
afterEach(() => vi.unstubAllEnvs());
const payload = { title: 'Test', body: 'Test body', url: '/staff' };
async function call(body) {
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  await handler({ method: 'POST', headers: { authorization: 'Bearer test' }, body }, res);
  return res;
}
it('rejects old client-supplied subscriptions instead of accidentally broadcasting', async () => {
  const res = await call({ subscriptions: [{ endpoint: 'https://evil.test' }], payload });
  expect(res.code).toBe(400);
  expect(mocks.send).not.toHaveBeenCalled();
  expect(mocks.select).not.toHaveBeenCalled();
});
it('uses server recipients and never returns private endpoint URLs', async () => {
  const res = await call({ payload, filterOptions: { isStaffOnly: true } });
  expect(mocks.select.mock.calls[0][1]).toEqual({ isStaffOnly: true });
  expect(mocks.send.mock.calls[0][0].endpoint).toBe('https://fcm.googleapis.com/allowed');
  expect(JSON.stringify(res.body)).not.toContain('fcm.googleapis.com');
});
it('does not send if resolving recipients fails', async () => {
  mocks.select.mockRejectedValue(new Error('Database unavailable'));
  expect((await call({ payload })).code).toBe(503);
  expect(mocks.send).not.toHaveBeenCalled();
});
