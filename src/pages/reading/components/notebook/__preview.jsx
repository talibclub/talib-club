// Dev-only harness for the notebook chrome.
//
// The reading room sits behind a login and needs a real book, so the toolbars
// could not be looked at while being designed. This renders them on their own
// with stand-in state. Reachable at /notebook-preview in `npm run dev` only —
// App.jsx does not register the route in a production build.
import React, { useState } from 'react';
import NotebookStyles from './NotebookStyles.jsx';
import NotebookToolCapsule from './NotebookToolCapsule.jsx';
import { HW } from './theme.js';

const noop = () => {};

export default function NotebookPreview() {
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
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: HW.paper, overflow: 'hidden', fontFamily: 'Kanit, sans-serif' }}>
      <NotebookStyles />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: HW.textDim }}>
        <div style={{ width: 'min(720px, 86vw)', height: '62vh', background: '#fff', borderRadius: 12, boxShadow: HW.shadow, border: `1px solid ${HW.hairline}`, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: HW.text, fontWeight: 600 }}>ตัวอย่างแถบเครื่องมือสมุดโน้ต</div>
            <div style={{ fontSize: 12.5, marginTop: 6 }}>เครื่องมือที่เลือก: <b style={{ color: HW.accent }}>{tool}</b></div>
          </div>
        </div>
      </div>
      <NotebookToolCapsule ui={ui} />
    </div>
  );
}
