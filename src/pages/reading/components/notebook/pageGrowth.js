// A blank page grows to fit what is on it.
//
// Pages were a fixed 800x1130 — paper. That is right for a page backed by a PDF,
// which has to match the sheet it came from, and wrong for a mindmap, which grows
// sideways until it runs off the edge and there is nowhere left to put anything.
//
// So: pages with no PDF behind them expand to hold their contents, and never
// shrink. Shrinking would move the paper out from under work that is still there,
// and a page that resized itself while you were looking away would be worse than
// one that is simply bigger than it needs to be.

export const PAGE_PAD = 160;      // room kept beyond the furthest object
export const MIN_WIDTH = 800;
export const MIN_HEIGHT = 1130;

const spanOf = (obj, kind) => {
  if (!obj) return null;
  if (kind === 'lines') {
    const pts = obj.points;
    if (!Array.isArray(pts) || pts.length < 2) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i + 1 < pts.length; i += 2) {
      if (pts[i] < minX) minX = pts[i];
      if (pts[i] > maxX) maxX = pts[i];
      if (pts[i + 1] < minY) minY = pts[i + 1];
      if (pts[i + 1] > maxY) maxY = pts[i + 1];
    }
    return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
  }
  if (kind === 'shapes') {
    if (obj.type === 'connector') {
      const xs = [obj.from?.x, obj.to?.x].filter(Number.isFinite);
      const ys = [obj.from?.y, obj.to?.y].filter(Number.isFinite);
      if (!xs.length || !ys.length) return null;   // bound ends follow their object
      return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
    }
    const xs = [obj.x1, obj.x2].filter(Number.isFinite);
    const ys = [obj.y1, obj.y2].filter(Number.isFinite);
    if (xs.length && ys.length) {
      return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
    }
  }
  if (!Number.isFinite(obj.x) || !Number.isFinite(obj.y)) return null;
  // Sticky notes are a fixed 150 square; everything else states its size, and a
  // text box that has not been measured yet gets a sensible guess.
  const w = kind === 'stickers' ? 150 : (obj.width || (kind === 'texts' ? 340 : 120));
  const h = kind === 'stickers' ? 150 : (obj.height || (kind === 'texts' ? (obj.size || 22) * 2 : 120));
  return { minX: obj.x, minY: obj.y, maxX: obj.x + w * (obj.scaleX || 1), maxY: obj.y + h * (obj.scaleY || 1) };
};

// The box holding everything on the page, or null for an empty one.
export function pageContentBounds(page) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let any = false;
  ['lines', 'stickers', 'images', 'texts', 'shapes'].forEach((kind) => {
    (page?.[kind] || []).forEach((obj) => {
      const b = spanOf(obj, kind);
      if (!b) return;
      any = true;
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    });
  });
  return any ? { minX, minY, maxX, maxY } : null;
}

// The size this page should be, or null when it already fits.
export function grownPageSize(page) {
  if (!page || page.src) return null;          // a PDF page must match its sheet
  const b = pageContentBounds(page);
  if (!b) return null;
  const width = Math.max(page.width || MIN_WIDTH, MIN_WIDTH, Math.ceil(b.maxX + PAGE_PAD));
  const height = Math.max(page.height || MIN_HEIGHT, MIN_HEIGHT, Math.ceil(b.maxY + PAGE_PAD));
  if (width === page.width && height === page.height) return null;
  return { width, height };
}

// The paper texture, as CSS, for the board behind the page.
//
// The page rect only ever covered its own area, so panning past its edge showed
// grey and the notebook felt walled in — which it is not: objects already live
// outside it and the page grows to include them. Painting the same paper across
// the whole board makes what you see match what you can do.
//
// The pattern is aligned to the page's own, by stepping at the same 40 units and
// offsetting by wherever the page's origin currently sits on screen, so there is
// no seam at the boundary.
export const PAPER_GAP = 40;

export function boardPaperStyle(page, scale, position, pageX, pageY) {
  const dark = page?.paperColor === 'dark';
  const base = dark ? '#1F2937' : page?.paperColor === 'yellow' ? '#FEF3C7' : '#FFFFFF';
  // A PDF page is a real sheet with edges; leave the board around it alone.
  if (!page || page.src) return { background: '#F3F4F6' };

  const type = page.paperType || 'lines';
  if (type === 'blank') return { background: base };

  const ink = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const step = Math.max(4, PAPER_GAP * scale);
  const ox = (position?.x || 0) + (pageX || 0) * scale;
  const oy = (position?.y || 0) + (pageY || 0) * scale;

  if (type === 'dots') {
    return {
      background: base,
      backgroundImage: `radial-gradient(${ink} 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
      backgroundPosition: `${ox}px ${oy}px`,
    };
  }
  const horizontal = `repeating-linear-gradient(to bottom, ${ink} 0 1px, transparent 1px ${step}px)`;
  const vertical = `repeating-linear-gradient(to right, ${ink} 0 1px, transparent 1px ${step}px)`;
  return {
    background: base,
    backgroundImage: type === 'grid' ? `${horizontal}, ${vertical}` : horizontal,
    backgroundPosition: `${ox}px ${oy}px`,
  };
}
