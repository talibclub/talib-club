import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Render locally: the original PDF does not need another upload or conversion service.
export async function createPdfCover(source) {
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const bytes = source instanceof Blob
    ? new Uint8Array(await source.arrayBuffer())
    : (await (await import('../pages/reading/utils/pdfCache.js')).getBookPdfBytes(source)).slice();
  const task = pdfjs.getDocument({ data: bytes });
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
    canvas.width = canvas.height = 0;
    await task.destroy();
  }
}
