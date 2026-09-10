import { auth } from './firebase.js';

// Storage-shaped adapter keeps every existing upload flow on the same backend.
// No Drive credentials or Google access tokens are shipped to the browser.
export const getStorage = () => ({ provider: 'drive' });
export const ref = (_storage, fullPath) => ({ fullPath });

async function request(action, data = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนใช้ Google Drive');
  const response = await fetch('/api/files?mode=storage', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ action, ...data }),
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('ไม่พบ API ของ Google Drive กรุณาเปิดผ่านเซิร์ฟเวอร์ที่รองรับ /api'); }
  if (!response.ok) throw Object.assign(new Error(result.error || 'Google Drive request failed'), { code: result.code, status: response.status });
  return result;
}
let sessionQueue = Promise.resolve();
let lastSessionToken;
export function syncDriveSession(user) {
  sessionQueue = sessionQueue.catch(() => {}).then(async () => {
    const token = user ? await user.getIdToken() : null;
    if (token === lastSessionToken) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/files?mode=storage', {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ action: token ? 'session' : 'logout' }),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('ไม่สามารถยืนยันสิทธิ์อ่านไฟล์ Google Drive ได้');
      lastSessionToken = token;
    } finally { clearTimeout(timeout); }
  });
  return sessionQueue;
}
export async function uploadBytes(fileRef, body, metadata = {}) {
  await syncDriveSession(auth.currentUser);
  const type = metadata.contentType || body.type || 'application/octet-stream';
  const { uploadId, sessionUrl } = await request('init', { path: fileRef.fullPath, size: body.size, type });
  // Upload directly to a narrowly scoped resumable session: large PDFs/videos
  // never cross the serverless request-body limit, and no broad OAuth token leaks.
  const response = await fetch(sessionUrl, { method: 'PUT', headers: { 'Content-Type': type }, body });
  if (!response.ok) throw new Error('อัปโหลด Google Drive ไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตและพื้นที่ว่างแล้วลองใหม่');
  const result = await request('complete', { uploadId });
  fileRef.fileId = result.fileId;
  return { ref: fileRef };
}
export async function getDownloadURL(fileRef) {
  if (!fileRef.fileId) {
    const result = await request('lookup', { path: fileRef.fullPath });
    fileRef.fileId = result.fileId;
  }
  return new URL(`/api/files?id=${encodeURIComponent(fileRef.fileId)}`, window.location.origin).href;
}
export async function deleteObject(fileRef) {
  await request('delete', { path: fileRef.fullPath });
}

export function isDriveStorageUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin && url.pathname === '/api/files' && url.searchParams.has('id') && !url.searchParams.has('mode');
  } catch { return false; }
}

// Works even before a Service Worker takes control (e.g. first PDF open).
export async function fetchDriveFile(value, onProgress) {
  if (!isDriveStorageUrl(value)) throw new Error('Invalid Drive file URL');
  const headers = auth.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : {};
  const url = new URL(value, window.location.origin);
  const metaUrl = new URL(url); metaUrl.searchParams.set('meta', '1');
  const metadata = await fetch(metaUrl, { headers, credentials: 'same-origin', cache: 'no-store' });
  if (!metadata.ok) throw new Error(`อ่านข้อมูลไฟล์ไม่ได้ (${metadata.status})`);
  const meta = await metadata.json();
  url.searchParams.set('part', '1');
  const chunks = [];
  for (let start = 0; start < meta.size; start += meta.chunkSize) {
    const end = Math.min(start + meta.chunkSize, meta.size) - 1;
    const response = await fetch(url, { headers: { ...headers, Range: `bytes=${start}-${end}` }, cache: 'no-store', credentials: 'same-origin' });
    if (response.status !== 206) throw new Error(`อ่านไฟล์ไม่สำเร็จ (${response.status})`);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== end - start + 1) throw new Error('ได้รับข้อมูลไฟล์ไม่ครบ');
    chunks.push(bytes);
    onProgress?.((end + 1) / meta.size);
  }
  return new Blob(chunks, { type: meta.type });
}
