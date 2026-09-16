import { describe, it, expect, vi } from 'vitest';
import { notebookVersions } from '../../api/_notebook-versions.js';
import { pathKey } from '../../api/_drive-policy.js';

const path = 'notebooks/alice/book.json.gz';
function fixture() {
  const records = {
    [`_drivePaths/${pathKey(path)}`]: { fileId: 'new', previousFileId: 'old', path },
    '_driveFiles/new': { owner: 'alice', access: 'owner', path, completed: true, createdAt: 200 },
    '_driveFiles/old': { owner: 'alice', access: 'owner', path, completed: true, createdAt: 100 },
  };
  const set = vi.fn((key, data) => { records[key] = data; });
  const db = { doc: key => key, runTransaction: fn => fn({ get: async key => ({ data: () => records[key] }), set }) };
  return { db, records, set };
}
describe('private notebook recovery', () => {
  it('lists only owner versions and swaps atomically without losing the current version', async () => {
    const { db, records } = fixture();
    const history = await notebookVersions(db, { uid: 'alice' }, { path });
    expect(history.versions.map(v => v.id)).toEqual(['new', 'old']);
    await notebookVersions(db, { uid: 'alice' }, { path, action: 'restore-notebook', fileId: 'old', expectedFileId: 'new' });
    expect(records[`_drivePaths/${pathKey(path)}`]).toMatchObject({ fileId: 'old', previousFileId: 'new' });
  });
  it('rejects other users including staff before accessing storage', async () => {
    const { db, set } = fixture();
    await expect(notebookVersions(db, { uid: 'bob', role: 'owner' }, { path })).rejects.toMatchObject({ status: 403 });
    expect(set).not.toHaveBeenCalled();
  });
  it('rejects stale recovery requests', async () => {
    const { db, set } = fixture();
    await expect(notebookVersions(db, { uid: 'alice' }, { path, action: 'restore-notebook', fileId: 'old', expectedFileId: 'outdated' })).rejects.toMatchObject({ status: 409 });
    expect(set).not.toHaveBeenCalled();
  });
  it('does not expose or restore a mismatched file', async () => {
    const { db, records, set } = fixture();
    records['_driveFiles/old'].owner = 'bob';
    expect((await notebookVersions(db, { uid: 'alice' }, { path })).versions).toHaveLength(1);
    await expect(notebookVersions(db, { uid: 'alice' }, { path, action: 'restore-notebook', fileId: 'old', expectedFileId: 'new' })).rejects.toMatchObject({ status: 404 });
    expect(set).not.toHaveBeenCalled();
  });
});
