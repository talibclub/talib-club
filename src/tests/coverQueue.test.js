import { expect, it } from 'vitest';
import { runCoverQueue } from '../utils/coverQueue.js';
it('runs two books at once and stops scheduling when requested', async () => {
  const started = [];
  const release = [];
  let stopped = false;
  const done = runCoverQueue([1, 2, 3, 4], async item => {
    started.push(item);
    await new Promise(resolve => release.push(resolve));
  }, () => stopped);
  expect(started).toEqual([1, 2]);
  stopped = true;
  release.forEach(resolve => resolve());
  await done;
  expect(started).toEqual([1, 2]);
});
it('processes every book once', async () => {
  const seen = [];
  await runCoverQueue([1, 2, 3, 4, 5], async item => { seen.push(item); });
  expect(seen.sort()).toEqual([1, 2, 3, 4, 5]);
});
