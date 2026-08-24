import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { compressImageFile, nextImageId } from './notebookAssets.js';

// Getting a picture onto the page: the file picker, and dropping one from the
// desktop or straight out of a web page.
//
// A drop can carry an actual file, or only a URL — the second case has to be
// fetched, and falls back to referencing the remote address when the source
// blocks cross-origin reads.
// It owns the drag-over flag and the window listeners that clear it, so it is a
// hook rather than a plain factory.
export function useImageDrop({
  readonly, stageRef, dimensions, currentPage, scale, position,
  updatePage, currentPageIndex, pushHistory, selectShape, setTool, pageX, pageY,
}) {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file || !file.type.startsWith('image/')) return;
    const base64 = await compressImageFile(file);
    insertImageSrcAt(base64);
  };


  // --- Drag-and-drop / paste images (iPad-style: drag a picture from Google or
  // any tab straight onto the page, or Ctrl/Cmd+V a copied image) ---
  const [isDragOver, setIsDragOver] = useState(false);

  // The overlay used to be cleared only by this element's own dragleave and
  // drop. A drag that ends any other way — dropped outside the notebook, Esc,
  // or the floating search window being closed mid-drag — fired neither, so the
  // "ลากรูปมาวาง" frame stayed on screen for good. dragend fires on the source,
  // and a dragleave with no relatedTarget means the pointer left the window
  // entirely; either one means the drag is over as far as we are concerned.
  useEffect(() => {
    const clear = () => setIsDragOver(false);
    const onDocLeave = (e) => { if (!e.relatedTarget) clear(); };
    window.addEventListener('dragend', clear);
    window.addEventListener('drop', clear);
    window.addEventListener('blur', clear);
    document.addEventListener('dragleave', onDocLeave);
    return () => {
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
      window.removeEventListener('blur', clear);
      document.removeEventListener('dragleave', onDocLeave);
    };
  }, []);

  // Turn a client (screen) point into page-space coordinates using the live stage
  // transform, so a dropped image lands under the pointer at any zoom/pan.
  const clientToPage = (clientX, clientY) => {
     const stage = stageRef.current;
     if (!stage) return { x: (currentPage?.width || 800) / 2, y: (currentPage?.height || 1130) / 2 };
     const rect = stage.container().getBoundingClientRect();
     const s = stage.scaleX() || scale || 1;
     const cx = clientX != null ? clientX : (rect.left + rect.width / 2);
     const cy = clientY != null ? clientY : (rect.top + rect.height / 2);
     return {
        x: (cx - rect.left - stage.x()) / s - pageX,
        y: (cy - rect.top - stage.y()) / s - pageY,
     };
  };

  // Measure an image src, size it to a friendly width keeping aspect ratio, and
  // drop it centred on the point (or the page centre when no point is given).
  const insertImageSrcAt = (src, clientX, clientY) => {
     if (!src) {
        // Nothing usable came out of the drag. Without this the caller's
        // "กำลังแทรกรูป..." toast is left spinning with nothing to finish it.
        toast.error('ไม่พบรูปในสิ่งที่ลากมา', { id: 'drop-img' });
        return;
     }
     let settled = false;
     const place = (w, h) => {
        if (settled) return;
        settled = true;
        const pt = clientToPage(clientX, clientY);
        pushHistory();
        updatePage(currentPageIndex, (page) => {
           if (!page.images) page.images = [];
           page.images.push({ id: nextImageId(), src, x: pt.x - w / 2, y: pt.y - h / 2, width: w, height: h });
        });
        toast.success('แทรกรูปแล้ว', { id: 'drop-img' });
     };
     const im = new window.Image();
     im.onload = () => {
        const w = Math.min(320, im.naturalWidth || 320);
        const ratio = im.naturalWidth ? (im.naturalHeight / im.naturalWidth) : 1;
        place(w, Math.max(40, Math.round(w * (ratio || 1))));
     };
     im.onerror = () => place(300, 300); // couldn't measure (CORS): use a default box
     // Some URLs resolve neither way — a blob: from a window that has since been
     // closed, or a host that simply never answers. Nothing fired, so the image
     // was never placed and the loading toast span forever. Place it at a
     // default size instead of waiting indefinitely.
     setTimeout(() => place(300, 300), 8000);
     im.src = src;
  };

  // Pull the best image reference out of a drag payload. The actual dragged image
  // usually rides in text/html (<img src>); page/URL drags fall back to uri-list.
  const imageUrlFromDataTransfer = (dt) => {
     const html = dt.getData('text/html');
     if (html) { const m = html.match(/<img[^>]+src=["']([^"']+)["']/i); if (m) return m[1]; }
     const uri = dt.getData('text/uri-list');
     if (uri) return uri.split('\n').find(l => l && !l.startsWith('#')) || '';
     const plain = dt.getData('text/plain');
     if (plain && /^https?:\/\//i.test(plain.trim())) return plain.trim();
     return '';
  };

  const fetchAsDataUrlOrRemote = async (url) => {
     try {
        // Bounded: a host that accepts the connection and then never answers
        // would otherwise leave the caller awaiting forever, with its
        // "กำลังแทรกรูป..." toast spinning and no image ever placed. On timeout
        // we fall through and reference the remote URL, which is the same thing
        // that happens for a CORS refusal.
        const ctrl = new AbortController();
        const bail = setTimeout(() => ctrl.abort(), 8000);
        const r = await fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(bail));
        const blob = await r.blob();
        if (blob.type.startsWith('image/')) {
           return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
        }
     } catch { /* CORS or network: reference the remote URL instead */ }
     return url;
  };

  const handleCanvasDrop = async (e) => {
     e.preventDefault();
     setIsDragOver(false);
     if (readonly) return;
     const dt = e.dataTransfer;
     if (!dt) return;
     const cx = e.clientX, cy = e.clientY;

     // 1) An actual image file (from the desktop or another app)
     const file = Array.from(dt.files || []).find(f => f.type.startsWith('image/'));
     if (file) {
        insertImageSrcAt(await compressImageFile(file), cx, cy);
        return;
     }
     // 2) An image dragged out of a web page (Google Images, an article, ...)
     const url = imageUrlFromDataTransfer(dt);
     if (!url) { toast.error('ไม่พบรูปในสิ่งที่ลากมา ลองลากที่ตัวรูปโดยตรง'); return; }
     toast.loading('กำลังแทรกรูป...', { id: 'drop-img' });
     const src = url.startsWith('data:') ? url : await fetchAsDataUrlOrRemote(url);
     insertImageSrcAt(src, cx, cy);
  };

  return { isDragOver, setIsDragOver, handleImageUpload, clientToPage, insertImageSrcAt, imageUrlFromDataTransfer, fetchAsDataUrlOrRemote, handleCanvasDrop };
}
