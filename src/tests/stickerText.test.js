import { describe, expect, it } from 'vitest';
import { konvaFontStyle, stepTextSize, stickerTextStyle, STICKER_TEXT_SIZES } from '../pages/reading/components/notebook/stickerText.js';

describe('stickerTextStyle', () => {
  it('leaves notes saved before formatting existed looking exactly as they did', () => {
    expect(stickerTextStyle({ style: 'classic', text: 'x' })).toEqual({
      color: '#111827', align: 'left', size: 16, bold: false, italic: false, underline: false,
    });
  });

  it("keeps a polaroid's caption small and centred by default", () => {
    const s = stickerTextStyle({ style: 'polaroid' });
    expect(s.size).toBe(13);
    expect(s.align).toBe('center');
  });

  it('prefers what the note stores over the defaults', () => {
    const s = stickerTextStyle({ style: 'polaroid', textColor: '#c0392b', textAlign: 'right', textSize: 24, bold: true });
    expect(s).toEqual({ color: '#c0392b', align: 'right', size: 24, bold: true, italic: false, underline: false });
  });

  it('falls back when a stored size is missing or nonsense', () => {
    for (const bad of [0, -4, NaN, null, undefined, 'big']) {
      expect(stickerTextStyle({ style: 'classic', textSize: bad }).size).toBe(16);
    }
  });

  it('survives being handed nothing at all', () => {
    expect(stickerTextStyle(undefined).size).toBe(16);
    expect(stickerTextStyle(null).align).toBe('left');
  });
});

describe('konvaFontStyle', () => {
  it('joins bold and italic the way Konva expects', () => {
    expect(konvaFontStyle({ bold: true, italic: true })).toBe('bold italic');
    expect(konvaFontStyle({ bold: true, italic: false })).toBe('bold');
    expect(konvaFontStyle({ bold: false, italic: true })).toBe('italic');
    expect(konvaFontStyle({ bold: false, italic: false })).toBe('normal');
  });
});

describe('stepTextSize', () => {
  it('walks the size list rather than a fixed amount', () => {
    expect(stepTextSize(16, 1)).toBe(20);
    expect(stepTextSize(16, -1)).toBe(14);
  });

  it('stops at both ends instead of running off', () => {
    const [min] = STICKER_TEXT_SIZES;
    const max = STICKER_TEXT_SIZES[STICKER_TEXT_SIZES.length - 1];
    expect(stepTextSize(min, -1)).toBe(min);
    expect(stepTextSize(max, 1)).toBe(max);
  });

  it('snaps a size that is not on the list onto it', () => {
    expect(stepTextSize(17, 1)).toBe(24);
    expect(stepTextSize(17, -1)).toBe(16);
  });

  it('handles a size past the top of the list', () => {
    expect(stepTextSize(99, -1)).toBe(24);
    expect(stepTextSize(99, 1)).toBe(30);
  });
});
