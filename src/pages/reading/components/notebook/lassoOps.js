import toast from 'react-hot-toast';
import { ZERO_OFFSET } from './theme.js';

// Lasso selection: what is selected, moving it, and the operations offered on it
// — bake, delete, duplicate, recolour and scale.
//
// While a selection is live its strokes are held in selectedLassoLines and drawn
// inside a draggable group, so they are absent from the page until baked. Objects
// stay where they are and take the drag offset instead.
//
// Not a hook: it owns no state of its own. The selection state lives in the
// component, and this is the set of operations over it, gathered out of a file
// that had them interleaved with drawing and gestures.
export function makeLassoOps({
  selectedLassoLines, setSelectedLassoLines, selectedObjects, setSelectedObjects,
  selectionRef, selectedObjectsRef, lassoGroupPos, setLassoGroupPos,
  lassoBounds, lassoPathRef, setLassoPath,
  updatePage, currentPageIndex, pushHistory, setTool,
}) {
  // While a selection is live its strokes are held in `selectedLassoLines` and
  // drawn inside a draggable group, so they are absent from the page until baked.

  const hasSelection = selectedLassoLines.length > 0 || selectedObjects.length > 0;

  const isObjectSelected = (kind, id) => selectedObjects.some((o) => o.kind === kind && o.id === id);

  // Live drag offset for a selected object. Strokes get this for free by sitting
  // inside the dragged group; objects stay in the page, so they take it here.
  const objectOffset = (kind, id) => (isObjectSelected(kind, id) ? lassoGroupPos : ZERO_OFFSET);

  // Walk the page applying `fn` to every object in the current selection.
  const mapSelectedObjects = (page, fn) => {
    selectedObjectsRef.current.forEach(({ kind, id }) => {
      const item = (page[kind] || []).find((o) => o.id === id);
      if (item) fn(item, kind);
    });
  };

  const shiftObject = (item, kind, dx, dy) => {
    if (kind === 'shapes' && item.type === 'polygon') { item.points = item.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)); }
    else if (kind === 'shapes' && item.type === 'connector') {
      // Only free (unattached) endpoints move; bound ends stay glued to their object.
      if (item.from && !item.from.id) { item.from = { ...item.from, x: item.from.x + dx, y: item.from.y + dy }; }
      if (item.to && !item.to.id) { item.to = { ...item.to, x: item.to.x + dx, y: item.to.y + dy }; }
    }
    else if (kind === 'shapes') { item.x1 += dx; item.x2 += dx; item.y1 += dy; item.y2 += dy; }
    else { item.x += dx; item.y += dy; }
  };

  const clearLassoSelection = () => {
    selectionRef.current = [];
    selectedObjectsRef.current = [];
    setSelectedLassoLines([]);
    setSelectedObjects([]);
    setLassoGroupPos({ x: 0, y: 0 });
    lassoPathRef.current = null;
    setLassoPath(null);
  };

  // Drop the selection back onto the page at wherever it was dragged to.
  //
  // Reads and clears selectionRef synchronously rather than trusting the
  // `selectedLassoLines` state: baking can be triggered from a menu click, a tap
  // outside, and the tool-change effect, and two of those firing before React
  // re-renders would otherwise both see the old selection and bake it twice.
  const bakeLassoSelection = () => {
    const selection = selectionRef.current;
    const objects = selectedObjectsRef.current;
    if (selection.length === 0 && objects.length === 0) return;
    selectionRef.current = [];
    const { x: dx, y: dy } = lassoGroupPos;
    const moved = selection.map((l) => ({
      ...l,
      points: l.points.map((pt, i) => (i % 2 === 0 ? pt + dx : pt + dy)),
    }));
    pushHistory();
    updatePage(currentPageIndex, (page) => {
      if (moved.length > 0) page.lines = [...(page.lines || []), ...moved];
      if (dx !== 0 || dy !== 0) {
        // Objects were only drawn shifted; commit the shift for real.
        ['shapes', 'texts', 'stickers', 'images'].forEach((kind) => {
          if (!page[kind]) return;
          page[kind] = page[kind].map((o) =>
            objects.some((s) => s.kind === kind && s.id === o.id) ? { ...o } : o);
        });
        mapSelectedObjects(page, (item, kind) => shiftObject(item, kind, dx, dy));
      }
    });
    clearLassoSelection();
  };

  const deleteLassoSelection = () => {
    const objects = selectedObjectsRef.current;
    // The strokes were already lifted off the page, so dropping the selection
    // without baking deletes them. Objects are still on the page and must go.
    if (objects.length > 0) {
      pushHistory();
      updatePage(currentPageIndex, (page) => {
        ['shapes', 'texts', 'stickers', 'images'].forEach((kind) => {
          if (!page[kind]) return;
          page[kind] = page[kind].filter((o) => !objects.some((s) => s.kind === kind && s.id === o.id));
        });
      });
    }
    clearLassoSelection();
    toast.success('ลบส่วนที่เลือกแล้ว');
  };

  const duplicateLassoSelection = () => {
    const offset = 24;
    const dx = lassoGroupPos.x + offset;
    const dy = lassoGroupPos.y + offset;
    const copies = selectionRef.current.map((l) => ({
      ...l,
      points: l.points.map((pt, i) => (i % 2 === 0 ? pt + dx : pt + dy)),
    }));
    const objects = selectedObjectsRef.current;
    if (copies.length === 0 && objects.length === 0) return;
    pushHistory();
    updatePage(currentPageIndex, (page) => {
      if (copies.length > 0) page.lines = [...(page.lines || []), ...copies];
      objects.forEach(({ kind, id }) => {
        const src = (page[kind] || []).find((o) => o.id === id);
        if (!src) return;
        const clone = { ...src, id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
        shiftObject(clone, kind, dx, dy);
        page[kind] = [...page[kind], clone];
      });
    });
    toast.success('ทำซ้ำแล้ว');
  };

  // Edits go through selectionRef as well, so a later bake writes the edited
  // strokes rather than the originals captured when the lasso closed.
  const recolorLassoSelection = (color) => {
    const next = selectionRef.current.map((l) => ({ ...l, color }));
    selectionRef.current = next;
    setSelectedLassoLines(next);

    // Shapes and text carry a colour too; sticky notes and images do not.
    const tintable = selectedObjectsRef.current.filter((o) => o.kind === 'shapes' || o.kind === 'texts');
    if (tintable.length === 0) return;
    pushHistory();
    updatePage(currentPageIndex, (page) => {
      tintable.forEach(({ kind, id }) => {
        page[kind] = (page[kind] || []).map((o) => (o.id === id ? { ...o, color } : o));
      });
    });
  };

  const scaleLassoSelection = (factor) => {
    const box = lassoBounds;
    if (!box) return;
    const cx = box.minX, cy = box.minY;
    const next = selectionRef.current.map((l) => ({
      ...l,
      size: Math.max(1, (l.size || 4) * factor),
      points: l.points.map((pt, i) => (i % 2 === 0 ? cx + (pt - cx) * factor : cy + (pt - cy) * factor)),
    }));
    selectionRef.current = next;
    setSelectedLassoLines(next);
  };

  return {
    hasSelection, isObjectSelected, objectOffset, mapSelectedObjects, shiftObject,
    clearLassoSelection, bakeLassoSelection, deleteLassoSelection,
    duplicateLassoSelection, recolorLassoSelection, scaleLassoSelection,
  };
}
