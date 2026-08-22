import React from 'react';
import { Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Underline, Strikethrough, Scissors, ChevronRight, PenTool, Square, Circle as CircleIcon, Minus, Triangle, Star, Hexagon, ArrowRight, Spline, Trash2, Hand } from 'lucide-react';
import { HW, STICKY_COLORS, STICKY_STYLES, FONT_OPTIONS } from './theme.js';
import { StickyStyleThumb } from './canvasElements.jsx';
import ColorPickerPanel from '../ColorPickerPanel';
import EmojiStickerPicker from '../EmojiStickerPicker';
import { LASSO_KINDS, TOOLS_WITH_OPTIONS, DEFAULT_LASSO_FILTER } from './notebookConstants.js';
import { TOOL_GROUPS, WRITE_MODES, ACTION_TOOLS, readWriteMode, WRITE_MODE_KEY } from './notebookTools.js';

// The floating tool capsule at the bottom of the notebook: pen/eraser/shape
// pickers and every tool's options popover. This was ~450 lines inside
// ProNotebook.jsx; it is the part most likely to be restyled, so it lives on its
// own. Takes the shared `ui` bag — see NotebookTopBar for why.
export default function NotebookToolCapsule({ ui }) {
  const { TOOL_BTN, WRITER_H, applyColorToActiveText, autoShape, clearStrokes,
    closeOverlays, colors, currentPage, currentPageIndex, customColors,
    deleteSelected, editingTextId, eraserSettings, handleToolsScroll,
    insertEmoji, isCoarse, isRecording, laserColor, lassoFilter,
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

  // Typing vs handwriting. Remembered per person, because which one you are is
  // not something you switch between minute to minute.
  const [writeMode, setWriteMode] = React.useState(readWriteMode);
  const [inkOpen, setInkOpen] = React.useState(false);
  const showInk = WRITE_MODES[writeMode].showInk;

  React.useEffect(() => {
    try { localStorage.setItem(WRITE_MODE_KEY, writeMode); } catch (e) { console.warn(e); }
  }, [writeMode]);

  const visibleTools = React.useMemo(() => {
    const ink = (showInk || inkOpen) ? TOOL_GROUPS.ink : [];
    return [...TOOL_GROUPS.core, ...ink, ...TOOL_GROUPS.extras];
  }, [showInk, inkOpen]);

  // Labels are what make an icon row readable to someone who does not already
  // know the tools, so they are shown wherever there is room for them — and
  // dropped when there is not, because a row that runs off the edge is worse
  // than one without words.
  //
  // Measured from the capsule's own container, NOT window.innerWidth. The
  // notebook usually sits in a split view beside the PDF, so the window can be
  // 1400px wide while this strip only has 700 to work with; keying off the
  // window made the labels appear and then overflow the pane.
  const wrapRef = React.useRef(null);
  const [availWidth, setAvailWidth] = React.useState(0);

  // Measured after every commit, not only from a ResizeObserver. The observer
  // is kept because it catches a pane resized by something outside React (the
  // reader's split-view divider), but it cannot be the only source: its
  // callbacks are delivered as part of the frame lifecycle, so a tab that is
  // not compositing never receives them. Re-measuring on commit costs one
  // getBoundingClientRect and is guarded against re-render loops by only
  // setting state when the number actually moves.
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

  // A labelled button is ~56px, a bare icon ~40. Plus the mode switch, undo/redo
  // and padding. Below the labelled threshold the row still scrolls, but it no
  // longer promises more than it can show.
  const chromeWidth = 220;
  const fullCount = visibleTools.length + (showInk ? 0 : 1);
  const showLabels = availWidth > 0 && availWidth >= fullCount * 58 + chromeWidth;
  const compactModes = availWidth > 0 && availWidth < 560;

  // On a genuinely narrow pane even bare icons run past the edge, so the
  // occasional tools (สติกเกอร์ / เลเซอร์ / อัดเสียง) fold away behind the
  // existing "เพิ่มเติม" panel rather than being pushed off-screen where nobody
  // scrolls to find them.
  const foldExtras = availWidth > 0 && availWidth < fullCount * 44 + chromeWidth;
  const shownTools = foldExtras
    ? visibleTools.filter((t) => !TOOL_GROUPS.extras.some((e) => e.id === t.id))
    : visibleTools;

  return (
    <>
      {/* Huawei Notes floating tool capsule (bottom-centered, overlays the canvas) */}
      {!readonly && (
         <div ref={wrapRef} style={{ position: 'absolute', bottom: zoomWriter ? WRITER_H + 44 + 14 : 20, left: '50%', transform: 'translateX(-50%)', zIndex: 46, maxWidth: 'calc(100% - 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'bottom 0.22s cubic-bezier(0.2,0.8,0.2,1)' }}>
            <div
                 style={{
                   display: 'flex', alignItems: 'center', gap: 6,
                   background: 'rgba(255, 255, 255, 0.85)', 
                   backdropFilter: 'saturate(200%) blur(24px)', WebkitBackdropFilter: 'saturate(200%) blur(24px)',
                   padding: '8px 12px', borderRadius: 32,
                   boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0,0,0,0.1)', 
                   border: `1px solid rgba(255, 255, 255, 0.5)`,
                   maxWidth: '100%', flexShrink: 0,
                 }}>
                 {/* Typing vs handwriting. Sits first because it changes what
                     the rest of the row contains. */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, background: 'rgba(35,31,27,0.06)', borderRadius: 999, padding: 3, marginRight: 3 }}>
                   {Object.values(WRITE_MODES).map(m => {
                     const on = writeMode === m.id;
                     return (
                       <button
                         key={m.id}
                         onClick={() => {
                           setWriteMode(m.id);
                           setInkOpen(false);
                           // Land on the tool the mode is named after, so the
                           // switch is immediately useful rather than a setting.
                           setTool(m.defaultTool);
                           closeOverlays(null);
                         }}
                         title={m.id === 'type' ? 'โหมดพิมพ์ — แตะกระดาษเพื่อพิมพ์ได้เลย' : 'โหมดเขียนมือ — ปากกาและดินสอ'}
                         aria-pressed={on}
                         style={{
                           border: 'none', cursor: 'pointer', borderRadius: 999,
                           padding: compactModes ? '5px 7px' : showLabels ? '5px 12px' : '5px 9px',
                           fontSize: compactModes ? 11 : 12,
                           background: on ? '#fff' : 'transparent',
                           color: on ? HW.accent : HW.textDim,
                           fontFamily: 'Kanit, sans-serif', fontWeight: on ? 600 : 500,
                           boxShadow: on ? '0 2px 6px rgba(35,31,27,0.13)' : 'none',
                           transition: 'all 0.16s',
                         }}
                       >
                         {m.label}
                       </button>
                     );
                   })}
                 </div>

                 {/* FIXED Undo / Redo */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <button onClick={undo} disabled={!canUndo} className="cancel-drag" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: canUndo ? '#4B5563' : '#D1D5DB', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Undo2 size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={redo} disabled={!canRedo} className="cancel-drag" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', color: canRedo ? '#4B5563' : '#D1D5DB', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Redo2 size={20} strokeWidth={1.5} />
                    </button>
                 </div>

                 {/* Always keep a way back to navigation visible. It should not
                     disappear into the scrolling list after someone finishes a mark. */}
                 <button
                   onClick={() => { setTool('pan'); closeOverlays(null); }}
                   title="เลื่อนกระดาน"
                   aria-label="เลื่อนกระดาน"
                   aria-pressed={tool === 'pan'}
                   style={{ flexShrink: 0, minWidth: showLabels ? 52 : 36, height: 36, padding: showLabels ? '0 8px' : 0, borderRadius: 10, border: 'none', background: tool === 'pan' ? HW.accentSoft : 'transparent', color: tool === 'pan' ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Kanit, sans-serif', fontSize: 11, fontWeight: 600, boxShadow: tool === 'pan' ? `inset 0 0 0 1px ${HW.accentRing}` : 'none' }}
                 >
                   <Hand size={18} strokeWidth={tool === 'pan' ? 2 : 1.6} />
                   {showLabels && <span>เลื่อน</span>}
                 </button>
                 
                 <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0, margin: '0 5px', borderRadius: 1 }}></div>
                 
                 {/* Tools (Scrollable with visual hint) */}
                 <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                   {showLeftScrollHint && (
                     <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                   )}
                   <div
                      // useDragScroll returns a `ref` of its own, and spreading it
                      // last quietly overwrote toolsScrollRef — so the ref the
                      // scroll-hint logic reads was never attached, and
                      // handleToolsScroll returned early every time. Both refs are
                      // set explicitly now, and only the handlers are spread.
                      ref={(el) => {
                         toolsScrollRef.current = el;
                         if (leftToolbarScroll?.ref) leftToolbarScroll.ref.current = el;
                      }}
                      onScroll={handleToolsScroll}
                      className="hide-scroll"
                      style={{ display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', flex: 1, minWidth: 0, touchAction: 'pan-x' }}
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
                         onClick={() => {
                            if (t.id === 'image') { document.getElementById('image-upload').click(); return; }
                            if (t.id === 'pdfWidget') { document.getElementById('pdf-widget-upload').click(); return; }
                            if (t.id === 'mic') { toggleRecording(); return; }
                            if (t.id === 'emoji') { togglePanel('emoji', setShowEmojiPicker, showEmojiPicker); return; }
                            if (t.id === 'ruler') { setRulerOn(v => !v); return; }
                            if (t.id === 'protractor') { setProtractorOn(v => !v); return; }
                            // One tap does it all: selecting a tool also opens its
                            // options right away (nobody discovers a second tap), and
                            // the popover tucks itself away as soon as drawing starts.
                            // Tapping the active tool toggles the popover.
                            const hasOptions = TOOLS_WITH_OPTIONS.includes(t.id);
                            if (tool === t.id) togglePanel('tools', setShowToolOptions, showToolOptions);
                            else { setTool(t.id); closeOverlays(hasOptions ? 'tools' : null); setShowToolOptions(hasOptions); }
                         }}
                         style={{
                            flexShrink: 0,
                            minWidth: TOOL_BTN,
                            height: showLabels ? TOOL_BTN + 14 : TOOL_BTN,
                            padding: showLabels ? '4px 10px' : 0,
                            borderRadius: 14,
                            border: 'none',
                            background: active ? HW.accentSoft : 'transparent',
                            color: active ? HW.accent : (t.id === 'mic' && isRecording ? '#c0392b' : HW.textDim),
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: showLabels ? 'column' : 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: showLabels ? 2 : 0,
                            fontFamily: 'Kanit, sans-serif',
                            fontSize: 10.5,
                            fontWeight: active ? 600 : 500,
                            lineHeight: 1.1,
                            transition: 'transform 0.18s cubic-bezier(0.2,0.8,0.2,1), background 0.18s, color 0.18s',
                            position: 'relative',
                            transform: active && !showLabels ? 'translateY(-4px)' : 'none',
                            boxShadow: active ? `inset 0 0 0 1px ${HW.accentRing}` : 'none',
                         }}
                       >
                         <t.icon size={showLabels ? 19 : 20} strokeWidth={active ? 2 : 1.6} />
                         {showLabels && <span style={{ whiteSpace: 'nowrap' }}>{t.label}</span>}
                         {isAction && !showLabels && null}
                         {t.id === 'mic' && isRecording && <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#c0392b' }}></div>}
                       </button>
                     );
                  })}

                  {/* Fold the pens away for people who only type, and let them
                      back with one tap. This is the whole point of the grouping:
                      "ข้อความ" used to be the 11th icon in a scrolling strip. */}
                  {!showInk && (
                    <button
                      onClick={() => setInkOpen(v => !v)}
                      title="เครื่องมือเขียนด้วยมือ — ปากกา ดินสอ ไฮไลต์"
                      aria-expanded={inkOpen}
                      style={{
                        flexShrink: 0, minWidth: TOOL_BTN, height: showLabels ? TOOL_BTN + 14 : TOOL_BTN,
                        padding: showLabels ? '4px 10px' : 0, borderRadius: 14, border: 'none',
                        background: inkOpen ? HW.accentSoft : 'transparent',
                        color: inkOpen ? HW.accent : HW.textDim, cursor: 'pointer',
                        display: 'flex', flexDirection: showLabels ? 'column' : 'row',
                        alignItems: 'center', justifyContent: 'center', gap: showLabels ? 2 : 0,
                        fontFamily: 'Kanit, sans-serif', fontSize: 10.5, fontWeight: 500, lineHeight: 1.1,
                      }}
                    >
                      <PenTool size={showLabels ? 19 : 20} strokeWidth={1.6} />
                      {showLabels && <span style={{ whiteSpace: 'nowrap' }}>เขียนมือ</span>}
                    </button>
                  )}

                  {selectedId && (
                     <>
                        <div style={{ width: 1, background: '#E5E7EB', height: 24, flexShrink: 0, margin: '0 8px' }}></div>
                        {currentPage.images?.find(i => i.id === selectedId) && (
                           <button onClick={() => setCroppingImageId(selectedId)} title="ครอบตัด" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: 'none', background: '#E0F2FE', color: '#0369A1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginRight: 4 }}>
                              <Scissors size={18} strokeWidth={1.5} />
                           </button>
                        )}
                        <button onClick={deleteSelected} title="ลบทิ้ง" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: 'none', background: '#FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                           <Trash2 size={18} strokeWidth={1.5} />
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

            {/* In-app colour picker — sits above the options popover, outside the
                scrollable capsule so it can never be clipped */}
            {showColorPicker && (
              <div style={{ order: -2 }}>
                <ColorPickerPanel
                  color={penColor}
                  recentColors={customColors}
                  onChange={(c) => { setPenColor(c); if (tool === 'text') applyColorToActiveText(c); }}
                  onCommit={(c) => { setPenColor(c); if (tool === 'text') applyColorToActiveText(c); rememberCustomColor(c); setShowColorPicker(false); }}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}

            {/* Emoji / sticker picker — same slot as the colour picker, above the capsule */}
            {showEmojiPicker && (
              <div style={{ order: -2 }}>
                <EmojiStickerPicker
                  onPick={(e) => insertEmoji(e)}
                  onUpload={() => { document.getElementById('image-upload').click(); setShowEmojiPicker(false); }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}

            {/* Tool options popover — floats above the capsule, Huawei style */}
            {showToolOptions && TOOLS_WITH_OPTIONS.includes(tool) && (
              <div className="hide-scroll" style={{ order: -1, display: 'flex', alignItems: 'center', gap: 7, maxWidth: '100%', overflowX: 'auto', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'saturate(200%) blur(24px)', WebkitBackdropFilter: 'saturate(200%) blur(24px)', borderRadius: 24, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0,0,0,0.1)', border: `1px solid rgba(255, 255, 255, 0.5)`, padding: '8px 14px', marginBottom: 4 }} onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }} {...rightToolbarScroll}>
                  {['pen', 'fountain', 'marker', 'pencil', 'highlighter', 'shape'].includes(tool) && (
                     <>
                        {tool === 'shape' && (
                           <>
                             <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                {[{ t: 'rect', Icon: Square, title: 'สี่เหลี่ยม' }, { t: 'circle', Icon: CircleIcon, title: 'วงกลม' }, { t: 'triangle', Icon: Triangle, title: 'สามเหลี่ยม' }, { t: 'line', Icon: Minus, title: 'เส้นตรง' }, { t: 'arrow', Icon: ArrowRight, title: 'ลูกศร' }, { t: 'star', Icon: Star, title: 'ดาว' }, { t: 'polygon', Icon: Hexagon, title: 'รูปหลายเหลี่ยม (ปรับมุมได้)' }, { t: 'connector', Icon: Spline, title: 'เส้นเชื่อม (เกาะวัตถุ ทำมายด์แมป)' }].map(({ t, Icon, title }) => (
                                  <button key={t} title={title} onClick={() => setShapeType(t)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: shapeType === t ? HW.accentSoft : 'transparent', color: shapeType === t ? HW.accent : '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} strokeWidth={1.6} />
                                  </button>
                                ))}
                             </div>
                             {shapeType === 'connector' && (
                               <button
                                 onClick={() => setConnectorHasArrow((v) => !v)}
                                 title={connectorHasArrow ? 'เส้นเชื่อมมีหัวลูกศร — กดเพื่อเป็นเส้นธรรมดา' : 'เส้นเชื่อมธรรมดา — กดเพื่อใส่หัวลูกศร'}
                                 style={{ height: 32, padding: '0 10px', borderRadius: 10, border: 'none', background: connectorHasArrow ? HW.accentSoft : 'rgba(0,0,0,0.04)', color: connectorHasArrow ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                               >{connectorHasArrow ? 'มีหัวลูกศร' : 'เส้นธรรมดา'}</button>
                             )}
                             <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>
                           </>
                        )}

                        {/* Compact nib preview: current colour, size and opacity in
                            one small dot instead of a whole pen illustration. */}
                        <span title={`${penSize}px`} style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.04)' }}>
                           <span style={{ display: 'block', width: Math.max(4, Math.min(20, penSize * 0.9)), height: Math.max(4, Math.min(20, penSize * 0.9)), borderRadius: '50%', background: penColor === '#FFFFFF' ? '#D1D5DB' : penColor, opacity: tool === 'highlighter' ? Math.min(0.5, penOpacity) : penOpacity }} />
                        </span>

                        <div style={{ width: 1, background: HW.hairline, height: 24, flexShrink: 0 }}></div>

                        {/* Stroke sizes — a compact essentials row (custom via the picker). */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                           {[2, 4, 8, 14].map(s => (
                              <button
                                key={s}
                                onClick={() => setPenSize(s)}
                                title={`${s}px`}
                                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: penSize === s ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <span style={{ display: 'block', width: Math.min(18, 4 + s * 0.7), height: Math.min(18, 4 + s * 0.7), borderRadius: '50%', background: penSize === s ? HW.accent : HW.textDim }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 24, flexShrink: 0 }}></div>

                        {/* Opacity — the ink was always adjustable, there was just
                            no way to reach it. */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                           {[1, 0.6, 0.3].map(o => (
                              <button
                                key={o}
                                onClick={() => setPenOpacity(o)}
                                title={`ความเข้ม ${Math.round(o * 100)}%`}
                                style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: Math.abs(penOpacity - o) < 0.01 ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                              >
                                <span style={{ display: 'block', width: 16, height: 16, borderRadius: 5, background: penColor === '#FFFFFF' ? '#9CA3AF' : penColor, opacity: o, boxShadow: `inset 0 0 0 1px ${HW.hairline}` }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 24, flexShrink: 0 }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           {[...colors.slice(0, 6), ...customColors.slice(0, 2)].map((c, i) => (
                              <div
                                key={`${c}-${i}`}
                                onClick={() => setPenColor(c)}
                                title={c}
                                style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${HW.hairline}`, outline: penColor === c ? `2.5px solid ${HW.accent}` : 'none', outlineOffset: 2, transition: 'outline 0.15s, transform 0.15s', transform: penColor === c ? 'scale(1.08)' : 'none' }}
                              />
                           ))}
                           <button
                             title="เลือกสีเอง"
                             onClick={() => togglePanel('color', setShowColorPicker, showColorPicker, ['tools'])}
                             style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none', padding: 0, background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', boxShadow: `inset 0 0 0 1px ${HW.hairline}`, outline: showColorPicker ? `2.5px solid ${HW.accent}` : 'none', outlineOffset: 2 }}
                           />
                        </div>

                        {['pen', 'fountain', 'marker', 'pencil'].includes(tool) && (
                           <>
                              <div style={{ width: 1, background: HW.hairline, height: 26, flexShrink: 0 }}></div>
                              <button
                                onClick={() => setAutoShape(v => !v)}
                                title="วาดรูปทรงคร่าว ๆ แล้วปล่อย ระบบจะจัดให้เป็นรูปทรงที่สมบูรณ์"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 17, border: 'none', background: autoShape ? HW.accentSoft : 'rgba(0,0,0,0.035)', color: autoShape ? HW.accent : HW.textDim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                              >
                                <Triangle size={15} strokeWidth={1.8} /> จัดรูปทรงอัตโนมัติ
                              </button>
                           </>
                        )}
                     </>
                  )}

                  {tool === 'text' && !editingTextId && (() => {
                     // Edits apply to the text being typed or the selected one, so the
                     // effect is visible straight away rather than only on the next box.
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
                            style={{ flexShrink: 0, height: 30, borderRadius: 9, border: `1px solid ${HW.hairline}`, background: 'white', color: HW.text, fontSize: 12.5, padding: '0 8px', cursor: 'pointer', fontFamily: textStyle.fontFamily }}
                          >
                            {FONT_OPTIONS.map(f => (
                              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                            ))}
                          </select>

                          <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[16, 20, 24, 32, 44, 60].map(sz => (
                                <button
                                  key={sz}
                                  onClick={() => setStyle({ fontSize: sz }, { size: sz })}
                                  style={{ minWidth: 28, height: 28, padding: '0 5px', borderRadius: 9, border: 'none', background: textStyle.fontSize === sz ? HW.accentSoft : 'transparent', color: textStyle.fontSize === sz ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                >
                                  {sz}
                                </button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             <button
                               onClick={() => setStyle({ bold: !textStyle.bold }, { bold: !textStyle.bold })}
                               title="ตัวหนา"
                               style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: textStyle.bold ? HW.accentSoft : 'transparent', color: textStyle.bold ? HW.accent : HW.textDim, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                             >B</button>
                             <button
                               onClick={() => setStyle({ italic: !textStyle.italic }, { italic: !textStyle.italic })}
                               title="ตัวเอียง"
                               style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: textStyle.italic ? HW.accentSoft : 'transparent', color: textStyle.italic ? HW.accent : HW.textDim, fontSize: 14, fontStyle: 'italic', fontWeight: 700, cursor: 'pointer' }}
                             >I</button>
                             <button
                               onClick={() => setStyle({ underline: !textStyle.underline }, { underline: !textStyle.underline })}
                               title="ขีดเส้นใต้"
                               style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: textStyle.underline ? HW.accentSoft : 'transparent', color: textStyle.underline ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                             ><Underline size={15} strokeWidth={2} /></button>
                             <button
                               onClick={() => setStyle({ strikethrough: !textStyle.strikethrough }, { strikethrough: !textStyle.strikethrough })}
                               title="ขีดฆ่า"
                               style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: textStyle.strikethrough ? HW.accentSoft : 'transparent', color: textStyle.strikethrough ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                             ><Strikethrough size={15} strokeWidth={2} /></button>
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                          {/* Alignment */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[{ a: 'left', Icon: AlignLeft, label: 'ชิดซ้าย' }, { a: 'center', Icon: AlignCenter, label: 'กึ่งกลาง' }, { a: 'right', Icon: AlignRight, label: 'ชิดขวา' }].map(({ a, Icon, label }) => (
                                <button
                                  key={a}
                                  onClick={() => setStyle({ align: a }, { align: a })}
                                  title={label}
                                  style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: (textStyle.align || 'left') === a ? HW.accentSoft : 'transparent', color: (textStyle.align || 'left') === a ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><Icon size={15} strokeWidth={2} /></button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                          {/* Lists */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                             {[{ l: 'bullet', Icon: List, label: 'รายการจุด' }, { l: 'number', Icon: ListOrdered, label: 'รายการตัวเลข' }].map(({ l, Icon, label }) => (
                                <button
                                  key={l}
                                  onClick={() => { const next = textStyle.list === l ? 'none' : l; setStyle({ list: next }, { list: next }); }}
                                  title={label}
                                  style={{ width: 30, height: 28, borderRadius: 9, border: 'none', background: textStyle.list === l ? HW.accentSoft : 'transparent', color: textStyle.list === l ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><Icon size={15} strokeWidth={2} /></button>
                             ))}
                          </div>

                          <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                             {colors.map(c => (
                                <div
                                  key={c}
                                  onClick={() => { setPenColor(c); applyToActive({ color: c }); }}
                                  title={c}
                                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${HW.hairline}`, outline: penColor === c ? `2px solid ${HW.accent}` : 'none', outlineOffset: 2 }}
                                />
                             ))}
                             <button
                               title="เลือกสีเอง"
                               onClick={() => togglePanel('color', setShowColorPicker, showColorPicker, ['tools'])}
                               style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none', padding: 0, background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', boxShadow: `inset 0 0 0 1px ${HW.hairline}`, outline: showColorPicker ? `2px solid ${HW.accent}` : 'none', outlineOffset: 2 }}
                             />
                          </div>
                       </>
                     );
                  })()}

                  {tool === 'lasso' && (
                     <>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: HW.text, flexShrink: 0, whiteSpace: 'nowrap' }}>เลือกเฉพาะ</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                           {LASSO_KINDS.map(({ key, label }) => {
                              const on = lassoFilter[key] !== false;
                              return (
                                 <button
                                   key={key}
                                   onClick={() => setLassoFilter(f => ({ ...f, [key]: !on }))}
                                   title={on ? `กำลังเลือก${label}` : `ข้าม${label}`}
                                   style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 16, border: 'none', background: on ? HW.accentSoft : 'rgba(0,0,0,0.04)', color: on ? HW.accent : HW.textDim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'background 0.18s, color 0.18s' }}
                                 >
                                   <span style={{ width: 26, height: 15, borderRadius: 8, background: on ? HW.accent : '#D1D5DB', position: 'relative', flexShrink: 0, transition: 'background 0.18s' }}>
                                     <span style={{ position: 'absolute', top: 1.5, left: on ? 12.5 : 1.5, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.18s cubic-bezier(0.2,0.8,0.2,1)', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} />
                                   </span>
                                   {label}
                                 </button>
                              );
                           })}
                        </div>
                        <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>
                        <button
                          onClick={() => setLassoFilter({ ...DEFAULT_LASSO_FILTER })}
                          style={{ height: 32, padding: '0 12px', borderRadius: 16, border: 'none', background: 'transparent', color: HW.textDim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                        >เลือกทั้งหมด</button>
                     </>
                  )}

                  {tool === 'sticker' && (
                     <>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {STICKY_COLORS.map(c => (
                             <div key={c} onClick={() => setPenColor(c)} style={{ width: 22, height: 22, borderRadius: 6, background: c, cursor: 'pointer', outline: penColor === c ? '2px solid #3B82F6' : 'none', outlineOffset: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                          ))}
                        </div>
                        <div style={{ width: 1, background: '#E5E7EB', height: 20, flexShrink: 0 }}></div>
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                           {STICKY_STYLES.map(s => (
                              <button
                                key={s.id}
                                onClick={() => setStickerStyle(s.id)}
                                title={s.label}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 6px', background: stickerStyle === s.id ? '#E0F2FE' : '#F3F4F6', borderRadius: 8, border: stickerStyle === s.id ? '1.5px solid #0EA5E9' : '1.5px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                 <StickyStyleThumb id={s.id} color={STICKY_COLORS.includes(penColor) ? penColor : '#FEF3C7'} />
                                 <span style={{ fontSize: 10, fontWeight: 600, color: stickerStyle === s.id ? '#0369A1' : '#6B7280', lineHeight: 1 }}>{s.label}</span>
                              </button>
                           ))}
                        </div>
                     </>
                  )}

                  {tool === 'eraser' && (
                     <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                           {[{ m: 'stroke', label: 'ลบทั้งเส้น' }, { m: 'area', label: 'ลบบางส่วน' }].map(({ m, label }) => (
                              <button
                                key={m}
                                onClick={() => setEraserSettings(s => ({ ...s, mode: m }))}
                                style={{ padding: '5px 10px', borderRadius: 9, border: 'none', background: eraserSettings.mode === m ? HW.accentSoft : 'transparent', color: eraserSettings.mode === m ? HW.accent : HW.textDim, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                              >
                                {label}
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                           {[12, 24, 40, 64].map(sz => (
                              <button
                                key={sz}
                                onClick={() => setEraserSettings(s => ({ ...s, size: sz }))}
                                title={`${sz}px`}
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: eraserSettings.size === sz ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <span style={{ display: 'block', width: 4 + sz * 0.22, height: 4 + sz * 0.22, borderRadius: '50%', border: `1.5px solid ${eraserSettings.size === sz ? HW.accent : HW.textDim}` }} />
                              </button>
                           ))}
                        </div>

                        <div style={{ width: 1, background: HW.hairline, height: 22, flexShrink: 0 }}></div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: HW.textDim, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>
                           <input type="checkbox" checked={eraserSettings.eraseObjects} onChange={() => setEraserSettings(s => ({ ...s, eraseObjects: !s.eraseObjects }))} />
                           ลบวัตถุด้วย
                        </label>
                        <button onClick={clearStrokes} style={{ padding: '5px 10px', borderRadius: 9, border: `1px solid ${HW.hairline}`, background: 'white', color: '#EF4444', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>ล้างเส้นทั้งหมด</button>
                     </div>
                  )}

                  {tool === 'laser' && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                           {sizes.map(s => (
                              <button key={s} onClick={() => setPenSize(s)} title={`${s}px`} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: penSize === s ? HW.accentSoft : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <span style={{ display: 'block', width: Math.min(18, 4 + s * 0.7), height: Math.min(18, 4 + s * 0.7), borderRadius: '50%', background: penSize === s ? HW.accent : HW.textDim }} />
                              </button>
                           ))}
                        </div>
                        <div style={{ width: 1, background: HW.hairline, height: 22 }}></div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: HW.textDim, fontFamily: 'Kanit, sans-serif', flexShrink: 0 }}>สีเลเซอร์</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                           {['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#FFFFFF'].map(c => (
                              <div
                                key={c}
                                onClick={() => setLaserColor(c)}
                                title={c}
                                style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${HW.hairline}`, outline: laserColor === c ? `2px solid ${HW.accent}` : 'none', outlineOffset: 2 }}
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
