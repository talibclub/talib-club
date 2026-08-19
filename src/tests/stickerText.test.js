import { describe, expect, it } from 'vitest';
import { konvaFontStyle, stickerTextStyle } from '../pages/reading/components/notebook/stickerText.js';
import { makeLine, migrateSticker, isUniformText } from '../pages/reading/components/notebook/geometry.js';

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

describe('migrateSticker', () => {
  it('splits a legacy note into lines that inherit its old format', () => {
    const sk = migrateSticker({ text: 'หัวข้อ\nรอง', textAlign: 'center', bold: true });
    expect(sk.lines.map((l) => l.text)).toEqual(['หัวข้อ', 'รอง']);
    expect(sk.lines.every((l) => l.align === 'center' && l.bold)).toBe(true);
    expect(sk.lines.every((l) => l.size === null)).toBe(true);
  });

  it('gives an empty note one empty line to type into', () => {
    expect(migrateSticker({ text: '' }).lines).toHaveLength(1);
    expect(migrateSticker({}).lines[0].text).toBe('');
  });

  it('normalises a note that already has lines instead of re-splitting', () => {
    const sk = migrateSticker({ lines: [{ text: 'ก', size: 26, bold: true }, { text: 'ข' }] });
    expect(sk.lines[0].size).toBe(26);
    expect(sk.lines[1].size).toBeNull();
    expect(sk.lines[1].align).toBe('left');
  });

  it('survives being handed nothing', () => {
    expect(migrateSticker(null)).toBeNull();
  });
});

describe('per-line size', () => {
  it('defaults to inheriting the object size', () => {
    expect(makeLine('x').size).toBeNull();
  });

  it('rejects a size that is not a usable number', () => {
    for (const bad of [0, -3, NaN, 'big', null]) expect(makeLine('x', { size: bad }).size).toBeNull();
  });

  it('stops treating a box as uniform once one line is a heading', () => {
    expect(isUniformText({ lines: [makeLine('a'), makeLine('b')] })).toBe(true);
    expect(isUniformText({ lines: [makeLine('a', { size: 30 }), makeLine('b')] })).toBe(false);
  });
});
