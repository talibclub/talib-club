// Dev-only harness for the notebook chrome.
//
// The reading room sits behind a login and needs a real book, so the toolbars
// could not be looked at while being designed. This renders them on their own
// with stand-in state. Reachable at /notebook-preview in `npm run dev` only —
// App.jsx does not register the route in a production build.
import React, { useState } from 'react';
import NotebookStyles from './NotebookStyles.jsx';
import NotebookToolCapsule from './NotebookToolCapsule.jsx';
import NotebookTopBar from './NotebookTopBar.jsx';
import ImageSearchPanel from './ImageSearchPanel.jsx';
import TextEditor from './TextEditor.jsx';
import StickyNoteEditor from './StickyNoteEditor.jsx';
import { stickerTextStyle } from './stickerText.js';
import { HW } from './theme.js';

const noop = () => {};

export default function NotebookPreview() {
  // Width of the pane the capsule lives in. The real notebook is usually a
  // split view beside the PDF, which is the case that overflowed.
  const [paneWidth, setPaneWidth] = useState('100%');
  const [tool, setTool] = useState('text');
  const [showToolOptions, setShowToolOptions] = useState(false);
  const [penColor, setPenColor] = useState('#1a1916');
  const [penSize, setPenSize] = useState(3);
  const [penOpacity, setPenOpacity] = useState(1);
  const [rulerOn, setRulerOn] = useState(false);
  const [protractorOn, setProtractorOn] = useState(false);
  const [shapeType, setShapeType] = useState('rect');
  const [stickerStyle, setStickerStyle] = useState('classic');
  const [textStyle, setTextStyle] = useState({ fontFamily: 'Kanit', fontSize: 22, bold: false, italic: false, underline: false, strikethrough: false, align: 'left', list: 'none' });
  const [eraserSettings, setEraserSettings] = useState({ size: 20, mode: 'pixel' });
  const [lassoFilter, setLassoFilter] = useState({ lines: true, shapes: true, images: true, texts: true, stickers: true });
  const [autoShape, setAutoShape] = useState(true);
  const [laserColor, setLaserColor] = useState('#c0392b');
  const [imgQuery, setImgQuery] = useState('ดาว');
  const [showImgSearch, setShowImgSearch] = useState(false);
  const [demoX, setDemoX] = useState(40);
  // A sticky note at a board zoom you choose. The reported bug only shows
  // at the zoom the reading room actually uses, so the zoom is adjustable
  // and the note is drawn behind the editor at the same size Konva draws it.
  const [noteScale, setNoteScale] = useState(0.43);
  const [stickyValue, setStickyValue] = useState('');
  const [sticky, setSticky] = useState({ id: 's1', style: 'classic' });
  const [committed, setCommitted] = useState('(ยังไม่บันทึก)');
  const [demoText, setDemoText] = useState({ id: 'demo', text: '', color: '#1a1916', size: 24, fontFamily: 'Kanit', align: 'left', list: 'none', width: 340 });

  const ui = {
    TOOL_BTN: 40, WRITER_H: 200,
    applyColorToActiveText: noop, autoShape, clearStrokes: noop, closeOverlays: noop,
    colors: ['#1a1916', '#0f6e56', '#c0392b', '#1d4ed8', '#b45309', '#6b21a8'],
    currentPage: { images: [], texts: [], stickers: [], shapes: [], lines: [] },
    currentPageIndex: 0, customColors: ['#0f6e56'], deleteSelected: noop,
    editingTextId: null, eraserSettings, handleToolsScroll: noop, insertEmoji: noop,
    isCoarse: false, isRecording: false, laserColor, lassoFilter,
    leftToolbarScroll: {}, penColor, penOpacity, penSize, protractorOn,
    readonly: false, rememberCustomColor: noop, rightToolbarScroll: {},
    rulerOn, scale: 1, selectedId: null,
    setAutoShape, setCroppingImageId: noop, setEraserSettings, setLaserColor,
    setLassoFilter, setPenColor, setPenOpacity, setPenSize, setProtractorOn,
    setRulerOn, setShapeType, setShowColorPicker: noop, setShowEmojiPicker: noop,
    setShowToolOptions, setStickerStyle, setTextStyle, setTool,
    shapeType, showColorPicker: false, showEmojiPicker: false,
    showLeftScrollHint: false, showRightScrollHint: false, showToolOptions,
    sizes: [1, 2, 3, 5, 8, 12], stickerStyle, textStyle, togglePanel: noop,
    toggleRecording: noop, tool, toolsScrollRef: { current: null },
    updatePage: noop, zoomWriter: false,
    undo: noop, redo: noop, canUndo: true, canRedo: false,
    activeBook: { book: { id: 'b', title: 'ตัวอย่าง', fileUrl: 'x.pdf' } },
    audioPlaying: false, clearPage: noop, deletePage: noop, deleteRecording: noop,
    exportNotebookPDF: noop, fitToScreen: noop, fullView: false, handleAddPage: noop,
    isMobile: false, isSaving: false, nowPlaying: null, onToggleFullView: noop,
    pages: [{ id: 'p1' }], playRecording: noop, pressureEnabled: true,
    recordings: [], renameRecording: noop, runExport: noop, saveNotebook: noop,
    setBookSnipInitialPage: noop, setCurrentPageIndex: noop, setPressureEnabled: noop,
    setScale: noop, setShowAi: noop, setShowBookSnip: noop, setShowExport: noop,
    setShowImgSearch: noop, setShowMoreMenu: noop, setShowPageManager: noop,
    setShowPageSettings: noop, setShowRecordings: noop, setShowSearch: noop,
    setStylusMode: noop, setZoomWriter: noop, showBookSnip: false, showMoreMenu: false,
    showPageManager: false, showRecordings: false, showSearch: false,
    startLoadingPDF: noop, stylusMode: 'auto', toggleBookmark: noop,
  };

  return (
    <>
    <div style={{ position: 'fixed', top: 8, left: 8, zIndex: 9999, display: 'flex', gap: 6, fontFamily: 'Kanit, sans-serif', fontSize: 12 }}>
      {[40, 260, 520].map(px => (
        <button key={'x'+px} onClick={() => setDemoX(px)}
          style={{ padding: '4px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${HW.hairline}`,
                   background: demoX === px ? HW.text : '#fff', color: demoX === px ? '#fff' : HW.text }}>
          x={px}
        </button>
      ))}
      {['100%', '900px', '700px', '520px', '380px'].map(w => (
        <button key={w} onClick={() => setPaneWidth(w)}
          style={{ padding: '4px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${HW.hairline}`,
                   background: paneWidth === w ? HW.accent : '#fff', color: paneWidth === w ? '#fff' : HW.text }}>
          {w}
        </button>
      ))}
    </div>
    <div style={{ position: 'relative', width: paneWidth, height: '100vh', background: HW.paper, overflow: 'hidden', fontFamily: 'Kanit, sans-serif', borderRight: `1px solid ${HW.hairline}` }}>
      <NotebookStyles />
      <NotebookTopBar ui={ui} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: HW.textDim }}>
        <div style={{ width: 'min(720px, 86vw)', height: '62vh', background: '#fff', borderRadius: 12, boxShadow: HW.shadow, border: `1px solid ${HW.hairline}`, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: HW.text, fontWeight: 600 }}>ตัวอย่างแถบเครื่องมือสมุดโน้ต</div>
            <div style={{ fontSize: 12.5, marginTop: 6 }}>เครื่องมือที่เลือก: <b style={{ color: HW.accent }}>{tool}</b></div>
          </div>
        </div>
      </div>
      {/* The sticky note editor over a stand-in note, at an adjustable zoom. */}
      <div style={{ position: 'absolute', top: 150, left: 40, zIndex: 50 }}>
        <div style={{ position: 'absolute', top: -34, left: 0, display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: HW.textDim }}>zoom</span>
          {[0.3, 0.43, 0.6, 1, 1.6].map(z => (
            <button key={'z'+z} onClick={() => setNoteScale(z)}
              style={{ padding: '3px 8px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${HW.hairline}`,
                       background: noteScale === z ? HW.accent : '#fff', color: noteScale === z ? '#fff' : HW.text }}>
              {z}
            </button>
          ))}
          <span style={{ color: HW.textDim, marginLeft: 8 }}>บันทึกแล้ว: <b style={{ color: HW.text }}>{committed || '(ว่าง)'}</b></span>
          <span data-sticky-fmt style={{ color: HW.textDim, marginLeft: 8 }}>{JSON.stringify(stickerTextStyle(sticky))}</span>
        </div>
        {/* Stand-in for the Konva note underneath the editor. */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 150 * noteScale, height: 150 * noteScale,
                      background: '#FDE68A', boxShadow: '2px 3px 8px rgba(0,0,0,0.18)' }} />
        <StickyNoteEditor
          x={0}
          y={0}
          scale={noteScale}
          round={false}
          format={stickerTextStyle(sticky)}
          onFormat={(patch) => setSticky(v => ({ ...v, ...patch }))}
          box={{ left: 12 * noteScale, top: 24 * noteScale, width: 126 * noteScale,
                 height: 116 * noteScale, fontSize: stickerTextStyle(sticky).size * noteScale,
                 align: stickerTextStyle(sticky).align, noteHeight: 150 * noteScale }}
          value={stickyValue}
          onChange={setStickyValue}
          textareaRef={{ current: null }}
          onCommit={() => setCommitted(stickyValue)}
          onDelete={() => { setStickyValue(''); setCommitted('(ลบแล้ว)'); }}
        />
      </div>

      {/* The text toolbar, so its layout can be looked at directly. */}
      <TextEditor
        x={demoX}
        y={90}
        scale={1}
        t={demoText}
        textareaRef={{ current: null }}
        onChange={noop}
        onLinesChange={noop}
        onFont={(f) => setDemoText(v => ({ ...v, fontFamily: f }))}
        onSize={(n) => setDemoText(v => ({ ...v, size: n }))}
        onColor={(c) => setDemoText(v => ({ ...v, color: c }))}
        onCommit={noop}
      />

      {showImgSearch && (
        <ImageSearchPanel
          query={imgQuery}
          setQuery={setImgQuery}
          results={[]}
          loading={false}
          filter=""
          setFilter={noop}
          onSearch={noop}
          onInsert={noop}
          onClose={() => setShowImgSearch(false)}
          onPopupBlocked={noop}
        />
      )}
      <NotebookToolCapsule ui={ui} />
    </div>
    </>
  );
}
