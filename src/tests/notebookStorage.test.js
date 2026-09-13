import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('../lib/driveStorage.js', () => ({ ref: vi.fn(), uploadBytes: vi.fn(), getDownloadURL: vi.fn(), deleteObject: vi.fn(), fetchDriveFile: vi.fn() }));
vi.mock('../lib/firebase.js', () => ({ storage: {} }));
vi.mock('firebase/storage', () => ({ ref: vi.fn(), getDownloadURL: vi.fn() }));
import { getDownloadURL } from '../lib/driveStorage.js';
import { getDownloadURL as legacyURL } from 'firebase/storage';
import { downloadNotebookData } from '../utils/notebookStorage.js';
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('fetch', vi.fn()); });
it('reads an existing legacy notebook when Drive lookup is unavailable', async () => {
  getDownloadURL.mockRejectedValue(new Error('Drive unavailable'));
  legacyURL.mockResolvedValue('https://example.com/legacy');
  const pages = [{ width: 800, height: 1130, texts: [{ text: 'Saved notes' }] }];
  fetch.mockResolvedValue(new Response(JSON.stringify(pages)));
  expect(await downloadNotebookData('user', 'book')).toEqual(pages);
});
it('does not treat a Drive outage and legacy 404 as a new notebook', async () => {
  getDownloadURL.mockRejectedValue(new Error('Drive unavailable'));
  legacyURL.mockRejectedValue({ code: 'storage/object-not-found' });
  await expect(downloadNotebookData('user', 'book')).rejects.toMatchObject({ code: 'drive/legacy-unavailable' });
});
it('allows a new notebook only when both stores confirm absence', async () => {
  getDownloadURL.mockRejectedValue({ code: 'storage/object-not-found' });
  legacyURL.mockRejectedValue({ code: 'storage/object-not-found' });
  expect(await downloadNotebookData('user', 'book')).toBeNull();
});
it('rejects malformed pages instead of allowing a blank overwrite', async () => {
  getDownloadURL.mockResolvedValue('https://example.com/data');
  fetch.mockResolvedValue(new Response('{}'));
  await expect(downloadNotebookData('user', 'book')).rejects.toThrow('ข้อมูลสมุดไม่สมบูรณ์');
});
