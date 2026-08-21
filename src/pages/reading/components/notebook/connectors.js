import { boundsCenter, polygonBounds, textOf, textVisualWidth } from './geometry.js';
import { LINE_HEIGHT, TEXT_BOX_WIDTH } from './theme.js';

// Smart connectors, for mindmaps: where each object sits, what is under a point,
// and where a connector's ends land.
//
// A bound end sits on its object's edge facing the other end, so the line meets
// the border rather than burying itself in the middle of the box.
export function makeConnectors({ pagesRef, currentPageIndex, getPage }) {
  // pagesRef is written by an effect, so it lags a render behind. A connector
  // drawn to a node created in this very render found nothing, fell back to the
  // coordinates on its endpoint, and drew itself to the corner of the page —
  // which is exactly what a freshly branched mindmap looked like. Prefer the
  // live page when the caller can give one.
  const readPage = () => (getPage ? getPage() : null) || pagesRef.current[currentPageIndex];
  const objectBoundsById = (id) => {
    const page = readPage();
    if (!page || !id) return null;
    for (const kind of ['images', 'shapes', 'texts', 'stickers', 'lines']) {
      const o = (page[kind] || []).find((x) => x.id === id);
      if (!o) continue;
      if (kind === 'shapes' && o.type === 'connector') return null;
      // Ink is a first-class thing on the page too. It has no rectangle of its
      // own, so use the tight bounds of its points (including pen width) as the
      // place a connector can attach to.
      if (kind === 'lines') {
        const pts = o.points || [];
        if (pts.length < 2) return null;
        let minX = pts[0], maxX = pts[0], minY = pts[1], maxY = pts[1];
        for (let i = 2; i + 1 < pts.length; i += 2) {
          minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]);
          minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]);
        }
        const pad = (o.size || 4) / 2;
        return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
      }
      if (kind === 'shapes' && o.type === 'polygon') return polygonBounds(o.points);
      if (kind === 'shapes') return { minX: Math.min(o.x1, o.x2), minY: Math.min(o.y1, o.y2), maxX: Math.max(o.x1, o.x2), maxY: Math.max(o.y1, o.y2) };
      if (kind === 'images') return { minX: o.x, minY: o.y, maxX: o.x + (o.width || 0) * (o.scaleX || 1), maxY: o.y + (o.height || 0) * (o.scaleY || 1) };
      if (kind === 'stickers') {
        const w = o.audioUrl ? 130 : (o.width || 150);
        const h = o.audioUrl ? 44 : (o.height || 150);
        return { minX: o.x, minY: o.y, maxX: o.x + w * (o.scaleX || 1), maxY: o.y + h * (o.scaleY || 1) };
      }
      // Text objects: `o.text` only exists on the legacy flat shape. Anything
      // edited through TextEditor stores `lines`, so this measured a
      // one-character box for it — and for a flat multi-line string it laid the
      // whole character count out on a single line and gave it one line of
      // height. Measure the longest line for width and count the lines for
      // height.
      {
        const body = textOf(o);
        const rows = body ? body.split(/\r?\n/) : [''];
        const size = o.size || 16;
        const width = textVisualWidth(o, body);
        const height = Math.max(1, rows.length) * size * LINE_HEIGHT;
        return { minX: o.x, minY: o.y, maxX: o.x + width, maxY: o.y + height };
      }
    }
    return null;
  };

  // Topmost non-connector object under a page-space point (for endpoint snapping).
  const objectIdAt = (pos, excludeId) => {
    const page = readPage();
    if (!page) return null;
    for (const kind of ['stickers', 'images', 'texts', 'shapes', 'lines']) {
      const arr = page[kind] || [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const o = arr[i];
        if (o.id === excludeId || o.type === 'connector') continue;
        const b = objectBoundsById(o.id);
        if (b && pos.x >= b.minX && pos.x <= b.maxX && pos.y >= b.minY && pos.y <= b.maxY) return o.id;
      }
    }
    return null;
  };


  // Resolve an endpoint to a page point. A bound end sits on its object's edge
  // facing `toward`, so the line meets the border instead of the centre.
  const resolveConnectorEnd = (anchor, toward) => {
    if (!anchor) return { x: 0, y: 0 };
    if (!anchor.id) return { x: anchor.x, y: anchor.y };
    const b = objectBoundsById(anchor.id);
    if (!b) return { x: anchor.x, y: anchor.y };
    const c = boundsCenter(b);
    const dx = (toward ? toward.x : c.x) - c.x, dy = (toward ? toward.y : c.y) - c.y;
    if (dx === 0 && dy === 0) return c;
    const hw = (b.maxX - b.minX) / 2 || 1, hh = (b.maxY - b.minY) / 2 || 1;
    const f = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
    return { x: c.x + dx * f, y: c.y + dy * f };
  };

  // Both endpoints of a connector as page points (each aimed at the other).
  const connectorPoints = (s) => {
    const rawA = s.from?.id ? (objectBoundsById(s.from.id) ? boundsCenter(objectBoundsById(s.from.id)) : s.from) : s.from;
    const rawB = s.to?.id ? (objectBoundsById(s.to.id) ? boundsCenter(objectBoundsById(s.to.id)) : s.to) : s.to;
    return { a: resolveConnectorEnd(s.from, rawB), b: resolveConnectorEnd(s.to, rawA) };
  };

  // Used by the canvas to softly outline every valid destination while the
  // connector tool is active. A visible affordance beats asking someone to
  // remember which things on a busy page are actually linkable.
  const connectableObjects = () => {
    const page = readPage();
    if (!page) return [];
    const out = [];
    for (const kind of ['lines', 'texts', 'stickers', 'images', 'shapes']) {
      for (const o of page[kind] || []) {
        if (!o?.id || (kind === 'shapes' && o.type === 'connector')) continue;
        const bounds = objectBoundsById(o.id);
        if (bounds) out.push({ id: o.id, bounds });
      }
    }
    return out;
  };

  return { objectBoundsById, objectIdAt, resolveConnectorEnd, connectorPoints, connectableObjects };
}

// Connectors whose far end no longer exists.
//
// Deleting an object left every connector bound to it behind. Such a connector
// falls back to the coordinates stored on its endpoint, and a branch made by Tab
// or Enter stores none — so deleting one node of a mindmap flung its line to the
// page's top-left corner. A connector to nothing is not meaningful in either
// case, so it goes when its object goes.
export function pruneDanglingConnectors(page) {
  const shapes = page?.shapes || [];
  const alive = new Set(
    [...(page?.lines || []), ...(page?.texts || []), ...(page?.stickers || []), ...(page?.images || []), ...shapes]
      .map((o) => o?.id)
      .filter(Boolean)
  );
  return shapes.filter((s) => {
    if (s?.type !== 'connector') return true;
    if (s.from?.id && !alive.has(s.from.id)) return false;
    if (s.to?.id && !alive.has(s.to.id)) return false;
    return true;
  });
}
