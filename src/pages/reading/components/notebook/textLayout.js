import { LINE_HEIGHT } from './theme.js';
import { PAPER_GAP } from './pageGrowth.js';

export const usesPaperLines = (page, text) => !page?.src && !text?.isNode
  && ['lines', 'grid'].includes(page?.paperType || 'lines');

export function textRowHeight(size, ruled = false) {
  const natural = (size || 24) * LINE_HEIGHT;
  return ruled ? Math.ceil(natural / PAPER_GAP) * PAPER_GAP : natural;
}

// Keep the text's line box on the paper grid, including at negative board coordinates.
export function textTop(y, ruled = false) {
  return ruled ? Math.round(y / PAPER_GAP) * PAPER_GAP : y;
}

export function formatShortcut(event) {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.isComposing) return null;
  return ({ b: 'bold', i: 'italic', u: 'underline' })[event.key?.toLowerCase()] || null;
}
