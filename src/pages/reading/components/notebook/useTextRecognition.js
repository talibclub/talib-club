import { useRef } from 'react';
import toast from 'react-hot-toast';
import { nextObjectId } from './notebookAssets.js';
import { TEXT_BOX_WIDTH } from './theme.js';

// Reading text off the page: OCR on an image, and turning a lassoed piece of
// handwriting into an editable note.
//
// Tesseract runs entirely in the browser — the wasm engine and language data are
// fetched once from a CDN, with no paid API behind it. Handwriting has to be
// rasterised first, since the recogniser wants a picture, not a set of strokes.
export function useTextRecognition({
  updatePage, currentPageIndex, pushHistory, selectShape,
  selectionRef, clearLassoSelection, setEditingTextId, setEditingTextValue,
  isEditingText, currentPage, lassoGroupPos, bakeLassoSelection, penColor, textStyle,
}) {

  // Local OCR: read the text out of an image with Tesseract.js (runs entirely in
  // the browser — the wasm engine and language data are fetched once from a CDN,
  // no paid API). The recognised text lands as an editable note under the image.
  const ocrRunningRef = useRef(false);
  const runOcrOnImage = async (img) => {
    if (!img?.src || ocrRunningRef.current) return;
    ocrRunningRef.current = true;
    toast.loading('กำลังอ่านข้อความจากรูป (OCR)... 0%', { id: 'ocr' });
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const { data } = await Tesseract.recognize(img.src, 'tha+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            toast.loading(`กำลังอ่านข้อความจากรูป (OCR)... ${Math.round(m.progress * 100)}%`, { id: 'ocr' });
          }
        },
      });
      const text = (data?.text || '').trim();
      if (!text) { toast.error('ไม่พบข้อความในรูปนี้', { id: 'ocr' }); return; }
      pushHistory();
      updatePage(currentPageIndex, (page) => {
        if (!page.texts) page.texts = [];
        page.texts.push({
          id: nextObjectId('text'), text,
          x: img.x, y: img.y + (img.height || 0) * (img.scaleY || 1) + 12,
          color: penColor, size: 20, fontFamily: 'Sarabun', bold: false, italic: false,
        });
      });
      toast.success('ดึงข้อความสำเร็จ — วางไว้ใต้รูปแล้ว', { id: 'ocr', icon: '📝' });
    } catch (e) {
      console.error('OCR failed', e);
      toast.error('อ่านข้อความไม่สำเร็จ (ตรวจสอบอินเทอร์เน็ตครั้งแรก)', { id: 'ocr' });
    } finally {
      ocrRunningRef.current = false;
    }
  };

  // Paint the lassoed strokes alone onto a white canvas, big and high-contrast,
  // which is what the recogniser wants — the page background, ruled lines and
  // neighbouring ink only confuse it.
  const rasterizeStrokes = (strokes, pad = 24) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokes.forEach((l) => {
      for (let i = 0; i < l.points.length; i += 2) {
        minX = Math.min(minX, l.points[i]); maxX = Math.max(maxX, l.points[i]);
        minY = Math.min(minY, l.points[i + 1]); maxY = Math.max(maxY, l.points[i + 1]);
      }
    });
    if (minX === Infinity) return null;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;

    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    // Upscale small writing (Tesseract is unhappy below ~30px letter height) but
    // stay inside what a tablet canvas can hold.
    const zoom = Math.min(4, Math.max(1.5, 1400 / w));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * zoom);
    canvas.height = Math.round(h * zoom);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoom, zoom);
    ctx.translate(-minX, -minY);
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach((l) => {
      if (l.points.length < 4) return;
      ctx.lineWidth = Math.max(2, l.size || 4);
      ctx.beginPath();
      ctx.moveTo(l.points[0], l.points[1]);
      for (let i = 2; i < l.points.length; i += 2) ctx.lineTo(l.points[i], l.points[i + 1]);
      ctx.stroke();
    });
    return { dataUrl: canvas.toDataURL('image/png'), minX, minY, maxX, maxY };
  };

  // Handwriting → typed text. Runs the same local Tesseract engine the image OCR
  // uses, on the lassoed ink only, then swaps the strokes for an editable text
  // box. Neat writing converts well; messy Thai is hit-and-miss, which is why the
  // result lands as a normal editable note rather than something final.
  const convertLassoToText = async () => {
    const strokes = selectionRef.current;
    if (!strokes || strokes.length === 0) { toast.error('เลือกลายมือด้วยบ่วงก่อน'); return; }
    if (ocrRunningRef.current) return;

    const shot = rasterizeStrokes(strokes);
    if (!shot) { toast.error('ไม่พบเส้นลายมือในส่วนที่เลือก'); return; }

    ocrRunningRef.current = true;
    toast.loading('กำลังแปลงลายมือเป็นข้อความ... 0%', { id: 'hw2text' });
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const { data } = await Tesseract.recognize(shot.dataUrl, 'tha+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            toast.loading(`กำลังแปลงลายมือเป็นข้อความ... ${Math.round(m.progress * 100)}%`, { id: 'hw2text' });
          }
        },
      });
      const text = (data?.text || '').replace(/\n{3,}/g, '\n\n').trim();
      if (!text) {
        // Nothing recognised — put the ink back exactly where it was.
        bakeLassoSelection();
        toast.error('อ่านลายมือไม่ออก — ลองเขียนตัวใหญ่ขึ้นหรือเว้นช่องไฟให้ห่างขึ้น', { id: 'hw2text', duration: 5000 });
        return;
      }

      const { x: dx, y: dy } = lassoGroupPos;
      const id = nextObjectId('text');
      pushHistory();
      updatePage(currentPageIndex, (page) => {
        if (!page.texts) page.texts = [];
        page.texts.push({
          id,
          text,
          lines: text.split('\n').map((line) => ({ text: line, bold: false, italic: false, underline: false, strikethrough: false, list: 'none', align: 'left' })),
          x: shot.minX + dx + 24,
          y: shot.minY + dy + 24,
          color: penColor,
          size: 22,
          fontFamily: textStyle.fontFamily || 'Sarabun',
          width: TEXT_BOX_WIDTH,
        });
      });
      // The strokes were lifted off the page when the lasso closed, so dropping
      // the selection without baking is what replaces them with the text.
      clearLassoSelection();
      toast.success('แปลงเป็นข้อความแล้ว — แตะสองครั้งเพื่อแก้คำที่เพี้ยน', { id: 'hw2text', icon: '✍️', duration: 5000 });
    } catch (e) {
      console.error('handwriting OCR failed', e);
      bakeLassoSelection();
      toast.error('แปลงไม่สำเร็จ (ครั้งแรกต้องต่อเน็ตเพื่อโหลดตัวอ่าน)', { id: 'hw2text' });
    } finally {
      ocrRunningRef.current = false;
    }
  };

  return { runOcrOnImage, rasterizeStrokes, convertLassoToText };
}
