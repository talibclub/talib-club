import { describe, expect, it } from 'vitest';
import { dedupePage, dedupePages } from '../pages/reading/components/notebook/dedupePage.js';
import { snapshotPages } from '../pages/reading/components/notebook/useNotebookHistory.js';

describe('dedupePage', () => {
  it('drops a later object sharing an id', () => {
    const page = { texts: [{ id: 'a', text: 'หนึ่ง' }, { id: 'a', text: 'สอง' }] };
    const r = dedupePage(page);
    expect(r.removed).toBe(1);
    expect(r.page.texts).toEqual([{ id: 'a', text: 'หนึ่ง' }]);
  });

  it('drops an object identical but for its id', () => {
    const page = { texts: [{ id: 'a', x: 10, y: 10, text: 'ซ้ำ' }, { id: 'b', x: 10, y: 10, text: 'ซ้ำ' }] };
    expect(dedupePage(page).removed).toBe(1);
  });

  it('keeps a copy that was moved, which is what duplicating does', () => {
    const page = { texts: [{ id: 'a', x: 10, y: 10, text: 'ซ้ำ' }, { id: 'b', x: 34, y: 34, text: 'ซ้ำ' }] };
    expect(dedupePage(page).removed).toBe(0);
  });

  it('keeps objects that only look similar', () => {
    const page = { stickers: [{ id: 'a', x: 0, y: 0, text: 'ก' }, { id: 'b', x: 0, y: 0, text: 'ข' }] };
    expect(dedupePage(page).removed).toBe(0);
  });

  it('works across every kind of content', () => {
    const dup = (id) => ({ id, x: 1, y: 1 });
    const page = {
      lines: [dup('l'), dup('l')], stickers: [dup('s'), dup('s')],
      images: [dup('i'), dup('i')], texts: [dup('t'), dup('t')], shapes: [dup('h'), dup('h')],
    };
    expect(dedupePage(page).removed).toBe(5);
  });

  it('leaves a clean page untouched, and returns it unchanged', () => {
    const page = { texts: [{ id: 'a' }, { id: 'b' }] };
    const r = dedupePage(page);
    expect(r.removed).toBe(0);
    expect(r.page.texts).toEqual(page.texts);
  });

  it('drops holes in an array', () => {
    expect(dedupePage({ texts: [null, { id: 'a' }] }).removed).toBe(1);
  });

  it('survives a missing page or missing arrays', () => {
    expect(dedupePage(null).removed).toBe(0);
    expect(dedupePage({}).removed).toBe(0);
  });
});

describe('dedupePages', () => {
  it('counts across the whole notebook', () => {
    const pages = [
      { texts: [{ id: 'a' }, { id: 'a' }] },
      { stickers: [{ id: 'b' }, { id: 'b' }, { id: 'b' }] },
    ];
    expect(dedupePages(pages).removed).toBe(3);
  });

  it('returns the very same array when there is nothing to do', () => {
    const pages = [{ texts: [{ id: 'a' }] }];
    expect(dedupePages(pages).pages).toBe(pages);
  });

  it('survives a missing notebook', () => {
    expect(dedupePages(null).removed).toBe(0);
  });
});

describe('snapshotPages', () => {
  it('tolerates legacy strokes that have no point array', () => {
    const snapshot = snapshotPages([{ lines: [{ id: 'old' }], shapes: [{ id: 'shape' }] }]);
    expect(snapshot[0].lines[0].points).toEqual([]);
    expect(snapshot[0].shapes[0].points).toBeUndefined();
  });
});
