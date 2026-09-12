import { detectCoverFormat } from './coverFormat.js';

async function imageCover(blob) {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  const canvas = document.createElement('canvas');
  let timer;
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('โหลดภาพปกช้าเกินไป กรุณาลองใหม่')), 30000);
      image.onload = resolve;
      image.onerror = () => reject(new Error('รูปปกเปิดไม่ได้ รองรับ JPG, PNG และ WebP'));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('รูปปกไม่มีขนาดภาพ');
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const output = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!output) throw new Error('แปลงรูปปกไม่สำเร็จ');
    return new File([output], 'book-cover.jpg', { type: 'image/jpeg' });
  } finally {
    clearTimeout(timer); image.onload = image.onerror = null; image.src = '';
    URL.revokeObjectURL(url); canvas.width = canvas.height = 0;
  }
}

async function coverRequest(url, asset = false, range = null) {
  const { auth } = await import('../lib/firebase.js');
  const token = await auth.currentUser?.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`/api/files?mode=cover&url=${encodeURIComponent(url)}${asset ? '&asset=1' : ''}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(range ? { Range: range } : {}) }, signal: controller.signal,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || `ดึงไฟล์ไม่ได้ (${response.status})`);
    }
    return asset ? await response.blob() : await response.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('ดาวน์โหลดไฟล์ช้าเกินไป กรุณาลองใหม่หรืออัปโหลดไฟล์โดยตรง');
    throw err;
  } finally { clearTimeout(timeout); }
}

export async function createBookCover(source) {
  let blob = source instanceof Blob ? source : null;
  let kind;
  if (!blob) {
    const { isDriveStorageUrl, fetchDriveFile } = await import('../lib/driveStorage.js');
    if (isDriveStorageUrl(source)) {
      blob = await fetchDriveFile(source);
    } else {
      const resolved = await coverRequest(source);
      kind = resolved.kind;
      if (kind === 'pdf') {
        const { createPdfCover } = await import('./pdfCover.js');
        return createPdfCover(resolved.url);
      }
      if (resolved.size > 32 * 1024 * 1024) throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 32 MB สำหรับดึงปก');
      if (resolved.range && resolved.size > 2 * 1024 * 1024) {
        const chunks = [];
        for (let start = 0; start < resolved.size; start += 2 * 1024 * 1024) {
          const end = Math.min(start + 2 * 1024 * 1024, resolved.size) - 1;
          chunks.push(await coverRequest(resolved.url, true, `bytes=${start}-${end}`));
        }
        blob = new Blob(chunks);
      } else {
        blob = await coverRequest(resolved.url, true);
      }
    }
  }
  const head = new Uint8Array(await blob.slice(0, 1024).arrayBuffer());
  kind = detectCoverFormat(head, blob.type);
  if (kind === 'pdf') {
    const { createPdfCover } = await import('./pdfCover.js');
    return createPdfCover(blob);
  }
  if (kind === 'epub') {
    const { extractEpubCover } = await import('./epubCover.js');
    blob = extractEpubCover(new Uint8Array(await blob.arrayBuffer()));
    if (detectCoverFormat(new Uint8Array(await blob.slice(0, 1024).arrayBuffer())) !== 'image') throw new Error('รูปปก EPUB ต้องเป็น JPG, PNG หรือ WebP');
    return imageCover(blob);
  }
  if (kind === 'image') return imageCover(blob);
  throw new Error('ไฟล์นี้ไม่รองรับการสร้างปก กรุณาใช้ PDF, JPG, PNG, WebP หรือ EPUB');
}
