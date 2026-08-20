import { useEffect, useRef } from 'react';

// Two-finger pan and pinch zoom, plus the trackpad wheel.
//
// While a gesture is in flight the transform is written to the Konva stage
// directly and only committed to React state when the fingers lift. Routing
// every pointermove through setState re-rendered the whole notebook per frame,
// which is the judder that made zooming feel worse than the apps this is modelled
// on. The effect below re-asserts the live transform after any unrelated render,
// so a toast or the autosave flag cannot snap the view back for a frame.
export function useNotebookGestures({
  stageRef, scale, setScale, position, setPosition, activePointers,
  dimensions, currentPage,
}) {
  const lastCenter = useRef(null);
  const lastDist = useRef(null);
  // While a pinch or one-finger pan is in flight, the transform is applied to the
  // Konva stage DIRECTLY and only committed to React state when the fingers lift.
  // Routing every pointermove through setState re-rendered this whole component per
  // frame, which is exactly the judder that made zooming feel worse than
  // Huawei Notes / GoodNotes.
  const gestureRef = useRef(null); // { scale, pos } of the live stage transform
  const panMovedRef = useRef(false);

  // If something unrelated re-renders mid-gesture (autosave flag, a toast), the
  // Stage props would snap the transform back to the stale committed state for one
  // frame. Re-assert the live gesture transform after every render while active.
  useEffect(() => {
    const stage = stageRef.current;
    if (gestureRef.current && stage) {
      stage.scale({ x: gestureRef.current.scale, y: gestureRef.current.scale });
      stage.position(gestureRef.current.pos);
      stage.batchDraw();
    }
  });

  // Fold the live stage transform back into React state, once, at gesture end.
  // pageX depends on scale (the page re-centres when zoomed out), so the committed
  // position is compensated to keep the page exactly where the fingers left it.
  const commitGestureTransform = () => {
    const stage = stageRef.current;
    panMovedRef.current = false;
    if (!gestureRef.current || !stage) { gestureRef.current = null; return; }
    gestureRef.current = null;
    stage.listening(true);
    const s = stage.scaleX();
    const pos = stage.position();
    const oldPageX = Math.max(0, (dimensions.width - currentPage.width * scale) / 2 / scale);
    const newPageX = Math.max(0, (dimensions.width - currentPage.width * s) / 2 / s);
    setScale(s);
    setPosition({ x: pos.x + (oldPageX - newPageX) * s, y: pos.y });
  };
  
  // Two-pointer pinch/pan, driven off the activePointers map so it works for
  // fingers on a tablet and for a pen resting alongside them.
  const handlePinch = () => {
    // Only fingers pinch — a stray pen or palm-classified pointer must not skew
    // the zoom centre.
    const pts = Array.from(activePointers.current.values()).filter(p => p.type === 'touch').slice(0, 2);
    if (pts.length < 2) return;
    {
      const p1 = { x: pts[0].clientX, y: pts[0].clientY };
      const p2 = { x: pts[1].clientX, y: pts[1].clientY };

      const newCenter = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (lastCenter.current && lastDist.current) {
        const stage = stageRef.current;
        // Read the LIVE transform off the stage, not React state: state lags a
        // frame or more behind during a fast gesture and the stale reads were a
        // second source of jitter.
        const oldScale = stage.scaleX();
        const stagePos = stage.position();

        // Pan
        const dx = newCenter.x - lastCenter.current.x;
        const dy = newCenter.y - lastCenter.current.y;

        // Zoom
        const scaleBy = dist / lastDist.current;
        let newScale = oldScale * scaleBy;
        newScale = Math.max(0.1, Math.min(newScale, 5));

        // Center calculation for zoom
        const pointerPosition = {
           x: newCenter.x - stage.container().getBoundingClientRect().left,
           y: newCenter.y - stage.container().getBoundingClientRect().top
        };

        const mousePointTo = {
          x: (pointerPosition.x - stagePos.x) / oldScale,
          y: (pointerPosition.y - stagePos.y) / oldScale,
        };

        const newPos = {
          x: pointerPosition.x - mousePointTo.x * newScale + dx,
          y: pointerPosition.y - mousePointTo.y * newScale + dy,
        };

        // Apply straight to the canvas — zero React re-renders per frame. Hit
        // detection is paused for the duration; nobody taps a button mid-pinch,
        // and skipping the hit-graph redraw roughly halves the per-frame cost.
        if (!gestureRef.current) stage.listening(false);
        gestureRef.current = { scale: newScale, pos: newPos };
        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        stage.batchDraw();
      }

      lastCenter.current = newCenter;
      lastDist.current = dist;
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Math.exp handles both standard wheel and smooth trackpad pinch
      const scaleBy = Math.exp(-e.evt.deltaY / 300); 
      let newScale = oldScale * scaleBy;
      newScale = Math.max(0.1, Math.min(newScale, 5));
      
      setScale(newScale);
      setPosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      // Pan (Trackpad 2-finger scroll works perfectly here via deltaX and deltaY)
      setPosition(prev => ({
        x: prev.x - e.evt.deltaX,
        y: prev.y - e.evt.deltaY
      }));
    }
  };
  return { lastCenter, lastDist, gestureRef, panMovedRef, commitGestureTransform, handlePinch, handleWheel };
}
