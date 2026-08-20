import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/feedback.jsx';
import { loadBookPdf } from '../../utils/pdfCache.js';

// Bringing a PDF into the notebook: the book's own file, or one picked from disk.
//
// Importing REPLACES every page, so both routes go through a confirmation and an
// undo entry first — one tap used to be able to wipe a notebook with no warning
// and no way back.
//
// Not a hook: no state of its own, just the two importers and what they need to
// write pages.
export function makePdfImport({
  activeBook, dimensions, pages, setPages, setCurrentPageIndex,
  pushHistory, setLoadingPdf, onPdfPageCount, pagesRef,
}) {
  const startLoadingPDF = async (pdfUrl = null) => {
    // Importing a PDF REPLACES every page in the notebook. That used to happen
    // with no warning and no undo entry, so one tap on "นำเข้า PDF" could wipe a
    // notebook full of handwriting for good. Ask first when there is anything to
    // lose, and push a history snapshot so Undo can bring it back.
    const hasWork = pagesRef.current.some(p =>
      (p.lines?.length || 0) + (p.texts?.length || 0) + (p.images?.length || 0) +
      (p.shapes?.length || 0) + (p.stickers?.length || 0) > 0
    );
    if (hasWork) {
      const ok = await confirmAction({
        title: "นำเข้า PDF ทับสมุดเล่มนี้?",
        message: `สมุดโน้ตปัจจุบันมี ${pagesRef.current.length} หน้าที่มีงานอยู่ การนำเข้า PDF จะแทนที่ทุกหน้าทั้งหมด (กด Undo เพื่อเรียกคืนได้)`,
        confirmText: "นำเข้าและแทนที่",
        danger: true,
      });
      if (!ok) return;
      pushHistory();
    }

    setLoadingPdf(true);
    
    try {
      toast.loading(`กำลังโหลด PDF...`, { id: 'pdf-load' });
      // A raw pdfUrl (rare) loads directly; the common book-file path goes
      // through the shared byte cache so re-importing never re-downloads.
      const pdf = pdfUrl
        ? await pdfjsLib.getDocument({ url: pdfUrl }).promise
        : await loadBookPdf(activeBook.book.fileUrl);
      // Tell the reader how many pages the file really has. The page-range
      // fields otherwise validate against the count typed into the book record,
      // which is self-declared and often blank.
      onPdfPageCount?.(pdf.numPages);
      const MAX_IMPORT_PAGES = 30;
      const numPages = Math.min(pdf.numPages, MAX_IMPORT_PAGES);
      // Say so rather than silently dropping the rest — a 200-page book used to
      // come in as 30 pages with nothing to explain where the others went.
      if (pdf.numPages > MAX_IMPORT_PAGES) {
        toast(`ไฟล์นี้มี ${pdf.numPages} หน้า — นำเข้าได้สูงสุด ${MAX_IMPORT_PAGES} หน้าแรก`, { icon: 'ℹ️', duration: 5000 });
      }

      toast.loading(`กำลังแยกหน้า PDF (0/${numPages})...`, { id: 'pdf-load' });

      // Tablets used to fail here while desktops were fine: every page was
      // rendered at a fixed 2× (a ~2400×3400 canvas) and 30 of those, plus their
      // JPEG data URLs, blow past the canvas/memory ceiling mobile browsers
      // enforce — the throw surfaced only as "โหลด PDF ไม่สำเร็จ". So: size each
      // page to what the notebook actually displays, cap the pixel budget, and
      // release every canvas as soon as it has been encoded.
      const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
      const maxPixels = isTouch ? 2.2e6 : 6e6;
      const quality = isTouch ? 0.8 : 0.85;
      const targetWidth = Math.min(isTouch ? 1400 : 1800, Math.max(700, (dimensions.width || 800) * 2));

      let extractedPages = [];
      for (let i = 1; i <= numPages; i++) {
        toast.loading(`กำลังแยกหน้า PDF (${i}/${numPages})...`, { id: 'pdf-load' });
        const page = await pdf.getPage(i);

        const base = page.getViewport({ scale: 1 });
        let renderScale = Math.min(3, targetWidth / base.width);
        const area = base.width * base.height;
        if (area * renderScale * renderScale > maxPixels) renderScale = Math.sqrt(maxPixels / area);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', quality); // JPEG: a fraction of PNG's memory on long PDFs
        // Hand the bitmap back to the browser now instead of waiting for GC.
        canvas.width = 0; canvas.height = 0;
        page.cleanup?.();
        // Let the browser breathe (paint the progress toast, reclaim memory)
        // before allocating the next page's canvas.
        await new Promise((r) => setTimeout(r, 0));

        // Calculate display dimensions fitting screen width
        const displayWidth = dimensions.width > 0 ? dimensions.width - 40 : viewport.width;
        const displayScale = displayWidth / viewport.width;
        const displayHeight = viewport.height * displayScale;

        extractedPages.push({
          id: `page-${Date.now()}-${i}`,
          src: dataUrl,
          width: displayWidth,
          height: displayHeight,
          lines: [],
          stickers: [],
          images: [],
          texts: [],
          shapes: [],
          paperType: 'blank',
          paperColor: 'white'
        });
      }
      
      setPages(extractedPages); // Replace with PDF pages
      setCurrentPageIndex(0);
      toast.success('ดึงหน้า PDF สำเร็จ!', { id: 'pdf-load' });
    } catch (err) {
      console.error("PDF Load Error", err);
      // Say what actually went wrong — "ไม่สำเร็จ" on its own gave us nothing to
      // work with when it only failed on the tablet.
      const why = String(err?.message || err || '').slice(0, 120);
      toast.error(`โหลด PDF ไม่สำเร็จ จะใช้เป็นกระดานเปล่าแทน${why ? `\n(${why})` : ''}`, { id: 'pdf-load', duration: 7000 });
    } finally {
      setLoadingPdf(false);
      // The blob URL minted by the file picker was never released, so every
      // imported PDF pinned its whole file in memory for the life of the tab.
      if (pdfUrl && pdfUrl.startsWith('blob:')) URL.revokeObjectURL(pdfUrl);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 50 * 1024 * 1024) {
         toast.error('ไฟล์ PDF มีขนาดใหญ่เกิน 50MB');
         return;
      }
      try {
         const localPdfUrl = URL.createObjectURL(file);
         toast.success('โหลดไฟล์สำเร็จ!', { id: 'pdf-upload' });
         startLoadingPDF(localPdfUrl);
      } catch (err) {
         console.error(err);
         toast.error('โหลดไฟล์ล้มเหลว', { id: 'pdf-upload' });
      }
    } else if (file) {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้นครับ');
    }
    e.target.value = null;
  };

  return { startLoadingPDF, handleFileUpload };
}
