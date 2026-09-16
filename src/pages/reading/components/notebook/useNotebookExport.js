import { paginateA4, A4_MM_PER_PIXEL } from './exportLayout.js';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadDataUrl, preloadImage } from './notebookAssets.js';
import { notebookExportLayers } from './exportLayers.js';

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
  stageRef, pagesRef, dimensions, loadStateRef,
  currentPageIndex, setCurrentPageIndex,
  scale, setScale, position, setPosition,
  selectShape, pages, activeBook, clearLassoSelection,
}) {
  const busy = useRef(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('png'); // 'png' | 'pdf'
  const [exportScope, setExportScope] = useState('current'); // 'current' | 'all'

  // Render one page cleanly (scale 1, no pan) and crop to the paper rectangle,
  // compositing over a solid paper background.
  const capturePageDataURL = async (index, layout = "content") => {
     const page = pagesRef.current[index];
     if (!page) return null;
     if (page.src) await preloadImage(page.src);
     await Promise.all([...(page.images || []), ...(page.pdfs || [])].filter(item => item.src).map(item => preloadImage(item.src)));
     await document.fonts?.ready;
     setCurrentPageIndex(index);
     setScale(1);
     setPosition({ x: 0, y: 0 });
     // Let React commit, Konva redraw, and the (cached) image paint.
     await new Promise((r) => setTimeout(r, 400));
     const stage = stageRef.current;
     if (!stage) return null;
     const px = Math.max(0, (dimensions.width - page.width) / 2);
     let crop = { x: px, y: 20, width: page.width, height: page.height };
     const layers = notebookExportLayers(stage);
     if (layout !== 'paper' && !page.src && page.infinite !== false) {
       // Measure rendered objects, including rotated images and multiline text.
       // The infinite board's stored size can contain a large amount of empty space.
       const boxes = layers.flatMap(layer => layer.getChildren().flatMap(group =>
         group.getChildren().filter(node => node.name() !== 'background' && node.visible())
           .map(node => node.getClientRect({ relativeTo: stage }))
       )).filter(box => box.width > 0 && box.height > 0);
       if (boxes.length) {
         const x = Math.min(...boxes.map(box => box.x)) - 32;
         const y = Math.min(...boxes.map(box => box.y)) - 32;
         crop = { x, y,
           width: Math.ceil(Math.max(...boxes.map(box => box.x + box.width)) - x + 32),
           height: Math.ceil(Math.max(...boxes.map(box => box.y + box.height)) - y + 32) };
       }
     }
     // Export layers directly so the viewport cannot clip off-screen content.
     const pixelRatio = Math.min(2, 8192 / Math.max(crop.width, crop.height));
     const canvas = document.createElement('canvas');
     canvas.width = Math.ceil(crop.width * pixelRatio);
     canvas.height = Math.ceil(crop.height * pixelRatio);
     const context = canvas.getContext('2d');
     if (!context) throw new Error('ไม่สามารถสร้างภาพได้');
     for (const layer of layers) {
       context.drawImage(layer.toCanvas({ ...crop, pixelRatio }), 0, 0);
     }
     const url = await compositeWithBackground(canvas.toDataURL('image/png'), page.paperColor || 'white');
     return { url, w: crop.width, h: crop.height };
  };

  const runExport = async (format, scope, layout = 'content', prepared = null) => {
     if (busy.current) return;

     if (loadStateRef && !['ready', 'offline'].includes(loadStateRef.current)) {
       toast.error('ยังโหลดสมุดไม่สำเร็จ กรุณาลองโหลดใหม่ก่อน Export');
       return;
     }
     busy.current = true;
     setExporting(true);
     selectShape?.(null);
     clearLassoSelection?.();
     const savedIndex = currentPageIndex, savedScale = scale, savedPos = position;
     try {
        const indices = scope === 'all' ? pagesRef.current.map((_, i) => i) : [currentPageIndex];
        let shots = prepared || [];
        for (let k = 0; !prepared && k < indices.length; k++) {
           toast.loading(`กำลังเตรียมไฟล์ (${k + 1}/${indices.length})...`, { id: 'export' });
           const shot = await capturePageDataURL(indices[k], layout);
           if (!shot) throw new Error('ไม่สามารถสร้างภาพหน้าที่ ' + (indices[k] + 1));
           shots.push({ ...shot, index: indices[k] });
        }
        if (shots.length === 0) { toast.error('ไม่สามารถสร้างไฟล์ได้', { id: 'export' }); return; }

        if (!prepared && layout === 'a4') shots = await paginateA4(shots);
        if (format === 'preview') return shots;
        const safeTitle = (activeBook?.book?.title || 'notebook').replace(/[^\w\u0E00-\u0E7F-]+/g, '_').slice(0, 40) || 'notebook';

        if (format === 'png') {
           shots.forEach((s) => downloadDataUrl(s.url, `${safeTitle}-page-${s.index + 1}.png`));
           toast.success(shots.length > 1 ? `ดาวน์โหลด ${shots.length} รูปแล้ว` : 'ดาวน์โหลดรูปภาพแล้ว', { id: 'export', icon: '🖼️' });
        } else {
           const { jsPDF } = await import('jspdf');
           if (layout === 'a4') {
             const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
             shots.forEach((shot, index) => {
               if (index) pdf.addPage();
               pdf.addImage(shot.url, 'PNG', 10, 10, shot.w * A4_MM_PER_PIXEL, shot.h * A4_MM_PER_PIXEL);
             });
             pdf.setDisplayMode('fullwidth');
             pdf.save(safeTitle + '.pdf');
             toast.success('ดาวน์โหลด PDF เรียบร้อยแล้ว', { id: 'export' });
             return;
           }
           const first = shots[0];
           const pdf = new jsPDF({ orientation: first.w > first.h ? 'landscape' : 'portrait', unit: 'px', hotfixes: ['px_scaling'], format: [first.w, first.h] });
           pdf.setDisplayMode('fullwidth');
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
        busy.current = false;
        setExporting(false);
        if (format === 'preview') toast.dismiss('export');
        else setShowExport(false);
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

