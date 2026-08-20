import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadDataUrl, preloadImage } from './notebookAssets.js';

// Getting pages out of the notebook: whole-notebook PDF, and the export sheet
// that writes the current page or all of them as PNG or PDF.
//
// Exporting has to drive the canvas — it moves to each page in turn, resets the
// zoom and pan so nothing is cropped or carries the grey backdrop, snapshots it,
// then puts the view back where it was. That is why this takes so many setters:
// it is a temporary hijack of the viewport, and it belongs in one place rather
// than spread through a four-thousand-line component.
export function useNotebookExport({
  stageRef, pagesRef, dimensions,
  currentPageIndex, setCurrentPageIndex,
  scale, setScale, position, setPosition,
  selectShape, pages, activeBook, clearLassoSelection,
}) {
  const pdfExportingRef = useRef(false);
  const exportNotebookPDF = async () => {
     const stage = stageRef.current;
     if (!stage || pdfExportingRef.current) return;
     pdfExportingRef.current = true;
     const originalIndex = currentPageIndex;
     selectShape(null);
     clearLassoSelection();
     toast.loading(`กำลังสร้าง PDF... (0/${pages.length})`, { id: 'pdf-export' });
     try {
        const { jsPDF } = await import('jspdf');
        let pdf = null;
        for (let i = 0; i < pages.length; i++) {
           toast.loading(`กำลังสร้าง PDF... (${i + 1}/${pages.length})`, { id: 'pdf-export' });
           setCurrentPageIndex(i);
           await new Promise((r) => setTimeout(r, 450));
           const pg = pagesRef.current[i];
           const s = stage.scaleX();
           const pw = pg.width, ph = pg.height;
           const rectX = stage.x() + Math.max(0, (dimensions.width - pw * s) / 2);
           const rectY = stage.y() + 20 * s;
           const dataURL = stage.toDataURL({
              x: rectX, y: rectY, width: pw * s, height: ph * s,
              pixelRatio: Math.min(3, 2 / s), mimeType: 'image/jpeg', quality: 0.9,
           });
           if (!pdf) pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [pw, ph] });
           else pdf.addPage([pw, ph], 'portrait');
           pdf.addImage(dataURL, 'JPEG', 0, 0, pw, ph);
        }
        const title = (activeBook?.book?.title || 'notebook').replace(/[^\w\u0E00-\u0E7F-]+/g, '_').slice(0, 40) || 'notebook';
        pdf.save(`${title}.pdf`);
        toast.success('ดาวน์โหลด PDF สำเร็จ!', { id: 'pdf-export', icon: '📄' });
     } catch (e) {
        console.error('PDF export failed', e);
        toast.error('สร้าง PDF ไม่สำเร็จ', { id: 'pdf-export' });
     } finally {
        setCurrentPageIndex(originalIndex);
        pdfExportingRef.current = false;
     }
  };

  // Render one page cleanly (scale 1, no pan) and crop to the paper rectangle, so
  // the export never carries the grey canvas backdrop or the current zoom.
  const capturePageDataURL = async (index, mime = 'image/png') => {
     const page = pagesRef.current[index];
     if (!page) return null;
     await preloadImage(page.src);
     setCurrentPageIndex(index);
     setScale(1);
     setPosition({ x: 0, y: 0 });
     // Let React commit, Konva redraw, and the (cached) image paint.
     await new Promise((r) => setTimeout(r, 350));
     const stage = stageRef.current;
     if (!stage) return null;
     const px = Math.max(0, (dimensions.width - page.width) / 2);
     return stage.toDataURL({ x: px, y: 20, width: page.width, height: page.height, pixelRatio: 2, mimeType: mime });
  };

  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('png'); // 'png' | 'pdf'
  const [exportScope, setExportScope] = useState('current'); // 'current' | 'all'

  const runExport = async (format, scope) => {
     setExporting(true);
     const savedIndex = currentPageIndex, savedScale = scale, savedPos = position;
     try {
        const indices = scope === 'all' ? pagesRef.current.map((_, i) => i) : [currentPageIndex];
        const shots = [];
        for (let k = 0; k < indices.length; k++) {
           toast.loading(`กำลังเตรียมไฟล์ (${k + 1}/${indices.length})...`, { id: 'export' });
           const page = pagesRef.current[indices[k]];
           const url = await capturePageDataURL(indices[k], format === 'pdf' ? 'image/jpeg' : 'image/png');
           if (url) shots.push({ url, w: page.width, h: page.height, index: indices[k] });
        }
        if (shots.length === 0) { toast.error('ไม่สามารถสร้างไฟล์ได้', { id: 'export' }); return; }

        if (format === 'png') {
           shots.forEach((s) => downloadDataUrl(s.url, `notebook-page-${s.index + 1}.png`));
           toast.success(shots.length > 1 ? `ดาวน์โหลด ${shots.length} รูปแล้ว` : 'ดาวน์โหลดรูปแล้ว', { id: 'export', icon: '🖼️' });
        } else {
           const { jsPDF } = await import('jspdf');
           const first = shots[0];
           const pdf = new jsPDF({ orientation: first.w > first.h ? 'landscape' : 'portrait', unit: 'px', format: [first.w, first.h] });
           shots.forEach((s, k) => {
              if (k > 0) pdf.addPage([s.w, s.h], s.w > s.h ? 'landscape' : 'portrait');
              pdf.addImage(s.url, 'JPEG', 0, 0, s.w, s.h);
           });
           pdf.save(`notebook-${Date.now()}.pdf`);
           toast.success('ดาวน์โหลด PDF แล้ว', { id: 'export', icon: '📄' });
        }
     } catch (err) {
        console.error('Export failed', err);
        toast.error('ส่งออกไม่สำเร็จ', { id: 'export' });
     } finally {
        setCurrentPageIndex(savedIndex);
        setScale(savedScale);
        setPosition(savedPos);
        setExporting(false);
        setShowExport(false);
     }
  };

  return {
    exportNotebookPDF, capturePageDataURL, runExport,
    showExport, setShowExport, exporting,
    exportFormat, setExportFormat, exportScope, setExportScope,
  };
}
