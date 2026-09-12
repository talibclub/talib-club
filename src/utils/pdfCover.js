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
  const timeout = setTimeout(() => { task.destroy(); }, 60000);
  task.onPassword = () => task.destroy();
  const canvas = document.createElement('canvas');
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const original = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(1.5, 1200 / Math.max(original.width, original.height)) });
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: '#ffffff' }).promise;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) throw new Error('สร้างรูปปกไม่สำเร็จ');
    return new File([blob], 'pdf-cover.jpg', { type: 'image/jpeg' });
  } catch (error) {
    throw new Error(`ดึงหน้าปกไม่ได้: กรุณาตรวจว่า PDF เปิดได้และไม่มีรหัสผ่าน (${error.message})`);
  } finally {
    clearTimeout(timeout);
    canvas.width = canvas.height = 0;
    await task.destroy();
  }
}
