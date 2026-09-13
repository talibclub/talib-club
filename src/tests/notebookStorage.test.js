import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('../lib/driveStorage.js', () => ({ ref: vi.fn(), uploadBytes: vi.fn(), getDownloadURL: vi.fn(), deleteObject: vi.fn(), fetchDriveFile: vi.fn() }));
vi.mock('../lib/firebase.js', () => ({ storage: {} }));
vi.mock('firebase/storage', () => ({ ref: vi.fn(), getDownloadURL: vi.fn() }));
import { getDownloadURL } from '../lib/driveStorage.js';
import { getDownloadURL as legacyURL } from 'firebase/storage';
import { downloadNotebookData } from '../utils/notebookStorage.js';
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('fetch', vi.fn()); });
it('starts a new notebook only on explicit server confirmation', async () => {
  getDownloadURL.mockRejectedValue({ code: 'drive/new-notebook' });
  expect(await downloadNotebookData('user', 'book')).toBeNull();
  expect(legacyURL).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it('preserves missing, permission and network failures without calling Firebase Storage', async () => {
  for (const code of ['storage/object-not-found', 'drive/legacy-unavailable', 'drive/error']) {
    getDownloadURL.mockRejectedValue({ code });
    await expect(downloadNotebookData('user', 'book')).rejects.toMatchObject({ code });
  }
  expect(legacyURL).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it('rejects malformed pages instead of allowing a blank overwrite', async () => {
  getDownloadURL.mockResolvedValue('https://example.com/data');
  fetch.mockResolvedValue(new Response('{}'));
  await expect(downloadNotebookData('user', 'book')).rejects.toThrow('ข้อมูลสมุดไม่สมบูรณ์');
});
