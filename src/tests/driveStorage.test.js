import { describe, it, expect } from 'vitest';
import { byteRange, canRead, pathKey, policy, validateUpload } from '../../api/_drive-policy.js';

const member = { uid: 'alice', role: 'member' };
const staff = { uid: 'staff1', role: 'staff' };
describe('Drive file authorization and limits', () => {
  it('allows public covers only from staff, and blocks executable images', () => {
    expect(() => validateUpload('library_covers/a.png', member, 100, 'image/png')).toThrow();
    expect(validateUpload('library_covers/a.png', staff, 100, 'image/png').access).toBe('public');
    expect(() => validateUpload('library_covers/a.svg', staff, 100, 'image/svg+xml')).toThrow();
    expect(() => validateUpload('library_covers/a.png', staff, 6 * 1024 ** 2, 'image/png')).toThrow();
  });
  it('keeps notebooks and personal books owner-only, including from other staff', () => {
    expect(policy('notebooks/alice/a.json.gz', member).owner).toBe('alice');
    expect(() => policy('notebooks/alice/a.json.gz', staff)).toThrow();
    expect(() => policy('members/bob/book.pdf', member)).toThrow();
    expect(canRead({ access: 'owner', owner: 'alice' }, staff)).toBe(false);
  });
  it('allows slips only for their uploader or staff without prefix confusion', () => {
    expect(() => policy('slips/alice2_campaign.png', member)).toThrow();
    expect(policy('slips/alice_campaign.png', member).access).toBe('slip');
    expect(canRead({ access: 'slip', owner: 'alice' }, staff)).toBe(true);
    expect(canRead({ access: 'slip', owner: 'alice' }, { uid: 'bob' })).toBe(false);
    expect(canRead({ access: 'slip', owner: 'alice' }, null)).toBeFalsy();
  });
  it('rejects unknown and traversal paths', () => {
    for (const path of ['unknown/file', 'notebooks/alice/../bob', '/library_covers/a', 'notebooks/alice\\x']) expect(() => policy(path, staff)).toThrow();
    expect(pathKey('members/alice/a')).not.toBe(pathKey('members/bob/a'));
  });
  it('bounds member file size and rejects malformed metadata', () => {
    expect(() => validateUpload('members/alice/a', member, 51 * 1024 ** 2, 'application/pdf')).toThrow();
    expect(() => validateUpload('members/alice/a', member, NaN, 'application/pdf')).toThrow();
    expect(() => validateUpload('members/alice/a', member, 20, 'text/html\r\nInjected: yes')).toThrow();
  });
  it('parses PDF/video range requests including suffix and unsatisfiable ranges', () => {
    expect(byteRange('bytes=3-6', 10)).toEqual({ start: 3, end: 6, partial: true });
    expect(byteRange('bytes=-4', 10).start).toBe(6);
    expect(byteRange('bytes=5-', 10).end).toBe(9);
    for (const value of ['bytes=10-', 'bytes=8-4', 'bytes=0-1,3-5', 'bytes=-0']) expect(() => byteRange(value, 10)).toThrow();
  });
});
