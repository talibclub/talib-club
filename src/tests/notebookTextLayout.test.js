import { describe, expect, it } from 'vitest';
import { formatShortcut, textRowHeight, textTop, usesPaperLines } from '../pages/reading/components/notebook/textLayout.js';

describe('notebook text on ruled paper', () => {
  it('keeps body text and larger headings on whole paper rows', () => {
    expect(textRowHeight(24, true)).toBe(40);
    expect(textRowHeight(48, true)).toBe(80);
    expect(textRowHeight(24, false)).toBeCloseTo(28.8);
    expect(textTop(73, true)).toBe(80);
    expect(textTop(-73, true)).toBe(-80);
    expect(textTop(73, false)).toBe(73);
  });

  it('leaves PDF pages, blank paper and mindmap nodes free positioned', () => {
    expect(usesPaperLines({ paperType: 'lines' }, {})).toBe(true);
    expect(usesPaperLines({ paperType: 'grid' }, {})).toBe(true);
    expect(usesPaperLines({ paperType: 'blank' }, {})).toBe(false);
    expect(usesPaperLines({ paperType: 'lines', src: 'page.png' }, {})).toBe(false);
    expect(usesPaperLines({ paperType: 'lines' }, { isNode: true })).toBe(false);
  });
});

describe('formatting shortcuts use saved line formatting', () => {
  it('handles Control and Command formatting, including uppercase keys', () => {
    expect(formatShortcut({ ctrlKey: true, key: 'b' })).toBe('bold');
    expect(formatShortcut({ metaKey: true, key: 'I' })).toBe('italic');
    expect(formatShortcut({ ctrlKey: true, key: 'u' })).toBe('underline');
  });

  it('does not intercept ordinary typing, IME or AltGr input', () => {
    expect(formatShortcut({ key: 'b' })).toBeNull();
    expect(formatShortcut({ ctrlKey: true, key: 'b', isComposing: true })).toBeNull();
    expect(formatShortcut({ ctrlKey: true, altKey: true, key: 'b' })).toBeNull();
    expect(formatShortcut({ ctrlKey: true, key: 's' })).toBeNull();
  });
});
