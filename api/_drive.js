import admin, { verifyIdToken } from './_firebase-admin.js';
import { fail } from './_drive-policy.js';

export const database = () => admin.firestore();
let cachedToken;
let expires = 0;
export async function driveToken() {
  if (cachedToken && Date.now() < expires) return cachedToken;
  const { GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID } = process.env;
  if (![GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID].every(Boolean)) {
    throw fail(503, 'ยังไม่ได้เชื่อม Google Drive ของเว็บไซต์ กรุณาให้ผู้ดูแลตั้งค่าการเชื่อมต่อ', 'drive/not-configured');
  }
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', body: new URLSearchParams({ client_id: GOOGLE_DRIVE_CLIENT_ID, client_secret: GOOGLE_DRIVE_CLIENT_SECRET, refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN, grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw fail(503, 'การเชื่อม Google Drive หมดอายุหรือถูกยกเลิก กรุณาเชื่อมบัญชีใหม่', 'drive/connection-expired');
  const data = await response.json();
  cachedToken = data.access_token;
  expires = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}
export async function driveFetch(path, options = {}) {
  const response = await fetch(`https://www.googleapis.com/${path}`, {
    ...options, headers: { Authorization: `Bearer ${await driveToken()}`, ...options.headers },
  });
  if (!response.ok) {
    if (response.status === 401) { cachedToken = null; expires = 0; }
    // Never log tokens, resumable session URLs or upstream request bodies.
    throw fail(response.status === 404 ? 404 : 502,
      response.status === 404 ? 'ไม่พบไฟล์ใน Google Drive' : 'Google Drive ไม่รับคำขอ กรุณาตรวจพื้นที่และการเชื่อมต่อแล้วลองใหม่',
      response.status === 404 ? 'storage/object-not-found' : 'drive/upstream-error');
  }
  return response;
}
export async function identify(req, optional = false) {
  const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const cookie = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('talib_drive_auth='))?.slice(17);
  const token = bearer || cookie;
  if (!token) { if (optional) return null; throw fail(401, 'กรุณาเข้าสู่ระบบ'); }
  try {
    const decoded = await verifyIdToken(token);
    const snap = await database().doc(`users/${decoded.uid}`).get();
    return { uid: decoded.uid, role: snap.data()?.role, token };
  } catch { if (optional) return null; throw fail(401, 'กรุณาเข้าสู่ระบบใหม่'); }
}
export function sameOrigin(req) {
  const origin = req.headers.origin;
  const allowed = process.env.ALLOWED_ORIGIN || 'https://talibclub.org';
  if (origin && origin !== allowed && !(process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
    throw fail(403, 'Origin not allowed');
  }
}
export function sendError(res, error) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'ไม่สามารถดำเนินการกับ Google Drive ได้', code: error.code || 'drive/error' });
}
