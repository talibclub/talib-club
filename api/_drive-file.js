import { database, driveFetch, identify, sendError } from './_drive.js';
import { CHUNK_SIZE, byteRange, canRead, fail } from './_drive-policy.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
  try {
    const id = req.query?.id;
    if (typeof id !== 'string' || !/^[\w-]{10,200}$/.test(id)) throw fail(400, 'Invalid file');
    const file = (await database().doc(`_driveFiles/${id}`).get()).data();
    if (!file || file.deleted || !file.completed) throw fail(404, 'ไม่พบไฟล์');
    if (!canRead(file, file.access === 'public' ? null : await identify(req))) throw fail(403, 'ไม่มีสิทธิ์อ่านไฟล์นี้');
    // Untrusted HTML/SVG must never execute under the website's origin.
    const safeType = /^(image\/(jpeg|png|gif|webp|avif)|audio\/[\w.+-]+|video\/[\w.+-]+|application\/(pdf|json|gzip))$/.test(file.type) ? file.type : 'application/octet-stream';
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    if (req.query.meta === '1') return res.json({ size: file.size, type: safeType, name: file.path.split('/').pop(), chunkSize: CHUNK_SIZE });
    const range = byteRange(req.headers.range, file.size);
    if (range.end - range.start + 1 > CHUNK_SIZE) {
      throw fail(413, 'กรุณาเปิดไฟล์ผ่านเว็บไซต์และรีเฟรชเพื่อเปิดใช้ระบบอ่านไฟล์ขนาดใหญ่');
    }
    res.setHeader('Content-Type', safeType);
    if (req.query.download === '1' || safeType === 'application/octet-stream') res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.path.split('/').pop())}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', range.end - range.start + 1);
    if (range.partial) res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${file.size}`);
    if (req.method === 'HEAD') return res.status(range.partial ? 206 : 200).end();
    const upstream = await driveFetch(`drive/v3/files/${id}?alt=media`, { headers: { Range: `bytes=${range.start}-${range.end}` } });
    if (range.partial && upstream.status !== 206) throw fail(502, 'Google Drive ไม่รองรับการอ่านช่วงข้อมูลนี้');
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (bytes.length !== range.end - range.start + 1) throw fail(502, 'ได้รับข้อมูลไฟล์ไม่ครบ');
    return res.status(range.partial ? 206 : 200).end(bytes);
  } catch (error) {
    res.removeHeader('Content-Length');
    res.removeHeader('Content-Range');
    return sendError(res, error);
  }
}
