import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getDocument: vi.fn() }));
vi.mock('pdfjs-dist', () => ({ getDocument: mocks.getDocument, GlobalWorkerOptions: {} }));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker.mjs' }));
import { createPdfCover } from '../utils/pdfCover.js';
let canvas, page, task;
beforeEach(() => {
  canvas = { width: 0, height: 0, getContext: () => ({}), toBlob: fn => fn(new Blob(['cover'], { type: 'image/jpeg' })) };
  page = { getViewport: ({ scale }) => ({ width: 600 * scale, height: 1800 * scale }), render: vi.fn(() => ({ promise: Promise.resolve() })) };
  task = { promise: Promise.resolve({ getPage: vi.fn(async n => { expect(n).toBe(1); return page; }) }), destroy: vi.fn(async () => {}) };
  mocks.getDocument.mockReturnValue(task);
  vi.stubGlobal('document', { createElement: () => canvas });
});
afterEach(() => vi.unstubAllGlobals());
it('renders only the first page at bounded dimensions and releases resources', async () => {
  const cover = await createPdfCover(new Blob(['pdf']));
  expect(cover.type).toBe('image/jpeg');
  expect(page.render.mock.calls[0][0].viewport.height).toBe(1200);
  expect(page.render.mock.calls[0][0].background).toBe('#ffffff');
  expect(task.destroy).toHaveBeenCalled();
  expect(canvas.height).toBe(0);
});
it('reports unreadable PDFs and still releases the loading task', async () => {
  task.promise = Promise.reject(new Error('Invalid PDF'));
  await expect(createPdfCover(new Blob(['invalid']))).rejects.toThrow('ดึงหน้าปกไม่ได้');
  expect(task.destroy).toHaveBeenCalled();
});
