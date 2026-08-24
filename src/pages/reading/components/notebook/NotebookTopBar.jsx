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
  const [nbPageInput, setNbPageInput] = useState(String(currentPageIndex + 1));
  useEffect(() => {
    setNbPageInput(String(currentPageIndex + 1));
  }, [currentPageIndex]);

  const goToNbPage = (n) => {
    const parsed = parseInt(n, 10);
    if (isNaN(parsed)) {
      setNbPageInput(String(currentPageIndex + 1));
      return;
    }
    const clamped = Math.max(1, Math.min(pages.length || 1, parsed));
    setNbPageInput(String(clamped));
    setCurrentPageIndex(clamped - 1);
  };

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
           style={{ height: 52, width: '100%', background: 'linear-gradient(115deg, rgba(255,255,255,0.92), rgba(247,245,241,0.85))', backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur, display: 'flex', alignItems: 'center', justifyContent: readonly ? 'center' : 'safe center', gap: 8, padding: '0 12px', borderBottom: `1px solid ${HW.hairline}`, overflowX: 'auto', overflowY: 'hidden', touchAction: 'pan-x', scrollBehavior: 'auto' }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
               {/* Page stepper */}
               {!isMobile && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(15,110,86,0.06)', borderRadius: 999, padding: '2px 5px' }}>
                   <button
                     onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                     disabled={currentPageIndex === 0}
                     className="cute-btn-press"
                     style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === 0 ? 'default' : 'pointer', opacity: currentPageIndex === 0 ? 0.25 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.accent }}>
                     <ChevronLeft size={16} strokeWidth={2.2} />
                   </button>
                   <input
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     value={nbPageInput}
                     onChange={(e) => setNbPageInput(e.target.value)}
                     onFocus={(e) => e.target.select()}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         goToNbPage(nbPageInput);
                         e.currentTarget.blur();
                       }
                     }}
                     onBlur={() => goToNbPage(nbPageInput)}
                     style={{
                       width: `${Math.max(26, String(pages.length || 1).length * 8 + 12)}px`,
                       height: 22,
                       padding: '0 2px',
                       borderRadius: 999,
                       border: '1px solid rgba(15,110,86,0.2)',
                       background: 'white',
                       textAlign: 'center',
                       fontSize: 12,
                       fontWeight: 700,
                       color: HW.accent,
                       outline: 'none',
                       fontVariantNumeric: 'tabular-nums',
                       fontFamily: 'Kanit, sans-serif'
                     }}
                     title="พิมพ์เลขหน้าแล้วกด Enter เพื่อไปยังหน้านั้น"
                     aria-label="พิมพ์เลขหน้าที่ต้องการ"
                   />
                   <span style={{ fontSize: 12, fontWeight: 700, color: HW.textDim, paddingRight: 4, fontVariantNumeric: 'tabular-nums' }}>
                     / {pages.length}
                   </span>
                   <button
                     onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                     disabled={currentPageIndex === pages.length - 1}
                     className="cute-btn-press"
                     style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', cursor: currentPageIndex === pages.length - 1 ? 'default' : 'pointer', opacity: currentPageIndex === pages.length - 1 ? 0.25 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.accent }}>
                     <ChevronRight size={16} strokeWidth={2.2} />
                   </button>
                 </div>
               )}
               {!isMobile && (
                 <div title={`${notebookTitle} · ${pageTitle}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: fullView ? 240 : 140, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', border: `1px solid rgba(15,110,86,0.12)`, boxShadow: '0 2px 6px rgba(15,110,86,0.06)' }}>
                   <span style={{ width: 22, height: 22, borderRadius: '50%', background: HW.accentSoft, color: HW.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={13} strokeWidth={2} /></span>
                   <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5, fontWeight: 700, color: HW.text }}>{notebookTitle}</span>
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10, color: HW.textDim }}>{pageTitle}</span>
                   </span>
                 </div>
               )}
               {/* Zoom cluster */}
               {!isMobile && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(15,110,86,0.06)', borderRadius: 999, padding: '2px 5px' }}>
                   <button title="ย่อขนาด (Ctrl -)" onClick={() => setScale(s => Math.max(0.1, s / 1.2))} className="cute-btn-press" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.accent }}>
                     <Minus size={14} strokeWidth={2.2} />
                   </button>
                   <button title="พอดีหน้าจอ (Ctrl 0)" onClick={fitToScreen} className="cute-btn-press" style={{ minWidth: 42, height: 24, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', color: HW.accent, fontSize: 11.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                     {Math.round(scale * 100)}%
                   </button>
                   <button title="ขยายขนาด (Ctrl +)" onClick={() => setScale(s => Math.min(5, s * 1.2))} className="cute-btn-press" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HW.accent }}>
                     <Plus size={14} strokeWidth={2.2} />
                   </button>
                 </div>
               )}
               {isSaving && (
                  <span title="กำลังบันทึก" style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
                     <Cloud size={16} />
                  </span>
               )}
               {!isSaving && !readonly && (
                  <button title="บันทึกแล้ว (คลิกเพื่อบังคับบันทึก)" onClick={() => saveNotebook()} className="cute-btn-press" style={{ background: 'transparent', border: 'none', color: HW.accent, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                     <CheckCircle size={17} />
                  </button>
               )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, position: 'relative' }}>
               {!readonly && (
                 <>
                   {onToggleFullView && (
                     <button
                       onClick={onToggleFullView}
                       title={fullView ? 'กลับมุมมองคู่กับ PDF' : 'ขยายสมุดโน้ตเต็มจอ ซ่อน PDF ด้านข้าง'}
                       className="cute-btn-press"
                       style={{ height: 32, padding: '0 12px', borderRadius: 999, border: 'none', background: fullView ? HW.accentSoft : 'rgba(15,110,86,0.06)', color: HW.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Kanit, sans-serif' }}
                     >
                       {fullView ? <PanelLeftOpen size={15} strokeWidth={2} /> : <PanelLeftClose size={15} strokeWidth={2} />}
                       {fullView ? 'แสดง PDF' : 'โน้ตเต็มจอ'}
                     </button>
                   )}
                   {[
                     { id: 'addpage', icon: FilePlus, title: 'เพิ่มหน้าใหม่', onClick: handleAddPage },
                     ...(activeBook?.book?.fileUrl
                       ? [{ id: 'bookpdf', icon: BookOpen, title: 'ดึงหนังสือเล่มนี้เข้าโน้ต', onClick: () => startLoadingPDF() }]
                       : []),
                     { id: 'pdf', icon: FileText, title: activeBook?.book?.fileUrl ? 'นำเข้า PDF อื่น' : 'นำเข้า PDF', onClick: () => document.getElementById('pdf-upload').click() },
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
                       className="cute-btn-press"
                       style={{ position: 'relative', width: 34, height: 34, borderRadius: 12, border: `1px solid ${b.active ? HW.accentRing : 'rgba(15,110,86,0.1)'}`, background: b.active ? HW.accentSoft : 'rgba(255,255,255,0.7)', color: b.active ? HW.accent : HW.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: b.active ? '0 2px 6px rgba(15,110,86,0.15)' : 'none' }}
                     >
                       <b.icon size={17} strokeWidth={b.active ? 2.1 : 1.7} />
                       {b.badge > 0 && (
                         <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999, background: '#EF4444', color: 'white', fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{b.badge}</span>
                       )}
                     </button>
                   ))}
                 </>
               )}
               {readonly && (
                 <button onClick={() => { closeOverlays('export'); setShowExport(true); }} className="cute-btn-press" style={{ padding: '8px 18px', borderRadius: 999, border: 'none', background: 'var(--teal)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, boxShadow: '0 4px 12px rgba(15,110,86,0.25)' }}>
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
                 <div className="cute-pop-in" style={{ position: 'absolute', top: 58, right: 12, zIndex: 60, background: 'rgba(255,255,255,0.96)', backdropFilter: 'saturate(200%) blur(26px)', padding: 10, borderRadius: 20, boxShadow: '0 16px 48px rgba(15,110,86,0.16), 0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(15,110,86,0.12)', width: 280, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100% - 70px)', overflowY: 'auto' }}>
                    <button onClick={() => { document.getElementById('image-upload').click(); setShowMoreMenu(false); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <ImageIcon size={18} strokeWidth={1.8} color={HW.accent} /> นำเข้ารูปภาพจากเครื่อง
                    </button>
                    <button onClick={() => { closeOverlays('imgSearch'); setShowImgSearch(true); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Search size={18} strokeWidth={1.8} color={HW.accent} /> ค้นหารูป/สติกเกอร์จากเน็ต
                    </button>
                    <button onClick={() => { closeOverlays('ai'); setShowAi(true); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Wand2 size={18} strokeWidth={1.8} color={HW.accent} /> ผู้ช่วย AI · ถาม PDF
                    </button>
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
                    <button onClick={() => { closeOverlays('pageSettings'); setShowPageSettings(true); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Settings size={18} strokeWidth={1.8} color="#4B5563" /> เปลี่ยนแม่แบบกระดาษ
                    </button>
                    <button onClick={() => { closeOverlays('export'); setShowExport(true); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Download size={18} strokeWidth={1.8} color="#4B5563" /> ส่งออก (รูป / PDF)
                    </button>
                    <button onClick={toggleBookmark} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Bookmark size={18} strokeWidth={1.8} color={pages[currentPageIndex]?.isBookmarked ? "#F59E0B" : "#4B5563"} fill={pages[currentPageIndex]?.isBookmarked ? "#F59E0B" : "none"} /> {pages[currentPageIndex]?.isBookmarked ? "ลบบุ๊คมาร์ก" : "บุ๊คมาร์กหน้า"}
                    </button>
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
                    <button onClick={() => setStylusMode(m => (m === 'pen' ? 'auto' : 'pen'))} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <PenTool size={18} strokeWidth={1.8} color={stylusMode === 'pen' ? HW.accent : '#4B5563'} />
                       <span style={{ flex: 1 }}>เขียนด้วยปากกาเท่านั้น</span>
                       {stylusMode === 'pen' && <Check size={18} strokeWidth={2.2} color={HW.accent} />}
                    </button>
                    <button onClick={() => setPressureEnabled(v => !v)} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Zap size={18} strokeWidth={1.8} color={pressureEnabled ? HW.accent : '#4B5563'} />
                       <span style={{ flex: 1 }}>ไวต่อแรงกด</span>
                       {pressureEnabled && <Check size={18} strokeWidth={2.2} color={HW.accent} />}
                    </button>
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
                    <button onClick={clearPage} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Eraser size={18} strokeWidth={1.8} color="#4B5563" /> ล้างหน้า
                    </button>
                    <button onClick={deletePage} disabled={pages.length <= 1} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: pages.length <= 1 ? '#D1D5DB' : '#EF4444', cursor: pages.length <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Minus size={18} strokeWidth={1.8} color={pages.length <= 1 ? '#D1D5DB' : '#EF4444'} /> ลบหน้า
                    </button>
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
                    <button onClick={() => { exportNotebookPDF(); setShowMoreMenu(false); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <Download size={18} strokeWidth={1.8} color={HW.accent} /> ดาวน์โหลดทั้งเล่ม (PDF)
                    </button>
                    <button onClick={() => { setShowMoreMenu(false); runExport('png', 'current'); }} className="cute-btn-press" style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, textAlign: 'left', fontWeight: 500 }}>
                       <ImageIcon size={18} strokeWidth={1.8} color={HW.accent} /> บันทึกรูปหน้านี้ (PNG)
                    </button>
                 </div>
             </>
         )}
    </>
  );
}
