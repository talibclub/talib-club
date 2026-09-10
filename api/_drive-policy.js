import { createHash } from 'node:crypto';

export const CHUNK_SIZE = 2 * 1024 * 1024;
export const isStaff = user => ['staff', 'admin', 'owner'].includes(user?.role);
export const pathKey = path => createHash('sha256').update(path).digest('hex');
export function fail(status, message, code = 'drive/error') {
  return Object.assign(new Error(message), { status, code });
}
export function checkPath(path) {
  if (typeof path !== 'string' || path.length > 700 || /[\\\x00-\x1f]/.test(path) ||
      path.split('/').some(p => !p || p === '.' || p === '..')) throw fail(400, 'Invalid file path');
  return path;
}
export function policy(path, user) {
  checkPath(path);
  const [prefix, owner] = path.split('/');
  if (!user?.uid) throw fail(401, 'กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์');
  if (['article_covers', 'library_covers', 'campaign_images', 'media_covers', 'library_files', 'media_files'].includes(prefix)) {
    if (!isStaff(user)) throw fail(403, 'เฉพาะทีมงานเท่านั้น');
    return { access: 'public', owner: user.uid, imageOnly: !prefix.endsWith('_files') };
  }
  if (['staff_tasks', 'staff_submissions'].includes(prefix)) {
    if (!isStaff(user)) throw fail(403, 'เฉพาะทีมงานเท่านั้น');
    return { access: 'staff', owner: user.uid };
  }
  if (prefix === 'slips' && owner?.startsWith(`${user.uid}_`)) return { access: 'slip', owner: user.uid, imageOnly: true };
  if (['members', 'notebooks', 'user_audio'].includes(prefix) && owner === user.uid) return { access: 'owner', owner };
  throw fail(403, 'ไม่มีสิทธิ์เข้าถึงไฟล์นี้');
}
export function canRead(file, user) {
  return file.access === 'public' || (user?.uid && (
    (file.access === 'owner' && user.uid === file.owner) ||
    (file.access === 'slip' && (user.uid === file.owner || isStaff(user))) ||
    (file.access === 'staff' && isStaff(user))
  ));
}
export function validateUpload(path, user, size, type) {
  const rules = policy(path, user);
  const max = rules.imageOnly ? (rules.access === 'public' ? 2 : 5) * 1024 * 1024 : (isStaff(user) ? 500 : 50) * 1024 * 1024;
  if (!Number.isSafeInteger(size) || size <= 0 || size > max) throw fail(413, `ไฟล์ต้องมีขนาดไม่เกิน ${max / 1024 / 1024} MB`);
  if (typeof type !== 'string' || !/^[\w.+-]+\/[\w.+-]+$/.test(type)) throw fail(400, 'Invalid file type');
  if (rules.imageOnly && !/^image\/(jpeg|png|webp|gif|avif)$/.test(type)) throw fail(415, 'ใช้รูป JPG, PNG, WebP, GIF หรือ AVIF');
  return rules;
}
export function byteRange(value, size) {
  if (!value) return { start: 0, end: size - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) throw fail(416, 'Invalid range');
  let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  let end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) throw fail(416, 'Invalid range');
  return { start, end, partial: true };
}
