// Pure geometry and text-format helpers for the notebook. No React, no Konva.

// --- Editable-polygon geometry ---
// Points are stored flat [x0,y0,x1,y1,...] in page coordinates.
export const polygonBounds = (pts) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]);
    minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]);
  }
  return { minX, minY, maxX, maxY };
};

export const polygonCentroid = (pts) => {
  let cx = 0, cy = 0; const n = pts.length / 2;
  for (let i = 0; i < pts.length; i += 2) { cx += pts[i]; cy += pts[i + 1]; }
  return { x: cx / n, y: cy / n };
};

// Interior angle (degrees) at vertex i, between its two adjacent edges.
export const polygonInteriorAngle = (pts, i) => {
  const n = pts.length / 2;
  if (n < 3) return 0;
  const prev = ((i - 1) + n) % n, next = (i + 1) % n;
  const bx = pts[i * 2], by = pts[i * 2 + 1];
  const v1x = pts[prev * 2] - bx, v1y = pts[prev * 2 + 1] - by;
  const v2x = pts[next * 2] - bx, v2y = pts[next * 2 + 1] - by;
  const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
};

// Text with a list style is stored as plain lines; the bullets/numbers are added
// only for display (and in the editing overlay) so the underlying value stays clean.
export const applyListPrefix = (text, list) => {
  if (!list || list === 'none' || !text) return text;
  let n = 0;
  return text.split('\n').map((line) => {
    if (list === 'bullet') return line.length ? `•  ${line}` : line;
    if (line.length) { n += 1; return `${n}.  ${line}`; }
    return line;
  }).join('\n');
};

// Konva's textDecoration accepts a space-separated combination.
export const textDecorationOf = (o) => [o.underline ? 'underline' : '', o.strikethrough ? 'line-through' : ''].filter(Boolean).join(' ') || '';
