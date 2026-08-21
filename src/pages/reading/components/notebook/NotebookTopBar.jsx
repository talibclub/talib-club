import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Cloud, CheckCircle, Zap, Eraser, ChevronLeft, ChevronRight, Download, Bookmark, Settings, FilePlus, Maximize2, Search, Columns, LayoutGrid, ListMusic, Camera, FileText, BookOpen, PanelLeftClose, PanelLeftOpen, Image as ImageIcon, PenTool, Plus, Minus, Check, Wand2 } from 'lucide-react';
import { HW } from './theme.js';
import { RecordingsPanel } from '../AudioRecordings.jsx';

// The notebook's top application bar — page navigation, zoom, save state, and
// the row of panel toggles. Split out of ProNotebook.jsx (which was 5,000 lines
// including this) so the chrome can be restyled without touching canvas logic.
//
// Everything it needs arrives in one `ui` object rather than fifty separate
// props: the notebook keeps all of its state in one component, and threading
// each value through individually made the call site unreadable.
export default function NotebookTopBar({ ui }) {
  const { activeBook, audioPlaying, clearPage, closeOverlays,
    currentPageIndex, deletePage, deleteRecording, exportNotebookPDF,
    fitToScreen, fullView, handleAddPage, isMobile, isSaving, nowPlaying,
    onToggleFullView, pages, playRecording, pressureEnabled,
    readonly, recordings, renameRecording, runExport, saveNotebook, scale,
    setBookSnipInitialPage, setCurrentPageIndex, setPressureEnabled, setScale,
    setShowAi, setShowBookSnip, setShowExport, setShowImgSearch,
    setShowMoreMenu, setShowPageManager, setShowPageSettings,
    setShowRecordings, setShowSearch, setStylusMode, setZoomWriter,
    showBookSnip, showMoreMenu, showPageManager, showRecordings, showSearch,
    startLoadingPDF, stylusMode, toggleBookmark, togglePanel, zoomWriter,
  } = ui;
  const pageTitle = pages[currentPageIndex]?.name || `หน้า ${currentPageIndex + 1}`;
  const notebookTitle = activeBook?.book?.title || 'สมุดโน้ตของฉัน';

  // The header overflows on a narrow pane — the notebook is normally half a
  // split view — and there was no way to reach what fell off the right edge. It
  // had overflow-x: auto but nothing to drive it: no wheel handler, no drag, and
  // `justify-content: space-between`, which on an overflowing flex row pins the
  // content so the ends cannot be scrolled to at all. Vertical wheel now scrolls
  // it sideways, it can be dragged, and a fade marks that there is more.
  const railRef = useRef(null);
  const [moreRight, setMoreRight] = useState(false);
  const [moreLeft, setMoreLeft] = useState(false);
  const syncHints = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setMoreLeft(el.scrollLeft > 4);
    setMoreRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);
  useLayoutEffect(syncHints);
  useEffect(() => {
    window.addEventListener('resize', syncHints);
    return () => window.removeEventListener('resize', syncHints);
  }, [syncHints]);

  const drag = useRef(null);

  return (
    <>
      {/* Huawei Notes Top Navigation Bar (Fixed App Header) */}
       <div style={{ position: 'relative', flexShrink: 0, width: '100%', zIndex: 50 }}>
         {moreLeft && (
           <div style={{ position: 'absolute', left: 0, top: 0, bottom: 1, width: 22, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to right, ${HW.surfaceStrong}, transparent)` }} />
         )}
         {moreRight && (
           <div style={{ position: 'absolute', right: 0, top: 0, bottom: 1, width: 26, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to left, ${HW.surfaceStrong}, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 3 }}>
             <ChevronRight size={14} color={HW.textDim} />
           </div>
         )}
         <div
           ref={railRef}
           className="hide-scroll"
           onScroll={syncHints}
           onWheel={(e) => {
             const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
             if (d !== 0) e.currentTarget.scrollLeft += d;
           }}
           onMouseDown={(e) => { drag.current = { x: e.pageX, left: e.currentTarget.scrollLeft }; }}
           onMouseLeave={() => { drag.current = null; }}
           onMouseUp={() => { drag.current = null; }}
           onMouseMove={(e) => {
             if (!drag.current) return;
             e.currentTarget.scrollLeft = drag.current.left - (e.pageX - drag.current.x);
           }}
           // `safe center` rather than plain `center`: the bar scrolls when the
           // tools do not fit, and a plain `center` on an overflowing flex row
           // pushes the first items off the left edge where nothing can scroll
           // back to them. `safe` centres while there is room and falls back to
           // the start once there is not. It was flex-start, which never lost an
           // icon but left the whole bar hugging the left of a wide screen.
           style={{ height: 58, width: '100%', background: 'linear-gradient(115deg, rgba(255,255,255,0.82), rgba(247,245,241,0.72))', backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur, display: 'flex', alignItems: 'center', justifyContent: readonly ? 'center' : 'safe center', gap: 10, padding: '0 14px', borderBottom: `1px solid ${HW.hairline}`, overflowX: 'auto', overflowY: 'hidden', touchAction: 'pan-x', scrollBehavior: 'auto' }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
               {/* No in-notebook back button: it called window.history.back(), which
                   would kick the user out of the reading room entirely. The reader
                   (and the gallery viewer) already provide their own exit. */}
               {/* Page stepper (Huawei keeps this in the header, not over the canvas) */}
               {!isMobile && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '2px 4px' }}>
                   <button
                     onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                     disabled={currentPageIndex === 0}
                     style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === 0 ? 'default' : 'pointer', opacity: currentPageIndex === 0 ? 0.25 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.text }}>
                     <ChevronLeft size={17} strokeWidth={2} />
                   </button>
                   <span style={{ fontSize: 12.5, fontWeight: 600, color: HW.text, minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                     {currentPageIndex + 1} / {pages.length}
                   </span>
                   <button
                     onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                     disabled={currentPageIndex === pages.length - 1}
                     style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === pages.length - 1 ? 'default' : 'pointer', opacity: currentPageIndex === pages.length - 1 ? 0.25 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.text }}>
                     <ChevronRight size={17} strokeWidth={2} />
                   </button>
                 </div>
               )}
               {!isMobile && (
                 <div title={`${notebookTitle} · ${pageTitle}`} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: 220, padding: '5px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.68)', border: `1px solid ${HW.hairline}`, boxShadow: '0 2px 8px rgba(35,31,27,0.04)' }}>
                   <span style={{ width: 25, height: 25, borderRadius: 9, background: HW.accentSoft, color: HW.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={14} strokeWidth={2} /></span>
                   <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700, color: HW.text }}>{notebookTitle}</span>
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10.5, color: HW.textDim }}>{pageTitle}</span>
                   </span>
                 </div>
               )}
               {/* Zoom cluster — the quick way back when the page has drifted off screen */}
               {!isMobile && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '2px 4px' }}>
                   <button title="ย่อ" onClick={() => setScale(s => Math.max(0.1, s / 1.2))} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.text }}>
                     <Minus size={15} strokeWidth={2} />
                   </button>
                   <button title="พอดีหน้าจอ" onClick={fitToScreen} style={{ minWidth: 46, height: 26, borderRadius: 100, border: 'none', background: 'transparent', cursor: 'pointer', color: HW.text, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                     {Math.round(scale * 100)}%
                   </button>
                   <button title="ขยาย" onClick={() => setScale(s => Math.min(5, s * 1.2))} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.text }}>
                     <Plus size={15} strokeWidth={2} />
                   </button>
                 </div>
               )}
               {isSaving && (
                  <span title="กำลังบันทึก" style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
                     <Cloud size={17} />
                  </span>
               )}
               {!isSaving && !readonly && (
                  <button title="บันทึกแล้ว (คลิกเพื่อบังคับบันทึก)" onClick={() => saveNotebook()} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                     <CheckCircle size={17} />
                  </button>
               )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative' }}>
               {!readonly && (
                 <>
                   {/* Full-view: give the whole browser width to the notebook and
                       hide the PDF panel — for people who attach the PDF inside the
                       notebook and only want to write. A labelled button, not a bare
                       icon: nobody could guess what the panel glyph meant. */}
                   {onToggleFullView && (
                     <button
                       onClick={onToggleFullView}
                       title={fullView ? 'กลับมุมมองคู่กับ PDF' : 'ขยายสมุดโน้ตเต็มจอ ซ่อน PDF ด้านข้าง'}
                       style={{ height: 34, padding: '0 12px', borderRadius: 10, border: 'none', background: fullView ? HW.accentSoft : 'rgba(0,0,0,0.05)', color: fullView ? HW.accent : HW.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Kanit, sans-serif', transition: 'all 0.18s' }}
                     >
                       {fullView ? <PanelLeftOpen size={17} strokeWidth={1.8} /> : <PanelLeftClose size={17} strokeWidth={1.8} />}
                       {fullView ? 'แสดง PDF' : 'โน้ตเต็มจอ'}
                     </button>
                   )}
                   {[
                     { id: 'addpage', icon: FilePlus, title: 'เพิ่มหน้าใหม่', onClick: handleAddPage },
                     // With a book already open, the obvious thing is to bring THAT
                     // pdf in. startLoadingPDF() has always supported it — called
                     // with no url it loads activeBook through the shared byte
                     // cache — but nothing in the UI ever did, so the only
                     // book-aware action on offer was screenshotting it page by
                     // page. "นำเข้า PDF" still opens the file picker for
                     // everything else.
                     ...(activeBook?.book?.fileUrl
                       ? [{ id: 'bookpdf', icon: BookOpen, title: 'ดึงหนังสือเล่มนี้เข้าโน้ต', onClick: () => startLoadingPDF() }]
                       : []),
                     { id: 'pdf', icon: FileText, title: activeBook?.book?.fileUrl ? 'นำเข้า PDF อื่น' : 'นำเข้า PDF', onClick: () => document.getElementById('pdf-upload').click() },
                     // Snip a region of the companion book straight into the note.
                     ...(activeBook?.book?.fileUrl ? [{ id: 'snip', icon: Camera, title: 'แคปเฉพาะบางส่วน', onClick: () => { closeOverlays('snip'); setBookSnipInitialPage(1); setShowBookSnip(true); }, active: showBookSnip }] : []),
                     { id: 'zoomwrite', icon: Maximize2, title: 'ขยายเขียน', onClick: () => setZoomWriter(v => !v), active: zoomWriter },
                     { id: 'recordings', icon: ListMusic, title: 'บันทึกเสียง', onClick: () => togglePanel('recordings', setShowRecordings, showRecordings), active: showRecordings, badge: recordings.length },
                     { id: 'search', icon: Search, title: 'ค้นหา', onClick: () => togglePanel('search', setShowSearch, showSearch), active: showSearch },
                     { id: 'pages', icon: Columns, title: 'จัดการหน้า', onClick: () => togglePanel('pages', setShowPageManager, showPageManager), active: showPageManager },
                     { id: 'more', icon: LayoutGrid, title: 'เพิ่มเติม', onClick: () => togglePanel('more', setShowMoreMenu, showMoreMenu), active: showMoreMenu },
                   ].map(b => (
                     <button
                       key={b.id}
                       onClick={b.onClick}
                       title={b.title}
                       style={{ position: 'relative', width: 36, height: 36, borderRadius: 12, border: `1px solid ${b.active ? HW.accentRing : 'transparent'}`, background: b.active ? HW.accentSoft : 'rgba(255,255,255,0.38)', color: b.active ? HW.accent : HW.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}
                     >
                       <b.icon size={20} strokeWidth={1.6} />
                       {b.badge > 0 && (
                         <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.badge}</span>
                       )}
                     </button>
                   ))}
                 </>
               )}
               {readonly && (
                 <button onClick={() => { closeOverlays('export'); setShowExport(true); }} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: 'var(--teal)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                    <Download size={18} strokeWidth={2} /> ส่งออก
                 </button>
               )}

            </div>
         </div>
       </div>

         {/* Recordings list panel — rendered outside the scrollable header. */}
         {showRecordings && (
           <RecordingsPanel
             recordings={recordings}
             nowPlayingId={nowPlaying?.id}
             audioPlaying={audioPlaying}
             onPlayToggle={playRecording}
             onDelete={deleteRecording}
             onRename={renameRecording}
             onClose={() => setShowRecordings(false)}
           />
         )}

         {/* More menu dropdown. It must live OUTSIDE the header: the header scrolls
             horizontally (overflow-x auto), which silently clips any popup rendered
             inside it — that's why the ⊞ "เพิ่มเติม" button looked dead on tablets. */}
         {showMoreMenu && !readonly && (
             <>
                 <div style={{ position: 'fixed', inset: 0, zIndex: 59 }} onClick={() => setShowMoreMenu(false)} />
                 <div style={{ position: 'absolute', top: 58, right: 12, zIndex: 60, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', padding: 8, borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)', width: 280, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100% - 70px)', overflowY: 'auto' }}>
                    <button onClick={() => { document.getElementById('image-upload').click(); setShowMoreMenu(false); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <ImageIcon size={20} strokeWidth={1.5} color="#4B5563" /> นำเข้ารูปภาพจากเครื่อง
                    </button>
                    <button onClick={() => { closeOverlays('imgSearch'); setShowImgSearch(true); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Search size={20} strokeWidth={1.5} color="#4B5563" /> ค้นหารูป/สติกเกอร์จากเน็ต
                    </button>
                    <button onClick={() => { closeOverlays('ai'); setShowAi(true); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Wand2 size={20} strokeWidth={1.5} color="#4B5563" /> ผู้ช่วย AI · ถาม PDF
                    </button>
                    <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }}></div>
                    <button onClick={() => { closeOverlays('pageSettings'); setShowPageSettings(true); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Settings size={20} strokeWidth={1.5} color="#4B5563" /> เปลี่ยนแม่แบบกระดาษ
                    </button>
                    <button onClick={() => { closeOverlays('export'); setShowExport(true); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Download size={20} strokeWidth={1.5} color="#4B5563" /> ส่งออก (รูป / PDF)
                    </button>
                    <button onClick={toggleBookmark} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Bookmark size={20} strokeWidth={1.5} color={pages[currentPageIndex]?.isBookmarked ? "#F59E0B" : "#4B5563"} fill={pages[currentPageIndex]?.isBookmarked ? "#F59E0B" : "none"} /> {pages[currentPageIndex]?.isBookmarked ? "ลบบุ๊คมาร์ก" : "บุ๊คมาร์กหน้า"}
                    </button>
                    <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }}></div>
                    <button onClick={() => setStylusMode(m => (m === 'pen' ? 'auto' : 'pen'))} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <PenTool size={20} strokeWidth={1.5} color={stylusMode === 'pen' ? HW.accent : '#4B5563'} />
                       <span style={{ flex: 1 }}>เขียนด้วยปากกาเท่านั้น</span>
                       {stylusMode === 'pen' && <Check size={18} strokeWidth={2} color={HW.accent} />}
                    </button>
                    <button onClick={() => setPressureEnabled(v => !v)} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Zap size={20} strokeWidth={1.5} color={pressureEnabled ? HW.accent : '#4B5563'} />
                       <span style={{ flex: 1 }}>ไวต่อแรงกด</span>
                       {pressureEnabled && <Check size={18} strokeWidth={2} color={HW.accent} />}
                    </button>
                    <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }}></div>
                    <button onClick={clearPage} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Eraser size={20} strokeWidth={1.5} color="#4B5563" /> ล้างหน้า
                    </button>
                    <button onClick={deletePage} disabled={pages.length <= 1} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: pages.length <= 1 ? '#D1D5DB' : '#EF4444', cursor: pages.length <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Minus size={20} strokeWidth={1.5} color={pages.length <= 1 ? '#D1D5DB' : '#EF4444'} /> ลบหน้า
                    </button>
                    <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }}></div>
                    <button onClick={() => { exportNotebookPDF(); setShowMoreMenu(false); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <Download size={20} strokeWidth={1.5} color="#4B5563" /> ดาวน์โหลดทั้งเล่ม (PDF)
                    </button>
                    <button onClick={() => { setShowMoreMenu(false); runExport('png', 'current'); }} style={{ padding: '12px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, textAlign: 'left' }}>
                       <ImageIcon size={20} strokeWidth={1.5} color="#4B5563" /> บันทึกรูปหน้านี้ (PNG)
                    </button>
                 </div>
             </>
         )}
    </>
  );
}
