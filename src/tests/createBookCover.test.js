import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ pdf: vi.fn(async () => 'pdf-cover'), managed: vi.fn(() => false), drive: vi.fn() }));
vi.mock('../lib/firebase.js', () => ({ auth: { currentUser: { getIdToken: async () => 'token' } } }));
vi.mock('../lib/driveStorage.js', () => ({ isDriveStorageUrl: mocks.managed, fetchDriveFile: mocks.drive }));
vi.mock('../utils/pdfCover.js', () => ({ createPdfCover: mocks.pdf }));
import { createBookCover } from '../utils/createBookCover.js';
let canvas;
beforeEach(() => {
  mocks.managed.mockReturnValue(false);
  canvas = { width: 0, height: 0, getContext: () => ({ fillRect() {}, drawImage() {} }), toBlob: cb => cb(new Blob(['jpeg'], { type: 'image/jpeg' })) };
  vi.stubGlobal('document', { createElement: () => canvas });
  vi.stubGlobal('Image', class {
    naturalWidth = 2400; naturalHeight = 3200;
    set src(value) { if (value) queueMicrotask(() => this.onload?.()); }
  });
});
afterEach(() => vi.unstubAllGlobals());
it('renders uploaded JPEG images as bounded JPEG covers', async () => {
  const image = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0])]);
  const cover = await createBookCover(image);
  expect(cover.type).toBe('image/jpeg');
  expect(mocks.pdf).not.toHaveBeenCalled();
  expect(canvas.width).toBe(0);
});
it('keeps remote PDFs on the range-capable PDF path', async () => {
  const fetcher = vi.fn(async () => Response.json({ kind: 'pdf', url: 'https://example.com/book.pdf' }));
  vi.stubGlobal('fetch', fetcher);
  expect(await createBookCover('https://example.com/book')).toBe('pdf-cover');
  expect(mocks.pdf).toHaveBeenCalledWith('https://example.com/book.pdf');
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it('fetches the public AnyFlip cover image rather than rendering the HTML as PDF', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(Response.json({ kind: 'image', url: 'https://online.anyflip.com/a/b/files/cover.jpg' }))
    .mockResolvedValueOnce(new Response(new Uint8Array([0xff, 0xd8, 0xff, 0])));
  vi.stubGlobal('fetch', fetcher);
  expect((await createBookCover('https://anyflip.com/a/b')).type).toBe('image/jpeg');
  expect(fetcher.mock.calls[1][0]).toContain('asset=1');
});
it('preserves a source permission error instead of labelling it a corrupt PDF', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'ต้นทางปฏิเสธสิทธิ์ 403' }, { status: 403 })));
  await expect(createBookCover('https://anyflip.com/a/b')).rejects.toThrow('ต้นทางปฏิเสธสิทธิ์ 403');
});
it('rejects unsupported uploaded files explicitly', async () => {
  await expect(createBookCover(new Blob(['<html>web page</html>']))).rejects.toThrow('ไม่รองรับ');
});
