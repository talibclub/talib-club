// Handwriting shape recognition for the notebook canvas.
//
// Huawei Notes cleans up a roughly drawn shape the moment the pen lifts. These
// helpers classify a finished stroke and, on a confident match, describe the ideal
// shape to swap in. `recognizeShape` returns null for "leave the handwriting
// alone" — the deliberate default, because a wrong guess destroying someone's
// notes is far worse than no guess at all.

export const distToSegmentXY = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
};

// Ray casting. `poly` is a flat [x,y,x,y,...] list.
export const pointInPolygon = (px, py, poly) => {
  let inside = false;
  const n = poly.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i * 2], yi = poly[i * 2 + 1];
    const xj = poly[j * 2], yj = poly[j * 2 + 1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

// `points` is the raw flat [x,y,x,y,...] list of a finished stroke.
export const recognizeShape = (points) => {
  const n = points.length / 2;
  if (n < 8) return null;

  const xs = new Array(n), ys = new Array(n);
  for (let i = 0; i < n; i++) { xs[i] = points[i * 2]; ys[i] = points[i * 2 + 1]; }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    if (xs[i] < minX) minX = xs[i];
    if (xs[i] > maxX) maxX = xs[i];
    if (ys[i] < minY) minY = ys[i];
    if (ys[i] > maxY) maxY = ys[i];
  }
  const w = maxX - minX, h = maxY - minY;
  if (Math.hypot(w, h) < 30) return null;   // a dot or a tiny glyph, not a shape

  let len = 0;
  for (let i = 1; i < n; i++) len += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
  if (len < 40) return null;

  const gap = Math.hypot(xs[n - 1] - xs[0], ys[n - 1] - ys[0]);
  const closed = gap < len * 0.22;

  if (!closed) {
    let maxDev = 0;
    for (let i = 0; i < n; i++) {
      maxDev = Math.max(maxDev, distToSegmentXY(xs[i], ys[i], xs[0], ys[0], xs[n - 1], ys[n - 1]));
    }
    if (maxDev < Math.max(6, gap * 0.06)) {
      return { type: 'line', x1: xs[0], y1: ys[0], x2: xs[n - 1], y2: ys[n - 1] };
    }
    return null;
  }

  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  let rSum = 0;
  const radii = new Array(n);
  for (let i = 0; i < n; i++) { radii[i] = Math.hypot(xs[i] - cx, ys[i] - cy); rSum += radii[i]; }
  const rMean = rSum / n;
  if (rMean <= 0) return null;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (radii[i] - rMean) ** 2;
  const rDev = Math.sqrt(varSum / n) / rMean;
  const aspect = h === 0 ? 99 : w / h;

  // A near-constant radius all the way round is a circle.
  if (rDev < 0.16 && aspect > 0.7 && aspect < 1.43) {
    return { type: 'circle', cx, cy, r: rMean };
  }

  // Otherwise use how much of the bounding box the outline encloses:
  // rectangle ≈ 1.0, circle ≈ 0.79, triangle ≈ 0.5.
  let area2 = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) area2 += xs[j] * ys[i] - xs[i] * ys[j];
  const fill = Math.abs(area2 / 2) / (w * h || 1);

  if (fill > 0.82) return { type: 'rect', minX, minY, maxX, maxY };
  if (fill > 0.35 && fill < 0.68) return { type: 'triangle', minX, minY, maxX, maxY };
  if (rDev < 0.28) return { type: 'circle', cx, cy, r: rMean };
  return null;
};

// Translate a recognition result into the {x1,y1,x2,y2} model the shape renderer
// uses (circles and triangles are drawn centred on x1,y1 with the radius derived
// from the diagonal to x2,y2).
export const shapeFromRecognition = (m, style, id = `shape-${Date.now()}`) => {
  const base = { id, color: style.color, size: style.size, opacity: style.opacity };
  if (m.type === 'line') return { ...base, type: 'line', x1: m.x1, y1: m.y1, x2: m.x2, y2: m.y2 };
  if (m.type === 'rect') return { ...base, type: 'rect', x1: m.minX, y1: m.minY, x2: m.maxX, y2: m.maxY };
  if (m.type === 'circle') {
    const off = m.r / Math.SQRT2;
    return { ...base, type: 'circle', x1: m.cx, y1: m.cy, x2: m.cx + off, y2: m.cy + off };
  }
  const cx = (m.minX + m.maxX) / 2;
  const cy = (m.minY + m.maxY) / 2;
  const r = Math.max(m.maxX - m.minX, m.maxY - m.minY) / 1.7;
  const off = r / Math.SQRT2;
  return { ...base, type: 'triangle', x1: cx, y1: cy, x2: cx + off, y2: cy + off };
};
