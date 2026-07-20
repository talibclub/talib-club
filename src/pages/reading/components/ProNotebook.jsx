import React, { useState } from 'react';
import { Tldraw, AssetRecordType, createShapeId } from 'tldraw';
import 'tldraw/tldraw.css';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function ProNotebook({ bookId, uid, activeBook }) {
  const [mode, setMode] = useState(activeBook?.book?.fileUrl ? 'annotate' : 'blank'); 
  const [loadingPdf, setLoadingPdf] = useState(activeBook?.book?.fileUrl ? true : false);
  const [tldrawEditor, setTldrawEditor] = useState(null);

  const handleMount = async (editor) => {
    setTldrawEditor(editor);
    if (mode === 'annotate' && activeBook?.book?.fileUrl) {
      try {
        let url = activeBook.book.fileUrl;
        
        // Attempt to workaround Google Drive preview URLs to direct download URLs
        if (url.includes('drive.google.com') && url.includes('/view')) {
           const match = url.match(/\/d\/(.*?)\//);
           if (match && match[1]) {
             url = `https://drive.google.com/uc?export=download&id=${match[1]}`;
           }
        }
        
        // Pass the URL through our Vercel Serverless Proxy to bypass CORS and virus scan
        const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
        
        toast.loading(`กำลังโหลด PDF...`, { id: 'pdf-load' });
        const loadingTask = pdfjsLib.getDocument(proxyUrl);
        const pdf = await loadingTask.promise;
        const numPages = Math.min(pdf.numPages, 30); // Limit to 30 pages for performance
        
        const assets = [];
        const shapes = [];
        let currentY = 0;
        
        toast.loading(`กำลังแยกหน้า PDF (${numPages} หน้า)...`, { id: 'pdf-load' });
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); 
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          
          const assetId = AssetRecordType.createId();
          assets.push({
            id: assetId,
            type: 'image',
            typeName: 'asset',
            props: {
              src: dataUrl,
              w: canvas.width,
              h: canvas.height,
              name: `page-${i}`,
              isAnimated: false,
              mimeType: 'image/png'
            }
          });
          
          shapes.push({
            id: createShapeId(),
            type: 'image',
            x: 0,
            y: currentY,
            isLocked: true,
            props: {
              assetId,
              w: canvas.width,
              h: canvas.height
            }
          });
          
          currentY += canvas.height + 40; 
        }
        
        editor.createAssets(assets);
        editor.createShapes(shapes);
        toast.success('โหลดหน้าหนังสือลงกระดานสำเร็จ!', { id: 'pdf-load' });
      } catch (err) {
        console.error("PDF Load Error", err);
        toast.error('ดึงข้อมูล PDF ไม่สำเร็จ จะใช้เป็นกระดานเปล่าแทน', { id: 'pdf-load', duration: 4000 });
      } finally {
        setLoadingPdf(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--br2)', background: 'white' }}>
      {loadingPdf && (
         <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <i className="ti ti-loader-2 spin" style={{ fontSize: 36, color: 'var(--teal)', marginBottom: 16 }}></i>
           <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>กำลังดึงหน้า PDF มาลงกระดาน...</span>
           <span style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>กระบวนการนี้อาจใช้เวลาสักครู่ ขึ้นอยู่กับขนาดหนังสือ</span>
         </div>
      )}
      <Tldraw 
        key={mode}
        persistenceKey={`notebook-v2-${uid}-${bookId}-${mode}`} 
        onMount={handleMount} 
      />
    </div>
  );
}
