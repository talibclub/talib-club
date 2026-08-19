// Text formatting for a sticky note.
//
// A note's text used to be drawn with every value hardcoded — one colour, one
// size, and an alignment decided solely by the note's shape — so there was
// nothing to change even though the notes look like something you would want to
// mark up. These fields are all optional: notes saved before they existed carry
// none of them and must keep looking exactly as they did, which is what the
// fallbacks below are for.

export const STICKER_TEXT_SIZES = [12, 14, 16, 20, 24, 30];

export function stickerTextStyle(st) {
  const polaroid = st?.style === 'polaroid';
  const size = Number(st?.textSize);
  return {
    color: st?.textColor || '#111827',
    align: st?.textAlign || (polaroid ? 'center' : 'left'),
    // A polaroid's caption strip is short, so its text has always been smaller.
    size: Number.isFinite(size) && size > 0 ? size : (polaroid ? 13 : 16),
    bold: !!st?.bold,
    italic: !!st?.italic,
    underline: !!st?.underline,
  };
}

// Konva wants bold and italic as one space-separated string, not two props.
export function konvaFontStyle({ bold, italic }) {
  if (bold && italic) return 'bold italic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}

// Step through the size list rather than by a fixed amount, so the small end
// stays fine-grained and the large end does not take a dozen taps.
export function stepTextSize(current, direction) {
  const sizes = STICKER_TEXT_SIZES;
  const i = sizes.findIndex((s) => s >= current);
  const at = i === -1 ? sizes.length - 1 : i;
  const next = sizes[Math.min(sizes.length - 1, Math.max(0, at + direction))];
  return next || current;
}
