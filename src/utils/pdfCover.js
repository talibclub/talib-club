import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Render locally: the original PDF does not need another upload or conversion service.
export async function createPdfCover(source) {
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  let options;
  if (source instanceof Blob) {
    options = { data: new Uint8Array(await source.arrayBuffer()) };
  } else {
    const { resolvePdfUrl, getBookPdfBytes } = await import('../pages/reading/utils/pdfCache.js');
    const { isDriveStorageUrl } = await import('../lib/driveStorage.js');
    if (isDriveStorageUrl(source)) {
      // Managed Drive files require bounded chunks through their existing adapter.
      options = { data: (await getBookPdfBytes(source, { cache: false })).slice() };
    } else {
      const { auth } = await import('../lib/firebase.js');
      const token = await auth.currentUser?.getIdToken();
      options = {
        url: resolvePdfUrl(source),
        httpHeaders: token ? { Authorization: 'Bearer ' + token } : {},
        disableAutoFetch: true, disableStream: true, rangeChunkSize: 256 * 1024,
      };
    }
  }
  const task = pdfjs.getDocument(options);
  let timer;
  let rejectDeadline;
  let phase = 'loading';
  let lastLoaded = -1;
  const deadline = new Promise((_, reject) => { rejectDeadline = reject; });
  const arm = (ms, message) => {
    clearTimeout(timer);
    timer = setTimeout(() => { rejectDeadline(new Error(message)); }, ms);
  };
  arm(120000, 'PDF ไม่มีความคืบหน้าในการโหลดนาน 2 นาที กรุณาลองใหม่หรืออัปโหลดไฟล์โดยตรง');
  task.onProgress = ({ loaded }) => {
    if (phase === 'loading' && loaded > lastLoaded) {
      lastLoaded = loaded;
      arm(120000, 'PDF ไม่มีความคืบหน้าในการโหลดนาน 2 นาที กรุณาลองใหม่หรืออัปโหลดไฟล์โดยตรง');
    }
  };
  task.onPassword = () => rejectDeadline(new Error('PDF นี้ต้องใช้รหัสผ่าน กรุณาอัปโหลดไฟล์ที่เปิดได้โดยไม่ใช้รหัสผ่าน'));
  const canvas = document.createElement('canvas');
  try {
    return await Promise.race([deadline, (async () => {
      const pdf = await task.promise;
      phase = 'rendering';
      arm(180000, 'สร้างภาพหน้าแรกไม่เสร็จภายใน 3 นาที กรุณาอัปโหลดรูปปกเองหรือใช้ PDF ที่เล็กลง');
      const page = await pdf.getPage(1);
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(1.5, 1200 / Math.max(original.width, original.height)) });
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: '#ffffff' }).promise;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      if (!blob) throw new Error('สร้างรูปปกไม่สำเร็จ');
      return new File([blob], 'pdf-cover.jpg', { type: 'image/jpeg' });
    })()]);
  } catch (error) {
    throw new Error(`ดึงหน้าปกไม่ได้: ${error.message}`);
  } finally {
    phase = 'done';
    clearTimeout(timer);
    await task.destroy();
    canvas.width = canvas.height = 0;
  }
}
