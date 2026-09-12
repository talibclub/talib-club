import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ docs: new Map(), fail: false }));
vi.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => `${collection}/${id}`,
  serverTimestamp: () => 123,
  runTransaction: async (_db, callback) => {
    const pending = new Map(state.docs);
    const result = await callback({
      get: async (key) => ({ exists: () => pending.has(key), data: () => pending.get(key) }),
      set: (key, data, options) => pending.set(key, options?.merge ? { ...pending.get(key), ...data } : data),
      update: (key, data) => pending.set(key, { ...pending.get(key), ...data }),
    });
    if (state.fail) throw new Error('commit failed');
    state.docs = pending;
    return result;
  },
}));
import { commitReadingSession } from '../pages/reading/utils/readingSession.js';
const args = {
  db: {}, uid: 'user', sessionId: 'user_session', shelfId: 'book', seconds: 180, gems: 1, progress: 30,
  session: { uid: 'user', endPage: 3, completedAt: 123, verificationScore: 100 },
  normalizeStreakSettings: (data, uid) => ({ uid, gems: 0, ...data }),
};
beforeEach(() => {
  state.fail = false;
  state.docs = new Map([
    ['content_bookshelf/book', { uid: 'user', totalReadSeconds: 60, verifiedSessions: 1, progress: 40, currentPage: 4, note: 'keep' }],
    ['content_reading_streaks/user', { uid: 'user', gems: 8, freezeCredits: 2 }],
  ]);
});
describe('reading session commit', () => {
  it('commits all records and preserves newer progress and unrelated fields', async () => {
    await commitReadingSession(args);
    expect(state.docs.get('content_bookshelf/book')).toMatchObject({ totalReadSeconds: 240, verifiedSessions: 2, progress: 40, currentPage: 4, note: 'keep' });
    expect(state.docs.get('content_reading_streaks/user')).toMatchObject({ gems: 9, freezeCredits: 2 });
    expect(state.docs.has('content_reading_sessions/user_session')).toBe(true);
  });
  it('does not award or count a retry twice', async () => {
    await commitReadingSession(args);
    await commitReadingSession(args);
    expect(state.docs.get('content_bookshelf/book').verifiedSessions).toBe(2);
    expect(state.docs.get('content_reading_streaks/user').gems).toBe(9);
  });
  it('leaves every record untouched on failure and allows retry', async () => {
    state.fail = true;
    await expect(commitReadingSession(args)).rejects.toThrow('commit failed');
    expect(state.docs.has('content_reading_sessions/user_session')).toBe(false);
    expect(state.docs.get('content_reading_streaks/user').gems).toBe(8);
    state.fail = false;
    await commitReadingSession(args);
    expect(state.docs.get('content_reading_streaks/user').gems).toBe(9);
  });
  it('rejects a removed shelf book without awarding a session', async () => {
    state.docs.delete('content_bookshelf/book');
    await expect(commitReadingSession(args)).rejects.toThrow();
    expect(state.docs.has('content_reading_sessions/user_session')).toBe(false);
  });
});
