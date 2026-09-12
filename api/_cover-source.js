import { verifyIdToken } from './_firebase-admin.js';
import { fetchValidated, normalizeDownloadUrl } from './_legacy-pdf.js';
import { detectCoverFormat, isAnyFlipUrl } from '../src/utils/coverFormat.js';

const MAX_ASSET = 4 * 1024 * 1024; // stay below the serverless response limit

export async function readBounded(response, max) {
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) throw new Error('ไฟล์ใหญ่เกินขนาดที่ใช้สร้างปกได้');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks);
}

// Metadata only; never execute scripts from the reader page.
export function anyFlipCover(html, pageUrl) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m => [m[1].toLowerCase(), m[3]]));
    if (!['og:image', 'twitter:image'].includes(attrs.property || attrs.name) || !attrs.content) continue;
    const url = new URL(attrs.content.replace(/&amp;/g, '&'), pageUrl);
    if (url.protocol === 'https:' && (url.hostname === 'anyflip.com' || url.hostname.endsWith('.anyflip.com'))) return url.href;
  }
  throw new Error('ไม่พบรูปปกสาธารณะของ AnyFlip กรุณาอัปโหลดรูปปกเอง');
}

async function upstream(url, range) {
  const result = await fetchValidated(normalizeDownloadUrl(url).href, range);
  if (result.error) throw new Error(result.error);
  if (!result.response.ok) {
    await result.response.body?.cancel();
    throw Object.assign(new Error(`ต้นทางไม่อนุญาตหรือไม่พบไฟล์ (${result.response.status}) กรุณาตรวจสิทธิ์หรือลิงก์`), { status: result.response.status });
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).end();
  const token = req.headers?.authorization;
  try {
    if (!token?.startsWith('Bearer ')) throw new Error();
    await verifyIdToken(token.slice(7));
  } catch { return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' }); }
  try {
    const url = req.query?.url;
    if (typeof url !== 'string') return res.status(400).json({ error: 'ไม่มีลิงก์ไฟล์' });
    if (isAnyFlipUrl(url) && req.query.asset !== '1' && !/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(url)) {
      const { response, finalUrl } = await upstream(url);
      const html = (await readBounded(response, 2 * 1024 * 1024)).toString('utf8');
      return res.json({ kind: 'image', url: anyFlipCover(html, finalUrl) });
    }
    const asset = req.query.asset === '1';
    const requestedRange = asset ? req.headers?.range : null;
    if (requestedRange) {
      const m = /^bytes=(\d+)-(\d+)$/.exec(requestedRange);
      if (!m || Number(m[2]) < Number(m[1]) || Number(m[2]) - Number(m[1]) >= 2 * 1024 * 1024) return res.status(400).json({ error: 'Invalid cover range' });
    }
    const { response } = await upstream(url, asset ? requestedRange : 'bytes=0-4095');
    if (requestedRange && response.status !== 206) {
      await response.body?.cancel();
      return res.status(422).json({ error: 'ต้นทางไม่รองรับการแบ่งดาวน์โหลด กรุณาอัปโหลดไฟล์โดยตรง' });
    }
    let bytes;
    if (asset) {
      bytes = await readBounded(response, MAX_ASSET);
    } else {
      // Servers may ignore Range. Read only the prefix and cancel the rest.
      const reader = response.body.getReader();
      const chunks = []; let size = 0;
      try {
        while (size < 4096) {
          const { done, value } = await reader.read();
          if (done) break;
          const part = value.slice(0, 4096 - size);
          chunks.push(part); size += part.length;
        }
      } finally { await reader.cancel(); }
      bytes = Buffer.concat(chunks);
    }
    if (requestedRange) {
      const m = /^bytes=(\d+)-(\d+)$/.exec(requestedRange);
      if (bytes.length !== Number(m[2]) - Number(m[1]) + 1 || response.headers.get('content-range')?.split('/')[0] !== `bytes ${m[1]}-${m[2]}`) return res.status(502).json({ error: 'ได้รับข้อมูลไฟล์ไม่ครบ' });
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment');
      return res.status(206).end(bytes);
    }
    const kind = detectCoverFormat(bytes, response.headers.get('content-type') || '');
    if (!kind) return res.status(415).json({ error: 'รองรับ PDF, JPG, PNG, WebP, EPUB และลิงก์ AnyFlip สาธารณะ ลิงก์นี้ไม่ได้ส่งไฟล์ที่รองรับกลับมา' });
    if (!asset) {
      const range = response.status === 206;
      const size = Number(range ? response.headers.get('content-range')?.split('/')[1] : response.headers.get('content-length')) || 0;
      return res.json({ kind, url, size, range });
    }
    if (kind === 'pdf') return res.status(400).json({ error: 'ใช้ตัวอ่าน PDF เพื่อสร้างปกไฟล์นี้' });
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment');
    return res.status(200).end(bytes);
  } catch (err) {
    return res.status(err.name === 'TimeoutError' ? 504 : (err.status || 422)).json({ error: err.name === 'TimeoutError' ? 'ต้นทางตอบช้าเกินไป กรุณาลองใหม่หรืออัปโหลดไฟล์' : err.message });
  }
}
