import React from 'react';
import { Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Underline, Strikethrough, Scissors, ChevronRight, PenTool, Square, Circle as CircleIcon, Minus, Triangle, Star, Hexagon, ArrowRight, Spline, Trash2, Hand, Sparkles } from 'lucide-react';
import { HW, STICKY_COLORS, STICKY_STYLES, FONT_OPTIONS, CUTE_PEN_PALETTE, CUTE_HIGHLIGHTER_PALETTE } from './theme.js';
import { StickyStyleThumb } from './canvasElements.jsx';
import ColorPickerPanel from '../ColorPickerPanel';
import EmojiStickerPicker from '../EmojiStickerPicker';
import MindmapStylePicker from './MindmapStylePicker.jsx';
import { LASSO_KINDS, TOOLS_WITH_OPTIONS, DEFAULT_LASSO_FILTER } from './notebookConstants.js';
import { TOOL_GROUPS, WRITE_MODES, ACTION_TOOLS, readWriteMode, WRITE_MODE_KEY } from './notebookTools.js';

// The floating tool capsule at the bottom of the notebook: pen/eraser/shape
// pickers and every tool's options popover.
export default function NotebookToolCapsule({ ui }) {
  const { TOOL_BTN, WRITER_H, applyColorToActiveText, autoShape, clearStrokes,
    closeOverlays, colors, currentPage, currentPageIndex, customColors,
    deleteSelected, editingTextId, eraserSettings, handleToolsScroll,
    insertEmoji, insertIcon, isCoarse, isRecording, laserColor, lassoFilter,
    leftToolbarScroll, penColor, penOpacity, penSize, protractorOn, readonly, rememberCustomColor, rightToolbarScroll, rulerOn, scale, selectedId, setAutoShape, setCroppingImageId,
    connectorHasArrow, setConnectorHasArrow, setEraserSettings, setLaserColor, setLassoFilter, setPenColor,
    setPenOpacity, setPenSize, setProtractorOn, setRulerOn, setShapeType,
    setShowColorPicker, setShowEmojiPicker, setShowToolOptions,
    setStickerStyle, setTextStyle, setTool, shapeType, showColorPicker,
    showEmojiPicker, showLeftScrollHint, showRightScrollHint, showToolOptions,
    sizes, stickerStyle, textStyle, togglePanel, toggleRecording, tool,
    toolsScrollRef, updatePage, zoomWriter,
    undo, redo, canUndo, canRedo,
  } = ui;

  const mindmapStyle = currentPage?.mindmapStyle || 'classic';
  const setMindmapStyle = (s) => updatePage(currentPageIndex, p => { p.mindmapStyle = s; });

  const [writeMode, setWriteMode] = React.useState(readWriteMode);
  const [inkOpen, setInkOpen] = React.useState(false);
  const [showMindmapStylePicker, setShowMindmapStylePicker] = React.useState(false);
  const showInk = WRITE_MODES[writeMode].showInk;

  React.useEffect(() => {
    try { localStorage.setItem(WRITE_MODE_KEY, writeMode); } catch (e) { console.warn(e); }
  }, [writeMode]);

  const visibleTools = React.useMemo(() => {
    const ink = (showInk || inkOpen) ? TOOL_GROUPS.ink : [];
    return [...TOOL_GROUPS.core, ...ink, ...TOOL_GROUPS.extras];
  }, [showInk, inkOpen]);

  const wrapRef = React.useRef(null);
  const [availWidth, setAvailWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const host = wrapRef.current?.parentElement;
    if (!host) return;
    const next = host.getBoundingClientRect().width;
    setAvailWidth((prev) => (Math.abs(prev - next) > 1 ? next : prev));
  });

  React.useEffect(() => {
    const host = wrapRef.current?.parentElement;
    if (!host) return undefined;
    const measure = () => {
      const next = host.getBoundingClientRect().width;
      setAvailWidth((prev) => (Math.abs(prev - next) > 1 ? next : prev));
    };
    window.addEventListener('resize', measure);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(host);
    }
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  const chromeWidth = 220;
  const fullCount = visibleTools.length + (showInk ? 0 : 1);
  const showLabels = availWidth > 0 && availWidth >= fullCount * 58 + chromeWidth;
  const compactModes = availWidth > 0 && availWidth < 560;

  const foldExtras = availWidth > 0 && availWidth < fullCount * 44 + chromeWidth;
  const shownTools = foldExtras
    ? visibleTools.filter((t) => !TOOL_GROUPS.extras.some((e) => e.id === t.id))
    : visibleTools;

  // Active palette depending on highlighter vs normal pens
  const currentPalette = tool === 'highlighter' ? CUTE_HIGHLIGHTER_PALETTE : CUTE_PEN_PALETTE;

  return (
    <>
      {!readonly && (
         <div ref={wrapRef} style={{ position: 'absolute', bottom: zoomWriter ? WRITER_H + 44 + 14 : 20, left: '50%', transform: 'translateX(-50%)', zIndex: 46, maxWidth: 'calc(100% - 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'bottom 0.22s cubic-bezier(0.2,0.8,0.2,1)' }}>
            
            {/* Main Pill Dock */}
            <div
                 style={{
                   display: 'flex', alignItems: 'center', gap: 6,
                   background: 'rgba(255, 255, 255, 0.90)', 
                   backdropFilter: 'saturate(200%) blur(28px)', WebkitBackdropFilter: 'saturate(200%) blur(28px)',
                   padding: '7px 12px', borderRadius: 999,
                   boxShadow: '0 20px 48px rgba(15, 110, 86, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.8) inset', 
                   border: `1px solid rgba(15, 110, 86, 0.10)`,
                   maxWidth: '100%', flexShrink: 0,
                 }}>
                 
                 {/* Cute Mode Switch (Type vs Write) */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, background: 'rgba(15,110,86,0.06)', borderRadius: 999, padding: 3, marginRight: 2 }}>
                   {Object.values(WRITE_MODES).map(m => {
                     const on = writeMode === m.id;
                     return (
                       <button
                         key={m.id}
                         onClick={() => {
                           setWriteMode(m.id);
                           setInkOpen(false);
                           setTool(m.defaultTool);
                           closeOverlays(null);
                         }}
                         title={m.id === 'type' ? 'โหมดพิมพ์ — แตะกระดาษเพื่อพิมพ์ได้เลย' : 'โหมดเขียนมือ — ปากกาและดินสอ'}
                         aria-pressed={on}
                         className="cute-btn-press"
                         style={{
                           border: 'none', cursor: 'pointer', borderRadius: 999,
                           padding: compactModes ? '5px 8px' : showLabels ? '5px 12px' : '5px 9px',
                           fontSize: compactModes ? 11 : 12,
                           background: on ? '#FFFFFF' : 'transparent',
                           color: on ? HW.accent : HW.textDim,
                           fontFamily: 'Kanit, sans-serif', fontWeight: on ? 700 : 500,
                           boxShadow: on ? '0 2px 8px rgba(15,110,86,0.14)' : 'none',
                           display: 'flex', alignItems: 'center', gap: 4,
                         }}
                       >
                         <span>{m.id === 'type' ? '⌨️' : '✏️'}</span>
                         <span>{m.label}</span>
                       </button>
                     );
                   })}
                 </div>

                 {/* Undo / Redo with cute rounded style */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <button onClick={undo} disabled={!canUndo} className="cancel-drag cute-btn-press" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: canUndo ? HW.accent : '#D1D5DB', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="เลิกทำ (Undo)">
                      <Undo2 size={18} strokeWidth={1.8} />
                    </button>
                    <button onClick={redo} disabled={!canRedo} className="cancel-drag cute-btn-press" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: canRedo ? HW.accent : '#D1D5DB', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="ทำซ้ำ (Redo)">
                      <Redo2 size={18} strokeWidth={1.8} />
                    </button>
                 </div>

                 {/* Pan Hand Button */}
                 <button
                   onClick={() => { setTool('pan'); closeOverlays(null); }}
                   title="เลื่อนกระดาน"
                   aria-label="เลื่อนกระดาน"
                   aria-pressed={tool === 'pan'}
                   className="cute-btn-press"
                   style={{ flexShrink: 0, minWidth: showLabels ? 52 : 36, height: 36, padding: showLabels ? '0 8px' : 0, borderRadius: 12, border: 'none', background: tool === 'pan' ? HW.accentSoft : 'transparent', color: tool === 'pan' ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 700, boxShadow: tool === 'pan' ? `inset 0 0 0 1.5px ${HW.accentRing}` : 'none' }}
                 >
                   <Hand size={18} strokeWidth={tool === 'pan' ? 2 : 1.6} />
                   {showLabels && <span>เลื่อน</span>}
                 </button>
                 
                 <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0, margin: '0 4px', borderRadius: 1 }}></div>
                 
                 {/* Scrollable Tools */}
                 <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                   {showLeftScrollHint && (
                     <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                   )}
                   <div
                      ref={(el) => {
                         toolsScrollRef.current = el;
                         if (leftToolbarScroll?.ref) leftToolbarScroll.ref.current = el;
                      }}
                      onScroll={handleToolsScroll}
                      className="hide-scroll"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', flex: 1, minWidth: 0, touchAction: 'pan-x', padding: '2px 0' }}
                      onWheel={(e) => {
                         const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                         if (d !== 0) e.currentTarget.scrollLeft += d;
                      }}
                      onMouseDown={leftToolbarScroll?.onMouseDown}
                      onMouseLeave={leftToolbarScroll?.onMouseLeave}
                      onMouseUp={leftToolbarScroll?.onMouseUp}
                      onMouseMove={leftToolbarScroll?.onMouseMove}
                   >
                  
                  {shownTools.map(t => {
                     const isAction = ACTION_TOOLS.includes(t.id);
                     const isPenLike = ['pen', 'fountain', 'pencil', 'marker', 'highlighter'].includes(t.id);
                     const active = t.id === 'ruler' ? rulerOn
                        : t.id === 'protractor' ? protractorOn
                        : t.id === 'emoji' ? showEmojiPicker
                        : (tool === t.id && !['image', 'mic'].includes(t.id));
                     return (
                       <button
                         key={t.id}
                         title={t.title}
                         aria-label={t.title}
                         aria-pressed={active}
                         className="cute-btn-press"
                         onClick={() => {
                            if (t.id === 'image') { document.getElementById('image-upload').click(); return; }
                            if (t.id === 'pdfWidget') { document.getElementById('pdf-widget-upload').click(); return; }
                            if (t.id === 'mic') { toggleRecording(); return; }
                            if (t.id === 'emoji') { togglePanel('emoji', setShowEmojiPicker, showEmojiPicker); return; }
                            if (t.id === 'ruler') { setRulerOn(v => !v); return; }
                            if (t.id === 'protractor') { setProtractorOn(v => !v); return; }
                            const hasOptions = TOOLS_WITH_OPTIONS.includes(t.id);
                            if (tool === t.id) togglePanel('tools', setShowToolOptions, showToolOptions);
                            else { setTool(t.id); closeOverlays(hasOptions ? 'tools' : null); setShowToolOptions(hasOptions); }
                         }}
                         style={{
                            flexShrink: 0,
                            minWidth: TOOL_BTN,
                            height: showLabels ? TOOL_BTN + 12 : TOOL_BTN,
                            padding: showLabels ? '4px 8px' : 0,
                            borderRadius: 14,
                            border: 'none',
                            background: active ? HW.accentSoft : 'transparent',
                            color: active ? HW.accent : (t.id === 'mic' && isRecording ? '#e11d48' : HW.textDim),
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: showLabels ? 'column' : 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: showLabels ? 2 : 0,
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 10.5,
                            fontWeight: active ? 700 : 500,
                            lineHeight: 1.1,
                            position: 'relative',
                            boxShadow: active ? `0 2px 8px rgba(15,110,86,0.12), inset 0 0 0 1px ${HW.accentRing}` : 'none',
                         }}
                       >
                         <t.icon size={showLabels ? 18 : 19} strokeWidth={active ? 2.1 : 1.7} />
                         
                         {/* Live Color Dot Indicator on Pen Tools */}
                         {isPenLike && (
                           <span
                             style={{
                               position: 'absolute',
                               bottom: showLabels ? 2 : 4,
                               width: active ? 6 : 5,
                               height: active ? 6 : 5,
                               borderRadius: '50%',
                               background: penColor === '#FFFFFF' ? '#D1D5DB' : penColor,
                               boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                               border: '1px solid white',
                               transition: 'all 0.15s',
                             }}
                           />
                         )}

                         {showLabels && <span style={{ whiteSpace: 'nowrap' }}>{t.label}</span>}
                         {t.id === 'mic' && isRecording && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#e11d48', animation: 'pulse 1s infinite' }}></div>}
                       </button>
                     );
                  })}

                  {!showInk && (
                    <button
                      onClick={() => setInkOpen(v => !v)}
                      title="เครื่องมือเขียนด้วยมือ — ปากกา ดินสอ ไฮไลต์"
                      aria-expanded={inkOpen}
                      className="cute-btn-press"
                      style={{
                        flexShrink: 0, minWidth: TOOL_BTN, height: showLabels ? TOOL_BTN + 12 : TOOL_BTN,
                        padding: showLabels ? '4px 8px' : 0, borderRadius: 14, border: 'none',
                        background: inkOpen ? HW.accentSoft : 'transparent',
                        color: inkOpen ? HW.accent : HW.textDim, cursor: 'pointer',
                        display: 'flex', flexDirection: showLabels ? 'column' : 'row',
                        alignItems: 'center', justifyContent: 'center', gap: showLabels ? 2 : 0,
                        fontFamily: 'Kanit, sans-serif', fontSize: 10.5, fontWeight: 600, lineHeight: 1.1,
                      }}
                    >
                      <PenTool size={showLabels ? 18 : 19} strokeWidth={1.7} />
                      {showLabels && <span style={{ whiteSpace: 'nowrap' }}>เขียนมือ</span>}
                    </button>
                  )}

                  {selectedId && (
                     <>
                        <div style={{ width: 1, background: '#E5E7EB', height: 24, flexShrink: 0, margin: '0 6px' }}></div>
                        {currentPage.images?.find(i => i.id === selectedId) && (
                           <button onClick={() => setCroppingImageId(selectedId)} title="ครอบตัด" className="cute-btn-press" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, border: 'none', background: '#E0F2FE', color: '#0369A1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
                              <Scissors size={17} strokeWidth={1.7} />
                           </button>
                        )}
                        <button onClick={deleteSelected} title="ลบทิ้ง" className="cute-btn-press" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, border: 'none', background: '#FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Trash2 size={17} strokeWidth={1.7} />
                        </button>
                     </>
                  )}
               </div>
               {showRightScrollHint && (
                 <div className="pulse-scroll-hint" style={{ position: 'absolute', right: -4, top: 0, bottom: 0, width: 24, background: 'linear-gradient(to left, rgba(255,255,255,1) 40%, rgba(255,255,255,0))', zIndex: 2, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                   <ChevronRight size={14} color="#9CA3AF" />
                 </div>
               )}
             </div>
            </div>

            {/* In-app colour picker */}
            {showColorPicker && (
              <div style={{ order: -2 }} className="cute-pop-in">
                <ColorPickerPanel
                  color={penColor}
                  recentColors={customColors}
                  onChange={(c) => { setPenColor(c); if (tool === 'text') applyColorToActiveText(c); }}
                  onCommit={(c) => { setPenColor(c); if (tool === 'text') applyColorToActiveText(c); rememberCustomColor(c); setShowColorPicker(false); }}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}

            {/* Emoji / sticker picker */}
            {showEmojiPicker && (
              <div style={{ order: -2 }} className="cute-pop-in">
                <EmojiStickerPicker
                  onPick={(e) => insertEmoji(e)}
                  onPickIcon={(iconName) => insertIcon(iconName)}
                  onUpload={() => { document.getElementById('image-upload').click(); setShowEmojiPicker(false); }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}

            {/* Mindmap style picker */}
            {showMindmapStylePicker && (
              <div style={{ order: -2 }} className="cute-pop-in">
                <MindmapStylePicker
                  currentStyle={mindmapStyle}
                  onPick={(s) => setMindmapStyle(s)}
                  onClose={() => setShowMindmapStylePicker(false)}
                />
              </div>
            )}

            {/* Tool Options Popover (Cute Pill Float) */}
            {showToolOptions && TOOLS_WITH_OPTIONS.includes(tool) && (
              <div className="hide-scroll cute-pop-in" style={{ order: -1, display: 'flex', alignItems: 'center', gap: 8, maxWidth: '100%', overflowX: 'auto', background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'saturate(200%) blur(28px)', WebkitBackdropFilter: 'saturate(200%) blur(28px)', borderRadius: 999, boxShadow: '0 16px 40px rgba(15, 110, 86, 0.14), 0 4px 14px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255,255,255,0.9) inset', border: `1px solid rgba(15, 110, 86, 0.12)`, padding: '7px 16px', marginBottom: 4 }} onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }} {...rightToolbarScroll}>
                  {['pen', 'fountain', 'marker', 'pencil', 'highlighter', 'shape'].includes(tool) && (
                     <>
                        {tool === 'shape' && (
                           <>
                             <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {[{ t: 'rect', Icon: Square, title: 'สี่เหลี่ยม' }, { t: 'circle', Icon: CircleIcon, title: 'วงกลม' }, { t: 'triangle', Icon: Triangle, title: 'สามเหลี่ยม' }, { t: 'line', Icon: Minus, title: 'เส้นตรง' }, { t: 'arrow', Icon: ArrowRight, title: 'ลูกศร' }, { t: 'star', Icon: Star, title: 'ดาว' }, { t: 'polygon', Icon: Hexagon, title: 'รูปหลายเหลี่ยม (ปรับมุมได้)' }, { t: 'connector', Icon: Spline, title: 'เส้นเชื่อม (เกาะวัตถุ ทำมายด์แมป)' }].map(({ t, Icon, title }) => (
                                  <button key={t} title={title} onClick={() => setShapeType(t)} className="cute-btn-press" style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: shapeType === t ? HW.accentSoft : 'transparent', color: shapeType === t ? HW.accent : '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} strokeWidth={1.8} />
                                  </button>
                                ))}
                             </div>
                             {shapeType === 'connector' && (
                               <>
                                 <button
                                   onClick={() => setConnectorHasArrow((v) => !v)}
                                   className="cute-btn-press"
                                   title={connectorHasArrow ? 'เส้นเชื่อมมีหัวลูกศร' : 'เส้นเชื่อมธรรมดา'}
                                   style={{ height: 30, padding: '0 10px', borderRadius: 999, border: 'none', background: connectorHasArrow ? HW.accentSoft : 'rgba(0,0,0,0.04)', color: connectorHasArrow ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                 >{connectorHasArrow ? 'มีหัวลูกศร' : 'เส้นธรรมดา'}</button>
                                 <button
                                   onClick={() => setShowMindmapStylePicker(v => !v)}
                                   className="cute-btn-press"
                                   title="เลือกสไตล์มายแมพ"
                                   style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', borderRadius: 999, border: 'none', background: showMindmapStylePicker ? HW.accentSoft : 'rgba(0,0,0,0.04)', color: showMindmapStylePicker ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                 ><Spline size={15} /> สไตล์มายแมพ</button>
                               </>
                             )}
                             <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>
                           </>
                        )}

                        {/* Cute Nib preview */}
                        <span title={`ขนาด ${penSize}px`} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,110,86,0.06)' }}>
                           <span style={{ display: 'block', width: Math.max(5, Math.min(20, penSize * 0.9)), height: Math.max(5, Math.min(20, penSize * 0.9)), borderRadius: '50%', background: penColor === '#FFFFFF' ? '#D1D5DB' : penColor, opacity: tool === 'highlighter' ? Math.min(0.6, penOpacity) : penOpacity, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </span>

                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                        {/* Stroke size presets */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                           {[2, 4, 8, 14].map(s => (
                              <button
                                key={s}
                                onClick={() => setPenSize(s)}
                                title={`${s}px`}
                                className="cute-btn-press"
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: penSize === s ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: penSize === s ? `0 0 0 1.5px ${HW.accentRing}` : 'none' }}
                              >
                                <span style={{ display: 'block', width: Math.min(16, 4 + s * 0.7), height: Math.min(16, 4 + s * 0.7), borderRadius: '50%', background: penSize === s ? HW.accent : HW.textDim }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                        {/* Opacity buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                           {[1, 0.6, 0.3].map(o => (
                              <button
                                key={o}
                                onClick={() => setPenOpacity(o)}
                                title={`ความเข้ม ${Math.round(o * 100)}%`}
                                className="cute-btn-press"
                                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: Math.abs(penOpacity - o) < 0.01 ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: Math.abs(penOpacity - o) < 0.01 ? `0 0 0 1.5px ${HW.accentRing}` : 'none' }}
                              >
                                <span style={{ display: 'block', width: 14, height: 14, borderRadius: 4, background: penColor === '#FFFFFF' ? '#9CA3AF' : penColor, opacity: o, boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.1)` }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                        {/* Cute Pastel Color Swatches */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           {currentPalette.slice(0, 7).map((item) => (
                              <div
                                key={item.value}
                                onClick={() => setPenColor(item.value)}
                                title={item.label}
                                className="cute-swatch-bubble"
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: item.value,
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  boxShadow: penColor === item.value ? '0 2px 8px rgba(0,0,0,0.25), 0 0 0 2.5px white, 0 0 0 4.5px ' + HW.accent : '0 1px 3px rgba(0,0,0,0.15)',
                                  transform: penColor === item.value ? 'scale(1.1)' : 'scale(1)',
                                }}
                              />
                           ))}
                           <button
                             title="เลือกสีเอง (จานสี)"
                             onClick={() => togglePanel('color', setShowColorPicker, showColorPicker, ['tools'])}
                             className="cute-swatch-bubble"
                             style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none', padding: 0, background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', boxShadow: showColorPicker ? `0 0 0 2.5px white, 0 0 0 4.5px ${HW.accent}` : '0 1px 4px rgba(0,0,0,0.2)' }}
                           />
                        </div>

                        {['pen', 'fountain', 'marker', 'pencil'].includes(tool) && (
                           <>
                              <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>
                              <button
                                onClick={() => setAutoShape(v => !v)}
                                title="วาดรูปทรงคร่าว ๆ แล้วปล่อย ระบบจะจัดให้เป็นรูปทรงที่สมบูรณ์"
                                className="cute-btn-press"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, border: 'none', background: autoShape ? HW.accentSoft : 'rgba(0,0,0,0.035)', color: autoShape ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                              >
                                <Sparkles size={14} /> จัดรูปทรงอัตโนมัติ
                              </button>
                           </>
                        )}
                     </>
                  )}

                  {tool === 'text' && !editingTextId && (() => {
                     const applyToActive = (patch) => {
                        const id = editingTextId || selectedId;
                        if (!id) return;
                        updatePage(currentPageIndex, (page) => {
                           page.texts = (page.texts || []).map(t => (t.id === id ? { ...t, ...patch } : t));
                        });
                     };
                     const setStyle = (patch, textPatch) => {
                        setTextStyle(s => ({ ...s, ...patch }));
                        applyToActive(textPatch);
                     };
                     return (
                       <>
                          <select
                            value={textStyle.fontFamily}
                            onChange={(e) => setStyle({ fontFamily: e.target.value }, { fontFamily: e.target.value })}
                            style={{ flexShrink: 0, height: 30, borderRadius: 999, border: `1px solid ${HW.hairline}`, background: 'white', color: HW.text, fontSize: 12, padding: '0 10px', cursor: 'pointer', fontFamily: textStyle.fontFamily, outline: 'none' }}
                          >
                            {FONT_OPTIONS.map(f => (
                              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                            ))}
                          </select>

                          <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[16, 20, 24, 32, 44, 60].map(sz => (
                                <button
                                  key={sz}
                                  onClick={() => setStyle({ fontSize: sz }, { size: sz })}
                                  className="cute-btn-press"
                                  style={{ minWidth: 28, height: 28, padding: '0 5px', borderRadius: 8, border: 'none', background: textStyle.fontSize === sz ? HW.accentSoft : 'transparent', color: textStyle.fontSize === sz ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {sz}
                                </button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             <button
                               onClick={() => setStyle({ bold: !textStyle.bold }, { bold: !textStyle.bold })}
                               title="ตัวหนา"
                               className="cute-btn-press"
                               style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: textStyle.bold ? HW.accentSoft : 'transparent', color: textStyle.bold ? HW.accent : HW.textDim, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                             >B</button>
                             <button
                               onClick={() => setStyle({ italic: !textStyle.italic }, { italic: !textStyle.italic })}
                               title="ตัวเอียง"
                               className="cute-btn-press"
                               style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: textStyle.italic ? HW.accentSoft : 'transparent', color: textStyle.italic ? HW.accent : HW.textDim, fontSize: 13, fontStyle: 'italic', fontWeight: 700, cursor: 'pointer' }}
                             >I</button>
                             <button
                               onClick={() => setStyle({ underline: !textStyle.underline }, { underline: !textStyle.underline })}
                               title="ขีดเส้นใต้"
                               className="cute-btn-press"
                               style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: textStyle.underline ? HW.accentSoft : 'transparent', color: textStyle.underline ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                             ><Underline size={15} strokeWidth={2} /></button>
                             <button
                               onClick={() => setStyle({ strikethrough: !textStyle.strikethrough }, { strikethrough: !textStyle.strikethrough })}
                               title="ขีดฆ่า"
                               className="cute-btn-press"
                               style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: textStyle.strikethrough ? HW.accentSoft : 'transparent', color: textStyle.strikethrough ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                             ><Strikethrough size={15} strokeWidth={2} /></button>
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                          {/* Alignment */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[{ a: 'left', Icon: AlignLeft, label: 'ชิดซ้าย' }, { a: 'center', Icon: AlignCenter, label: 'กึ่งกลาง' }, { a: 'right', Icon: AlignRight, label: 'ชิดขวา' }].map(({ a, Icon, label }) => (
                                <button
                                  key={a}
                                  onClick={() => setStyle({ align: a }, { align: a })}
                                  title={label}
                                  className="cute-btn-press"
                                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: (textStyle.align || 'left') === a ? HW.accentSoft : 'transparent', color: (textStyle.align || 'left') === a ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><Icon size={15} strokeWidth={2} /></button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                          {/* Lists */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[{ l: 'bullet', Icon: List, label: 'รายการจุด' }, { l: 'number', Icon: ListOrdered, label: 'รายการตัวเลข' }].map(({ l, Icon, label }) => (
                                <button
                                  key={l}
                                  onClick={() => { const next = textStyle.list === l ? 'none' : l; setStyle({ list: next }, { list: next }); }}
                                  title={label}
                                  className="cute-btn-press"
                                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: textStyle.list === l ? HW.accentSoft : 'transparent', color: textStyle.list === l ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><Icon size={15} strokeWidth={2} /></button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                             {CUTE_PEN_PALETTE.slice(0, 6).map(c => (
                                <div
                                  key={c.value}
                                  onClick={() => { setPenColor(c.value); applyToActive({ color: c.value }); }}
                                  title={c.label}
                                  className="cute-swatch-bubble"
                                  style={{ width: 22, height: 22, borderRadius: '50%', background: c.value, cursor: 'pointer', flexShrink: 0, boxShadow: penColor === c.value ? `0 0 0 2px white, 0 0 0 4px ${HW.accent}` : '0 1px 3px rgba(0,0,0,0.15)' }}
                                />
                             ))}
                             <button
                               title="เลือกสีเอง"
                               onClick={() => togglePanel('color', setShowColorPicker, showColorPicker, ['tools'])}
                               className="cute-swatch-bubble"
                               style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none', padding: 0, background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', boxShadow: showColorPicker ? `0 0 0 2px white, 0 0 0 4px ${HW.accent}` : '0 1px 3px rgba(0,0,0,0.15)' }}
                             />
                          </div>
                       </>
                     );
                  })()}

                  {tool === 'lasso' && (
                     <>
                        <span style={{ fontSize: 12, fontWeight: 700, color: HW.text, flexShrink: 0, whiteSpace: 'nowrap' }}>เลือกเฉพาะ:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           {LASSO_KINDS.map(({ key, label }) => {
                              const on = lassoFilter[key] !== false;
                              return (
                                 <button
                                   key={key}
                                   onClick={() => setLassoFilter(f => ({ ...f, [key]: !on }))}
                                   title={on ? `กำลังเลือก${label}` : `ข้าม${label}`}
                                   className="cute-btn-press"
                                   style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, border: 'none', background: on ? HW.accentSoft : 'rgba(0,0,0,0.04)', color: on ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                                 >
                                   <span style={{ width: 24, height: 14, borderRadius: 8, background: on ? HW.accent : '#D1D5DB', position: 'relative', flexShrink: 0, transition: 'background 0.18s' }}>
                                     <span style={{ position: 'absolute', top: 1, left: on ? 11 : 1, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} />
                                   </span>
                                   {label}
                                 </button>
                              );
                           })}
                        </div>
                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>
                        <button
                          onClick={() => setLassoFilter({ ...DEFAULT_LASSO_FILTER })}
                          className="cute-btn-press"
                          style={{ height: 30, padding: '0 12px', borderRadius: 999, border: 'none', background: 'transparent', color: HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                        >เลือกทั้งหมด</button>
                     </>
                  )}

                  {tool === 'sticker' && (
                     <>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {STICKY_COLORS.map(c => (
                             <div key={c} onClick={() => setPenColor(c)} className="cute-swatch-bubble" style={{ width: 22, height: 22, borderRadius: 6, background: c, cursor: 'pointer', boxShadow: penColor === c ? `0 0 0 2px white, 0 0 0 4px ${HW.accent}` : '0 2px 4px rgba(0,0,0,0.1)' }} />
                          ))}
                        </div>
                        <div style={{ width: 1, background: '#E5E7EB', height: 20, flexShrink: 0 }}></div>
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                           {STICKY_STYLES.map(s => (
                              <button
                                key={s.id}
                                onClick={() => setStickerStyle(s.id)}
                                title={s.label}
                                className="cute-btn-press"
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 6px', background: stickerStyle === s.id ? '#E0F2FE' : '#F3F4F6', borderRadius: 10, border: stickerStyle === s.id ? '1.5px solid #0EA5E9' : '1.5px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                 <StickyStyleThumb id={s.id} color={STICKY_COLORS.includes(penColor) ? penColor : '#FEF3C7'} />
                                 <span style={{ fontSize: 9.5, fontWeight: 600, color: stickerStyle === s.id ? '#0369A1' : '#6B7280', lineHeight: 1 }}>{s.label}</span>
                              </button>
                           ))}
                        </div>
                     </>
                  )}

                  {tool === 'eraser' && (
                     <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                           {[{ m: 'stroke', label: 'ลบทั้งเส้น' }, { m: 'area', label: 'ลบบางส่วน' }].map(({ m, label }) => (
                              <button
                                key={m}
                                onClick={() => setEraserSettings(s => ({ ...s, mode: m }))}
                                className="cute-btn-press"
                                style={{ padding: '5px 12px', borderRadius: 999, border: 'none', background: eraserSettings.mode === m ? HW.accentSoft : 'transparent', color: eraserSettings.mode === m ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                              >
                                {label}
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                           {[12, 24, 40, 64].map(sz => (
                              <button
                                key={sz}
                                onClick={() => setEraserSettings(s => ({ ...s, size: sz }))}
                                title={`${sz}px`}
                                className="cute-btn-press"
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: eraserSettings.size === sz ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <span style={{ display: 'block', width: 4 + sz * 0.22, height: 4 + sz * 0.22, borderRadius: '50%', border: `1.8px solid ${eraserSettings.size === sz ? HW.accent : HW.textDim}` }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 20, flexShrink: 0 }}></div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: HW.textDim, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                           <input type="checkbox" checked={eraserSettings.eraseObjects} onChange={() => setEraserSettings(s => ({ ...s, eraseObjects: !s.eraseObjects }))} />
                           ลบวัตถุด้วย
                        </label>
                        <button onClick={clearStrokes} className="cute-btn-press" style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid rgba(239,68,68,0.25)`, background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: 11.5, cursor: 'pointer', flexShrink: 0 }}>ล้างเส้นทั้งหมด</button>
                     </div>
                  )}

                  {tool === 'laser' && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                           {sizes.map(s => (
                              <button key={s} onClick={() => setPenSize(s)} title={`${s}px`} className="cute-btn-press" style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: penSize === s ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <span style={{ display: 'block', width: Math.min(18, 4 + s * 0.7), height: Math.min(18, 4 + s * 0.7), borderRadius: '50%', background: penSize === s ? HW.accent : HW.textDim }} />
                              </button>
                           ))}
                        </div>
                        <div style={{ width: 1, background: HW.hairline, height: 20 }}></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: HW.textDim, fontFamily: 'Kanit, sans-serif', flexShrink: 0 }}>สีเลเซอร์:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           {['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#FFFFFF'].map(c => (
                              <div
                                key={c}
                                onClick={() => setLaserColor(c)}
                                title={c}
                                className="cute-swatch-bubble"
                                style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0, boxShadow: laserColor === c ? `0 0 0 2px white, 0 0 0 4px ${HW.accent}` : '0 1px 3px rgba(0,0,0,0.15)' }}
                              />
                           ))}
                        </div>
                     </div>
                  )}
              </div>
            )}
         </div>
      )}
    </>
  );
}

