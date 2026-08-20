import { boundsCenter, polygonBounds, textOf } from './geometry.js';
import { LINE_HEIGHT, TEXT_BOX_WIDTH } from './theme.js';

// Smart connectors, for mindmaps: where each object sits, what is under a point,
// and where a connector's ends land.
//
// A bound end sits on its object's edge facing the other end, so the line meets
// the border rather than burying itself in the middle of the box.
export function makeConnectors({ pagesRef, currentPageIndex }) {
  const objectBoundsById = (id) => {
    const page = pagesRef.current[currentPageIndex];
    if (!page || !id) return null;
    for (const kind of ['images', 'shapes', 'texts', 'stickers']) {
      const o = (page[kind] || []).find((x) => x.id === id);
      if (!o) continue;
      if (kind === 'shapes' && o.type === 'connector') return null;
      if (kind === 'shapes' && o.type === 'polygon') return polygonBounds(o.points);
      if (kind === 'shapes') return { minX: Math.min(o.x1, o.x2), minY: Math.min(o.y1, o.y2), maxX: Math.max(o.x1, o.x2), maxY: Math.max(o.y1, o.y2) };
      if (kind === 'images') return { minX: o.x, minY: o.y, maxX: o.x + (o.width || 0) * (o.scaleX || 1), maxY: o.y + (o.height || 0) * (o.scaleY || 1) };
      if (kind === 'stickers') { const w = o.audioUrl ? 130 : 150, h = o.audioUrl ? 44 : 150; return { minX: o.x, minY: o.y, maxX: o.x + w * (o.scaleX || 1), maxY: o.y + h * (o.scaleY || 1) }; }
      // Text objects: `o.text` only exists on the legacy flat shape. Anything
      // edited through TextEditor stores `lines`, so this measured a
      // one-character box for it — and for a flat multi-line string it laid the
      // whole character count out on a single line and gave it one line of
      // height. Measure the longest line for width and count the lines for
      // height.
      {
        const body = textOf(o);
        const rows = body ? body.split(/\r?\n/) : [''];
        const longest = rows.reduce((n, r) => Math.max(n, r.length), 1);
        const size = o.size || 16;
        const width = o.width || Math.max(60, longest * size * 0.6);
        const height = Math.max(1, rows.length) * size * LINE_HEIGHT;
        return { minX: o.x, minY: o.y, maxX: o.x + width, maxY: o.y + height };
      }
    }
    return null;
  };

  // Topmost non-connector object under a page-space point (for endpoint snapping).
  const objectIdAt = (pos, excludeId) => {
    const page = pagesRef.current[currentPageIndex];
    if (!page) return null;
    for (const kind of ['stickers', 'images', 'texts', 'shapes']) {
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

  return { objectBoundsById, objectIdAt, resolveConnectorEnd, connectorPoints };
}
