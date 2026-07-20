import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Path, Group, Circle, Text, Rect } from 'react-konva';
import useImage from 'use-image';
import getStroke from 'perfect-freehand';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PDFPageImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
    />
  );
};

export default function ProNotebook({ bookId, uid, activeBook }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [pages, setPages] = useState([{ id: 'page-default', src: null, width: 800, height: 1130, lines: [], stickers: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(activeBook?.book?.fileUrl ? true : false);
  
  const [tool, setTool] = useState('pen'); // 'pen', 'eraser', 'pan'
  
  const colors = [
    '#111827', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#78716C', '#FFFFFF'
  ];
  const sizes = [2, 4, 6, 8, 12, 16, 24];
  const [penColor, setPenColor] = useState('#111827');
  const [penSize, setPenSize] = useState(4);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const isDrawing = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Update a specific page's data safely
  const updatePage = (index, updater) => {
    setPages((prev) => {
      const newPages = [...prev];
      const page = { ...newPages[index] };
      updater(page);
      newPages[index] = page;
      return newPages;
    });
  };

  const startLoadingPDF = async (pdfUrl = null) => {
    setShowModeSelection(false);
    setLoadingPdf(true);
    
    try {
      let targetUrl = pdfUrl;
      let proxyUrl = targetUrl;
      
      if (!targetUrl) {
        let url = activeBook.book.fileUrl;
        if (url.includes('drive.google.com') && url.includes('/view')) {
           const match = url.match(/\/d\/(.*?)\//);
           if (match && match[1]) {
             url = `https://drive.google.com/uc?export=download&id=${match[1]}`;
           }
        }
        proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
      }
      
      toast.loading(`กำลังโหลด PDF...`, { id: 'pdf-load' });
      const loadingTask = pdfjsLib.getDocument({ url: proxyUrl });
      const pdf = await loadingTask.promise;
      const numPages = Math.min(pdf.numPages, 30);
      
      const extractedPages = [];
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
          stickers: []
        });
      }
      
      setPages(extractedPages); // Replace with PDF pages
      setCurrentPageIndex(0);
      toast.success('ดึงหน้า PDF สำเร็จ!', { id: 'pdf-load' });
    } catch (err) {
      console.error("PDF Load Error", err);
      toast.error('โหลด PDF ไม่สำเร็จ จะใช้เป็นกระดานเปล่าแทน', { id: 'pdf-load', duration: 4000 });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const objectUrl = URL.createObjectURL(file);
      startLoadingPDF(objectUrl);
    } else if (file) {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้นครับ');
    }
    e.target.value = null;
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        // Capture the index when recording starts so sticker goes to the right page
        const targetPageIndex = currentPageIndex;
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          let stickerX = 100;
          let stickerY = 100;
          
          updatePage(targetPageIndex, (page) => {
             page.stickers.push({
               id: `audio-${Date.now()}`,
               x: stickerX,
               y: stickerY,
               audioUrl: audioUrl,
               isPlaying: false
             });
          });
          
          toast.success('วางสติกเกอร์เสียงเรียบร้อยแล้ว!', { icon: '🎤' });
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        toast('กำลังอัดเสียง... (กดอีกครั้งเพื่อหยุด)', { icon: '🔴', duration: 4000 });
      } catch (err) {
        console.error("Mic access denied", err);
        toast.error('ไม่สามารถเข้าถึงไมโครโฟนได้');
      }
    }
  };

  const playAudioSticker = (pageIndex, id, url) => {
    const audio = new Audio(url);
    audio.play();
    
    updatePage(pageIndex, (page) => {
      page.stickers = page.stickers.map(s => s.id === id ? { ...s, isPlaying: true } : s);
    });
    
    audio.onended = () => {
      updatePage(pageIndex, (page) => {
        page.stickers = page.stickers.map(s => s.id === id ? { ...s, isPlaying: false } : s);
      });
    };
  };

  const getPointerPosRelativeToPage = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(stage.getPointerPosition());
    
    // We also need to subtract the pageX and pageY offsets from the Group
    const currentPage = pages[currentPageIndex] || { width: 800, height: 1130 };
    const pageX = Math.max(0, (dimensions.width - currentPage.width * scale) / 2 / scale);
    const pageY = 20; 
    
    return {
      x: pos.x - pageX,
      y: pos.y - pageY
    };
  };

  const handlePointerDown = () => {
    if (tool === 'pan') return;
    const pos = getPointerPosRelativeToPage();
    if (!pos) return;
    
    isDrawing.current = true;
    updatePage(currentPageIndex, (page) => {
       page.lines.push({ tool, color: penColor, size: penSize, points: [pos.x, pos.y, pos.x, pos.y] });
    });
  };

  const handlePointerMove = () => {
    if (!isDrawing.current || tool === 'pan') return;
    const pos = getPointerPosRelativeToPage();
    if (!pos) return;
    
    updatePage(currentPageIndex, (page) => {
       const lastLine = { ...page.lines[page.lines.length - 1] };
       lastLine.points = lastLine.points.concat([pos.x, pos.y]);
       page.lines[page.lines.length - 1] = lastLine;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 5));
    
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };
  
  const getSvgPathFromStroke = (stroke) => {
    if (!stroke.length) return "";
    const d = stroke.reduce((acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
    }, ["M", ...stroke[0], "Q"]);
    d.push("Z");
    return d.join(" ");
  };

  const currentPage = pages[currentPageIndex] || { width: 800, height: 1130, lines: [], stickers: [] };
  const pageX = Math.max(0, (dimensions.width - currentPage.width * scale) / 2 / scale);
  const pageY = 20; 

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--br2)', background: '#E5E7EB' }}>
      
      {showModeSelection && (
         <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
           <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>เริ่มต้นใช้งานสมุดโน้ต</h3>
           <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 32, textAlign: 'center' }}>คุณต้องการปูพื้นหลังกระดานด้วย PDF หรือไม่?</p>
           <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
             <button onClick={() => setShowModeSelection(false)} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid var(--br2)', background: 'white', color: 'var(--text)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
               <i className="ti ti-notebook" style={{ fontSize: 20 }}></i> ใช้กระดานเปล่า
             </button>
             <button onClick={() => document.getElementById('pdf-upload').click()} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid var(--teal)', background: 'white', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
               <i className="ti ti-upload" style={{ fontSize: 20 }}></i> อัปโหลดไฟล์ PDF เอง
             </button>
             <button onClick={() => startLoadingPDF(null)} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--teal)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 169, 143, 0.2)' }}>
               <i className="ti ti-link" style={{ fontSize: 20 }}></i> ดึงจากลิงก์หนังสือ
             </button>
           </div>
         </div>
      )}

      <input type="file" id="pdf-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

      {loadingPdf && (
         <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <i className="ti ti-loader-2 spin" style={{ fontSize: 36, color: 'var(--teal)', marginBottom: 16 }}></i>
           <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>กำลังดึงหน้า PDF มาลงกระดาน...</span>
         </div>
      )}

      {/* Floating Toolbar */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '8px', borderRadius: 100, display: 'flex', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--br2)' }}>
        <button onClick={() => setTool('pen')} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: tool === 'pen' ? 'var(--teal)' : 'transparent', color: tool === 'pen' ? 'white' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <i className="ti ti-pencil" style={{ fontSize: 20 }}></i>
        </button>
        <button onClick={() => setTool('highlighter')} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: tool === 'highlighter' ? '#F59E0B' : 'transparent', color: tool === 'highlighter' ? 'white' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <i className="ti ti-highlight" style={{ fontSize: 20 }}></i>
        </button>
        
        {(tool === 'pen' || tool === 'highlighter') && (
          <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: '6px 12px', borderRadius: 100, alignItems: 'center', marginLeft: 4, marginRight: 4, flexWrap: 'wrap', maxWidth: 300, justifyContent: 'center' }}>
            {colors.map(c => (
              <div 
                 key={c}
                 onClick={() => setPenColor(c)}
                 style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: penColor === c ? '2px solid white' : '1px solid rgba(0,0,0,0.1)', outline: penColor === c ? '2px solid var(--teal)' : 'none' }}
              />
            ))}
            {/* Custom Color Input */}
            <div style={{ position: 'relative', width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
               <input 
                 type="color" 
                 value={penColor}
                 onChange={(e) => setPenColor(e.target.value)}
                 style={{ position: 'absolute', opacity: 0, width: '200%', height: '200%', cursor: 'pointer' }}
               />
            </div>
            
            <div style={{ width: 1, background: '#D1D5DB', margin: '0 4px', height: 16 }}></div>
            
            {sizes.map(s => (
              <div 
                 key={s}
                 onClick={() => setPenSize(s)}
                 style={{ width: 24, height: 24, borderRadius: '50%', background: penSize === s ? 'white' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: penSize === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                 <div style={{ width: s, height: s, borderRadius: '50%', background: penSize === s ? 'var(--teal)' : '#9CA3AF' }}></div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setTool('eraser')} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: tool === 'eraser' ? 'var(--red)' : 'transparent', color: tool === 'eraser' ? 'white' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <i className="ti ti-eraser" style={{ fontSize: 20 }}></i>
        </button>
        <button onClick={() => setTool('pan')} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: tool === 'pan' ? '#E5E7EB' : 'transparent', color: tool === 'pan' ? '#374151' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <i className="ti ti-hand-stop" style={{ fontSize: 20 }}></i>
        </button>
        <div style={{ width: 1, background: 'var(--br2)', margin: '0 4px', height: 24 }}></div>
        <button onClick={() => document.getElementById('pdf-upload').click()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'var(--blue-light)', color: 'var(--blue-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <i className="ti ti-upload" style={{ fontSize: 20 }}></i>
        </button>
        <button onClick={toggleRecording} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: isRecording ? 'var(--red)' : 'var(--orange-light)', color: isRecording ? 'white' : 'var(--orange-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}>
          <i className={isRecording ? "ti ti-player-stop-filled" : "ti ti-microphone"} style={{ fontSize: 20 }}></i>
        </button>
      </div>
      
      {/* Goodnotes Pagination Controls */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--br2)' }}>
        <button 
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === 0 ? 'default' : 'pointer', opacity: currentPageIndex === 0 ? 0.3 : 1 }}>
          <i className="ti ti-chevron-left" style={{ fontSize: 20 }}></i>
        </button>
        
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', minWidth: 60, textAlign: 'center' }}>
          {currentPageIndex + 1} / {pages.length}
        </span>
        
        <button 
          onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === pages.length - 1}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === pages.length - 1 ? 'default' : 'pointer', opacity: currentPageIndex === pages.length - 1 ? 0.3 : 1 }}>
          <i className="ti ti-chevron-right" style={{ fontSize: 20 }}></i>
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--br2)' }}></div>
        
        <button 
          onClick={() => {
            const newPage = { id: `blank-${Date.now()}`, src: null, width: dimensions.width > 0 ? dimensions.width - 40 : 800, height: 1130, lines: [], stickers: [] };
            setPages((prev) => {
              const p = [...prev];
              p.splice(currentPageIndex + 1, 0, newPage);
              return p;
            });
            setCurrentPageIndex(currentPageIndex + 1);
          }}
          style={{ padding: '6px 12px', borderRadius: 100, border: 'none', background: 'var(--teal-light)', color: 'var(--teal-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
          <i className="ti ti-file-plus" style={{ fontSize: 16 }}></i>
          แทรกหน้าเปล่า
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
        draggable={tool === 'pan'}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        style={{ cursor: tool === 'pan' ? 'grab' : 'crosshair' }}
      >
        {/* Background Layer (Paper + PDF) */}
        <Layer>
          <Group x={pageX} y={pageY}>
            {/* Page Paper Background */}
            <Rect width={currentPage.width} height={currentPage.height} fill="white" shadowColor="rgba(0,0,0,0.15)" shadowBlur={20} shadowOffsetY={10} />
            
            {/* PDF Render */}
            {currentPage.src && (
               <PDFPageImage src={currentPage.src} width={currentPage.width} height={currentPage.height} />
            )}
          </Group>
        </Layer>
        
        {/* Drawing Layer (Strokes isolated so eraser only erases strokes) */}
        <Layer>
          <Group x={pageX} y={pageY}>
            {/* Strokes */}
            {currentPage.lines.map((line, i) => {
              const pointPairs = [];
              for(let p = 0; p < line.points.length; p+=2) {
                  pointPairs.push([line.points[p], line.points[p+1]]);
              }
              
              const isHighlighter = line.tool === 'highlighter';
              const isEraser = line.tool === 'eraser';
              
              const strokeOptions = { 
                 size: isEraser ? 24 : isHighlighter ? (line.size || 4) * 3 : (line.size || 4), 
                 thinning: isHighlighter ? 0 : 0.5, // Highlighters usually don't thin
                 smoothing: 0.5, 
                 streamline: 0.5 
              };
              
              const stroke = getStroke(pointPairs, strokeOptions);
              const pathData = getSvgPathFromStroke(stroke);
              
              let fillStr = line.color || '#111827';
              if (isEraser) fillStr = 'black';
              
              // Highlighter uses mix-blend-mode multiply equivalent
              let compositeOp = 'source-over';
              if (isEraser) compositeOp = 'destination-out';
              else if (isHighlighter) compositeOp = 'multiply';
              
              return (
                <Path
                  key={i}
                  data={pathData}
                  fill={fillStr}
                  opacity={isHighlighter ? 0.5 : 1}
                  globalCompositeOperation={compositeOp}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
          </Group>
        </Layer>
        
        {/* Stickers Layer */}
        <Layer>
          <Group x={pageX} y={pageY}>
            {/* Audio Stickers */}
            {currentPage.stickers.map((sticker) => (
               <Group 
                 key={sticker.id}
                 x={sticker.x}
                 y={sticker.y}
                 draggable={tool === 'pan'}
                 onDragEnd={(e) => {
                   const { x, y } = e.target.position();
                   updatePage(currentPageIndex, (page) => {
                     const s = page.stickers.find(st => st.id === sticker.id);
                     if(s) { s.x = x; s.y = y; }
                   });
                 }}
                 onClick={() => playAudioSticker(currentPageIndex, sticker.id, sticker.audioUrl)}
                 onTap={() => playAudioSticker(currentPageIndex, sticker.id, sticker.audioUrl)}
               >
                 <Circle radius={24} fill={sticker.isPlaying ? '#10B981' : '#F59E0B'} shadowColor="rgba(0,0,0,0.2)" shadowBlur={10} shadowOffsetY={4} />
                 <Text text="🎤" fontSize={24} x={-12} y={-12} />
                 {sticker.isPlaying && <Circle radius={24} stroke="#10B981" strokeWidth={4} dash={[10, 5]} />}
               </Group>
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
