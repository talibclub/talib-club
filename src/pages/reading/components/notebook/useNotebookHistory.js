import { useRef, useState } from 'react';

// Undo/redo for the notebook pages.
//
// Snapshots are deep copies of the annotation arrays only — `src` (a base64 PDF
// or image data URL, often megabytes) is carried over by reference, so a
// snapshot costs roughly the size of the strokes on the page rather than the
// whole document. The stack is capped at 30 entries.
const HISTORY_LIMIT = 30;

export function snapshotPages(pgs) {
  return pgs.map((p) => ({
    ...p,
    lines: (p.lines || []).map((l) => ({ ...l, points: l.points.slice(), pressures: l.pressures ? l.pressures.slice() : undefined })),
    shapes: (p.shapes || []).map((s) => ({ ...s, points: s.points ? s.points.slice() : undefined, from: s.from ? { ...s.from } : undefined, to: s.to ? { ...s.to } : undefined })),
    texts: (p.texts || []).map((t) => ({ ...t })),
    stickers: (p.stickers || []).map((s) => ({ ...s })),
    images: (p.images || []).map((i) => ({ ...i })),
  }));
}

/**
 * @param pagesRef      ref holding the current pages (read at snapshot time)
 * @param setPages      state setter for the pages array
 * @param setCurrentPageIndex  clamped after an undo/redo shortens the book
 */
export function useNotebookHistory(pagesRef, setPages, setCurrentPageIndex) {
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = () => {
    undoStack.current.push(snapshotPages(pagesRef.current));
    if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const previousState = undoStack.current.pop();
    redoStack.current.push(snapshotPages(pagesRef.current));
    setPages(previousState);
    setCurrentPageIndex((i) => Math.min(i, previousState.length - 1));
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const nextState = redoStack.current.pop();
    undoStack.current.push(snapshotPages(pagesRef.current));
    setPages(nextState);
    setCurrentPageIndex((i) => Math.min(i, nextState.length - 1));
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  };

  return { pushHistory, undo, redo, canUndo, canRedo };
}
