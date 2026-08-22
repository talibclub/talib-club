// Growing a mindmap from the keyboard.
//
// Connectors that bind to objects already existed, and so did text boxes — what
// was missing is the part that makes a mindmap tool feel like one: adding the
// next node without drawing anything. Select a node, press Tab for a child or
// Enter for a sibling, and it is placed, connected and ready to type into.
//
// Placement is deliberately simple and predictable rather than clever. A layout
// that rearranges what you already put down is worse than one you can anticipate.

export const BRANCH_GAP_X = 90;   // between a parent and its children
export const BRANCH_GAP_Y = 22;   // between stacked siblings

// A new child sits to the parent's right, below whichever child is currently
// lowest — so children stack downward in the order they were made and never land
// on top of one another, whatever size each of them turns out to be.
export function childPlacement(parent, children = []) {
  if (!parent) return { x: 0, y: 0 };
  const x = parent.maxX + BRANCH_GAP_X;
  const below = children.filter(Boolean);
  const y = below.length
    ? Math.max(...below.map((b) => b.maxY)) + BRANCH_GAP_Y
    : parent.minY;
  return { x, y };
}

// A sibling goes directly beneath, keeping the left edge so a column stays a
// column.
export function siblingPlacement(node) {
  if (!node) return { x: 0, y: 0 };
  return { x: node.minX, y: node.maxY + BRANCH_GAP_Y };
}

// Every object this one points at, through a bound connector.
export function childIdsOf(page, parentId) {
  return (page?.shapes || [])
    .filter((s) => s?.type === 'connector' && s.from?.id === parentId && s.to?.id)
    .map((s) => s.to.id);
}

// The object pointing at this one, if any. Used so Enter can add a sibling under
// the same parent rather than orphaning it.
export function parentIdOf(page, childId) {
  const link = (page?.shapes || []).find((s) => s?.type === 'connector' && s.to?.id === childId && s.from?.id);
  return link ? link.from.id : null;
}

// The coordinates matter even though both ends are bound by id: they are what a
// connector falls back to if it cannot find its object, and (0, 0) meant the
// line shot off to the corner of the page rather than staying near where it
// belongs.
export function makeBranchConnector({ id, fromId, toId, color, size, from, to }) {
  return {
    id, type: 'connector',
    from: { id: fromId, x: from?.x || 0, y: from?.y || 0 },
    to: { id: toId, x: to?.x || 0, y: to?.y || 0 },
    color, size, hasArrow: true,
  };
}

// --- Looking like a mindmap -------------------------------------------------

export const MINDMAP_STYLES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    type: 'curved',
    colors: ['#0f6e56', '#c0392b', '#1d4ed8', '#b45309', '#6b21a8', '#0e7490']
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    type: 'angled',
    colors: ['#374151', '#4b5563', '#1f2937', '#111827', '#6b7280', '#9ca3af']
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    type: 'curved',
    colors: ['#0284c7', '#0369a1', '#0ea5e9', '#38bdf8', '#075985', '#7dd3fc']
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    type: 'straight',
    colors: ['#f97316', '#ea580c', '#f59e0b', '#ef4444', '#dc2626', '#fbbf24']
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    type: 'angled',
    colors: ['#166534', '#15803d', '#14532d', '#22c55e', '#4ade80', '#10b981']
  },
  berry: {
    id: 'berry',
    name: 'Berry',
    type: 'curved',
    colors: ['#9d174d', '#be185d', '#831843', '#db2777', '#f472b6', '#c026d3']
  }
};

export const DEFAULT_MINDMAP_STYLE = 'classic';

// The colour a new child should take: the same as its parent's branch once one
// exists, otherwise the next unused colour, so siblings of the root differ and
// their descendants match.
export function branchColorFor(page, parentId, rootId) {
  const styleId = page?.mindmapStyle || DEFAULT_MINDMAP_STYLE;
  const style = MINDMAP_STYLES[styleId] || MINDMAP_STYLES.classic;
  const colors = style.colors;
  
  const shapes = (page?.shapes || []).filter((s) => s?.type === 'connector');
  const incoming = shapes.find((s) => s.to?.id === parentId);
  if (incoming?.color) return incoming.color;
  const used = shapes.filter((s) => s.from?.id === (rootId ?? parentId)).map((s) => s.color);
  const free = colors.find((c) => !used.includes(c));
  return free || colors[used.length % colors.length];
}

// A cubic curve leaving the parent horizontally and arriving at the child the
// same way — the shape every mindmap tool draws, and the reason a hand-drawn
// straight diagonal reads as a mistake rather than a branch.
export function branchCurvePoints(a, b) {
  const dx = Math.abs(b.x - a.x);
  const reach = Math.max(28, Math.min(dx * 0.55, 160));
  const dir = b.x >= a.x ? 1 : -1;
  return [a.x, a.y, a.x + reach * dir, a.y, b.x - reach * dir, b.y, b.x, b.y];
}

export function branchAngledPoints(a, b) {
  const midX = a.x + (b.x - a.x) / 2;
  return [a.x, a.y, midX, a.y, midX, b.y, b.x, b.y];
}

export function branchStraightPoints(a, b) {
  return [a.x, a.y, b.x, b.y];
}

// Where the board has to move so a point is on screen.
//
// Branching placed the new node to the parent's right and left the view where it
// was, so on anything but a wide, zoomed-out board the node — and its branch —
// appeared somewhere off-screen with no clue as to where. The smallest nudge
// that brings it inside the margin, and nothing at all when it is already in
// view: a board that recentres itself on every keystroke is its own annoyance.
export function revealOffset({ x, y, pageX, pageY, scale, position, width, height, margin = 90 }) {
  const sx = position.x + (pageX + x) * scale;
  const sy = position.y + (pageY + y) * scale;
  let dx = 0;
  let dy = 0;
  if (sx < margin) dx = margin - sx;
  else if (sx > width - margin) dx = (width - margin) - sx;
  if (sy < margin) dy = margin - sy;
  else if (sy > height - margin) dy = (height - margin) - sy;
  if (dx === 0 && dy === 0) return null;
  return { x: position.x + dx, y: position.y + dy };
}
