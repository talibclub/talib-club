import { afterEach, expect, it, vi } from 'vitest';
import { getCoverUrl, hasUsableCover } from '../utils/bookCover.js';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it('treats missing URLs as missing covers', async () => {
  expect(await hasUsableCover('  ')).toBe(false);
});
it.each([true, false])('checks actual image loading: %s', async works => {
  vi.stubGlobal('Image', class {
    naturalWidth = 200; naturalHeight = 300;
    set src(value) { if (value) queueMicrotask(() => works ? this.onload?.() : this.onerror?.()); }
  });
  expect(await hasUsableCover('https://example.com/cover.jpg')).toBe(works);
});
it('does not stall the batch on a hanging image', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('Image', class {});
  const result = hasUsableCover('https://example.com/cover.jpg');
  await vi.advanceTimersByTimeAsync(10000);
  expect(await result).toBe(false);
});
it('uses the same Drive thumbnail URL as the library display', () => {
  expect(getCoverUrl('https://drive.google.com/file/d/abc/view')).toBe('https://drive.google.com/thumbnail?id=abc&sz=w800');
});
