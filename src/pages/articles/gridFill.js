// How many cards to show so the last row is never half-empty.
//
// The list showed six, and the grid fits four across on a desktop — so the page
// ended on a row of two beside a stretch of nothing. A grid that ends mid-row
// reads as "we ran out" rather than "here is the selection".

export const CARD_MIN = 300;   // matches minmax(300px, 1fr)
export const CARD_GAP = 12;

// Columns the grid will actually lay out at this width.
export function columnsAt(width) {
  if (!width || width < CARD_MIN) return 1;
  return Math.max(1, Math.floor((width + CARD_GAP) / (CARD_MIN + CARD_GAP)));
}

// Trimmed to whole rows, capped so the page stays a selection rather than the
// whole archive. Fewer items than one row is left alone — three articles should
// show as three, not be rounded away to nothing.
export function completeRows(available, columns, max = 12) {
  const cap = Math.min(available, max);
  if (!columns || columns < 1) return cap;
  if (cap < columns) return cap;
  return Math.floor(cap / columns) * columns;
}
