import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadDataUrl, preloadImage } from './notebookAssets.js';

// Helper to composite a stage snapshot onto a solid paper background
// to avoid black transparency bugs in JPEG/PDF export and dark mode image viewers.
async function compositeWithBackground(rawDataUrl, paperColor = 'white') {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let bgColor = '#FFFFFF';
        if (paperColor === 'yellow') bgColor = '#FEF3C7';
        else if (paperColor === 'dark') bgColor = '#1F2937';

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

// Getting pages out of the notebook: whole-notebook PDF, and the export sheet
// that writes the current page or all of them as PNG or PDF.
export function useNotebookExport({
  stageRef, pagesRef, dimensions,
  currentPageIndex, setCurrentPageIndex,
  scale, setScale, position, setPosition,
  selectShape, pages, activeBook, clearLassoSelection,
}) {
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('png'); // 'png' | 'pdf'
  const [exportScope, setExportScope] = useState('current'); // 'current' | 'all'

  // Render one page cleanly (scale 1, no pan) and crop to the paper rectangle,
  // compositing over a solid paper background.
  const capturePageDataURL = async (index) => {
     const page = pagesRef.current[index];
     if (!page) return null;
     if (page.src) await preloadImage(page.src);
     setCurrentPageIndex(index);
     setScale(1);
     setPosition({ x: 0, y: 0 });
     // Let React commit, Konva redraw, and the (cached) image paint.
     await new Promise((r) => setTimeout(r, 400));
     const stage = stageRef.current;
     if (!stage) return null;
     const px = Math.max(0, (dimensions.width - page.width) / 2);
     const rawDataURL = stage.toDataURL({
       x: px,
       y: 20,
       width: page.width,
       height: page.height,
       pixelRatio: 2,
       mimeType: 'image/png'
     });

     return await compositeWithBackground(rawDataURL, page.paperColor || 'white');
  };

  const runExport = async (format, scope) => {
     setExporting(true);
     selectShape?.(null);
     clearLassoSelection?.();
     const savedIndex = currentPageIndex, savedScale = scale, savedPos = position;
     try {
        const indices = scope === 'all' ? pagesRef.current.map((_, i) => i) : [currentPageIndex];
        const shots = [];
        for (let k = 0; k < indices.length; k++) {
           toast.loading(`กำลังเตรียมไฟล์ (${k + 1}/${indices.length})...`, { id: 'export' });
           const page = pagesRef.current[indices[k]];
           const url = await capturePageDataURL(indices[k]);
           if (url) shots.push({ url, w: page.width, h: page.height, index: indices[k] });
        }
        if (shots.length === 0) { toast.error('ไม่สามารถสร้างไฟล์ได้', { id: 'export' }); return; }

        const safeTitle = (activeBook?.book?.title || 'notebook').replace(/[^\w\u0E00-\u0E7F-]+/g, '_').slice(0, 40) || 'notebook';

        if (format === 'png') {
           shots.forEach((s) => downloadDataUrl(s.url, `${safeTitle}-page-${s.index + 1}.png`));
           toast.success(shots.length > 1 ? `ดาวน์โหลด ${shots.length} รูปแล้ว` : 'ดาวน์โหลดรูปภาพแล้ว', { id: 'export', icon: '🖼️' });
        } else {
           const { jsPDF } = await import('jspdf');
           const first = shots[0];
           const pdf = new jsPDF({ orientation: first.w > first.h ? 'landscape' : 'portrait', unit: 'px', format: [first.w, first.h] });
           shots.forEach((s, k) => {
              if (k > 0) pdf.addPage([s.w, s.h], s.w > s.h ? 'landscape' : 'portrait');
              pdf.addImage(s.url, 'PNG', 0, 0, s.w, s.h);
           });
           pdf.save(`${safeTitle}.pdf`);
           toast.success('ดาวน์โหลด PDF เรียบร้อยแล้ว', { id: 'export', icon: '📄' });
        }
     } catch (err) {
        console.error('Export failed', err);
        toast.error('ส่งออกไม่สำเร็จ: ' + (err.message || 'เกิดข้อผิดพลาด'), { id: 'export' });
     } finally {
        setCurrentPageIndex(savedIndex);
        setScale(savedScale);
        setPosition(savedPos);
        setExporting(false);
        setShowExport(false);
     }
  };

  const exportNotebookPDF = async () => {
     await runExport('pdf', 'all');
  };

  return {
    exportNotebookPDF, capturePageDataURL, runExport,
    showExport, setShowExport, exporting,
    exportFormat, setExportFormat, exportScope, setExportScope,
  };
}

