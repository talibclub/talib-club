import { PEN_STYLES } from './canvasElements.jsx';

// The zoom-in writing strip: a magnified band at the bottom of the screen where
// you write large and the ink lands small on the page — which is what makes
// handwriting legible on a tablet.
//
// It reuses the stroke pipeline wholesale; only the coordinate mapping differs,
// which is all this file is. No state of its own.
export function makeWriterStrip({
  dimensions, WRITER_ZOOM, WRITER_H, writerStageRef, writerFocus, setWriterFocus,
  currentPage, readonly, tool, penColor, penSize, penOpacity,
  isDrawing, liveStrokeRef, drawingPointerId, gestureErasedRef,
  beginLiveStroke, extendLiveStroke, commitLiveStroke, getPressure, eraseAt,
  shouldDrawWith, eraserSettings, isRecording, recordingStartTimeRef,
}) {
  const writerBoxW = dimensions.width / WRITER_ZOOM;
  const writerBoxH = WRITER_H / WRITER_ZOOM;

  const writerPointerPos = () => {
    const st = writerStageRef.current;
    const p = st?.getPointerPosition();
    if (!p) return null;
    // getPointerPosition is container-relative and ignores the stage transform.
    return { x: writerFocus.x + p.x / WRITER_ZOOM, y: writerFocus.y + p.y / WRITER_ZOOM };
  };

  const moveWriterFocus = (dx, dy) => {
    setWriterFocus((f) => ({
      x: Math.max(0, Math.min(currentPage.width - writerBoxW, f.x + dx)),
      y: Math.max(0, Math.min(currentPage.height - writerBoxH, f.y + dy)),
    }));
  };

  // Slide the window along as the writing approaches its right edge, then drop to
  // the next line when there is no more room.
  const advanceWriterIfNeeded = (pos) => {
    const edge = writerFocus.x + writerBoxW * 0.76;
    if (pos.x < edge) return;
    const atEnd = writerFocus.x + writerBoxW >= currentPage.width - 1;
    if (atEnd) moveWriterFocus(-writerFocus.x, writerBoxH * 0.62);
    else moveWriterFocus(writerBoxW * 0.45, 0);
  };

  const handleWriterDown = (e) => {
    if (readonly) return;
    if (!PEN_STYLES[tool] && tool !== 'eraser') return;   // strip is for ink only
    if (!shouldDrawWith(e)) return;
    const pos = writerPointerPos();
    if (!pos) return;
    drawingPointerId.current = e.evt?.pointerId;
    const relativeTime = isRecording && recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : null;

    if (tool === 'eraser') {
      isDrawing.current = true;
      gestureErasedRef.current = false;
      if (eraserSettings.mode === 'area') beginLiveStroke(pos, 1, relativeTime, 'eraser');
      else eraseAt(pos);
      return;
    }
    beginLiveStroke(pos, getPressure(e), relativeTime, tool);
  };

  const handleWriterMove = (e) => {
    if (!isDrawing.current) return;
    const evt = e?.evt;
    if (evt && drawingPointerId.current !== undefined && evt.pointerId !== drawingPointerId.current) return;
    const pos = writerPointerPos();
    if (!pos) return;
    if (tool === 'eraser' && eraserSettings.mode !== 'area') { eraseAt(pos); return; }
    extendLiveStroke(pos, getPressure(e));
    advanceWriterIfNeeded(pos);
  };

  const handleWriterUp = () => {
    if (liveStrokeRef.current) commitLiveStroke();
    isDrawing.current = false;
    drawingPointerId.current = null;
    gestureErasedRef.current = false;
  };

  return { writerBoxW, writerBoxH, writerPointerPos, moveWriterFocus, advanceWriterIfNeeded, handleWriterDown, handleWriterMove, handleWriterUp };
}
