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

// --- Rich text: per-line formatting (item 9, phase 1) ---
// Legacy text objects carry one `text` string plus box-level bold/italic/list/…
// The line-level model stores `lines: [{ text, bold, italic, underline,
// strikethrough, list, align }]`. These helpers upgrade legacy objects on the
// fly at render time, so old notes keep rendering identically (a uniform box is
// still drawn as one Konva <Text>) while future mixed boxes render per line.

const LINE_FLAGS = ['bold', 'italic', 'underline', 'strikethrough'];

export const makeLine = (text = '', fmt = {}) => ({
  text: text || '',
  bold: !!fmt.bold,
  italic: !!fmt.italic,
  underline: !!fmt.underline,
  strikethrough: !!fmt.strikethrough,
  list: fmt.list || 'none',
  align: fmt.align || 'left',
});

// Return a copy of the text object guaranteed to have a well-formed `lines[]`.
// Already-line-level objects are normalized; legacy ones are split on '\n' with
// every line inheriting the old box-level format.
export const migrateText = (t) => {
  if (!t) return t;
  if (Array.isArray(t.lines)) {
    return { ...t, lines: t.lines.map((l) => makeLine(l.text, l)) };
  }
  const box = { bold: t.bold, italic: t.italic, underline: t.underline, strikethrough: t.strikethrough, list: t.list, align: t.align };
  const raw = typeof t.text === 'string' ? t.text : '';
  const parts = raw.length ? raw.split('\n') : [''];
  return { ...t, lines: parts.map((line) => makeLine(line, box)) };
};

// Plain-string value of the lines (editor value, search, legacy readers).
export const textOf = (t) => (Array.isArray(t?.lines) ? t.lines.map((l) => l.text).join('\n') : (t?.text || ''));

// True when every line shares the same formatting → render as a single <Text>,
// byte-identical to the pre-rich-text behaviour. Always true for legacy boxes.
export const isUniformText = (t) => {
  const lines = t?.lines;
  if (!Array.isArray(lines) || lines.length <= 1) return true;
  const first = lines[0];
  return lines.every((l) => l.list === first.list && l.align === first.align && LINE_FLAGS.every((f) => !!l[f] === !!first[f]));
};

// The shared format of a (uniform) box, read off its first line.
export const uniformFormatOf = (t) => {
  const l0 = (Array.isArray(t?.lines) && t.lines[0]) || {};
  return { bold: !!l0.bold, italic: !!l0.italic, underline: !!l0.underline, strikethrough: !!l0.strikethrough, list: l0.list || 'none', align: l0.align || 'left' };
};

// Per-line bullet/number prefixes; numbering runs continuously across the box
// and skips blank lines — matching the legacy applyListPrefix output.
export const listPrefixes = (lines) => {
  let n = 0;
  return lines.map((l) => {
    if (!l.list || l.list === 'none' || !l.text.length) return '';
    if (l.list === 'bullet') return '•  ';
    n += 1;
    return `${n}.  `;
  });
};
