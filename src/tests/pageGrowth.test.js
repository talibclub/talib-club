import { describe, expect, it } from 'vitest';
import { boardPaperStyle, grownPageSize, MIN_HEIGHT, MIN_WIDTH, PAGE_PAD, pageContentBounds } from '../pages/reading/components/notebook/pageGrowth.js';

const blank = (extra = {}) => ({ width: MIN_WIDTH, height: MIN_HEIGHT, src: null, ...extra });

describe('pageContentBounds', () => {
  it('is null for an empty page', () => {
    expect(pageContentBounds(blank())).toBeNull();
    expect(pageContentBounds(null)).toBeNull();
  });

  it('measures a stroke by its points', () => {
    const page = blank({ lines: [{ points: [10, 20, 300, 400] }] });
    expect(pageContentBounds(page)).toEqual({ minX: 10, minY: 20, maxX: 300, maxY: 400 });
  });

  it('gives a sticky note its fixed square', () => {
    expect(pageContentBounds(blank({ stickers: [{ x: 10, y: 10 }] })))
      .toEqual({ minX: 10, minY: 10, maxX: 160, maxY: 160 });
  });

  it('uses a resized sticky note’s actual dimensions', () => {
    expect(pageContentBounds(blank({ stickers: [{ x: 10, y: 10, width: 280, height: 100 }] })))
      .toEqual({ minX: 10, minY: 10, maxX: 290, maxY: 110 });
  });

  it('respects an object\u2019s own scale', () => {
    expect(pageContentBounds(blank({ stickers: [{ x: 0, y: 0, scaleX: 2, scaleY: 3 }] })))
      .toEqual({ minX: 0, minY: 0, maxX: 300, maxY: 450 });
  });

  it('spans every kind at once', () => {
    const page = blank({
      texts: [{ x: 0, y: 0, width: 100, height: 50 }],
      images: [{ x: 900, y: 700, width: 200, height: 100 }],
    });
    expect(pageContentBounds(page)).toEqual({ minX: 0, minY: 0, maxX: 1100, maxY: 800 });
  });

  it('ignores a connector whose ends are bound to objects', () => {
    const page = blank({ shapes: [{ type: 'connector', from: { id: 'a' }, to: { id: 'b' } }] });
    expect(pageContentBounds(page)).toBeNull();
  });

  it('measures a connector drawn between two loose points', () => {
    const page = blank({ shapes: [{ type: 'connector', from: { x: 10, y: 10 }, to: { x: 90, y: 50 } }] });
    expect(pageContentBounds(page)).toEqual({ minX: 10, minY: 10, maxX: 90, maxY: 50 });
  });

  it('skips objects with no usable position', () => {
    expect(pageContentBounds(blank({ texts: [{}, null] }))).toBeNull();
  });
});

describe('grownPageSize', () => {
  it('leaves a page that already fits alone', () => {
    expect(grownPageSize(blank({ texts: [{ x: 10, y: 10, width: 100, height: 50 }] }))).toBeNull();
  });

  it('widens for something past the right edge', () => {
    const page = blank({ texts: [{ x: 1400, y: 10, width: 100, height: 50 }] });
    expect(grownPageSize(page)).toEqual({ width: 1500 + PAGE_PAD, height: MIN_HEIGHT });
  });

  it('lengthens for something past the bottom', () => {
    const page = blank({ stickers: [{ x: 10, y: 1200 }] });
    expect(grownPageSize(page)).toEqual({ width: MIN_WIDTH, height: 1350 + PAGE_PAD });
  });

  it('never shrinks a page that was already grown', () => {
    const page = { width: 4000, height: 3000, src: null, texts: [{ x: 10, y: 10, width: 50, height: 50 }] };
    expect(grownPageSize(page)).toBeNull();
  });

  it('never resizes a page backed by a PDF', () => {
    const page = { width: MIN_WIDTH, height: MIN_HEIGHT, src: 'data:image/png;base64,x', stickers: [{ x: 5000, y: 5000 }] };
    expect(grownPageSize(page)).toBeNull();
  });

  it('is stable: growing once is enough', () => {
    const page = blank({ stickers: [{ x: 2000, y: 40 }] });
    const grown = grownPageSize(page);
    expect(grownPageSize({ ...page, ...grown })).toBeNull();
  });

  it('survives a missing page', () => {
    expect(grownPageSize(null)).toBeNull();
  });
});

describe('boardPaperStyle', () => {
  it('extends a dotted blank board across the viewport', () => {
    const style = boardPaperStyle(blank({ paperType: 'dots' }), 1, { x: 0, y: 0 }, 0, 0);
    expect(style.backgroundImage).toContain('radial-gradient');
  });

  it('keeps a PDF page on the neutral board background', () => {
    expect(boardPaperStyle(blank({ src: 'page.png' }), 1, { x: 0, y: 0 }, 0, 0)).toEqual({ background: '#F3F4F6' });
  });
});
