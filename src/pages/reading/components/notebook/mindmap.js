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
