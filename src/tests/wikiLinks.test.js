import { describe, expect, it } from 'vitest';
import { backlinksTo, filterPages, matchWikiLink, pageLabel, resolveLinkIndex } from '../pages/reading/components/notebook/wikiLinks.js';

describe('matchWikiLink', () => {
  it('opens on "[["', () => {
    expect(matchWikiLink('[[')).toEqual({ start: 0, query: '' });
    expect(matchWikiLink('ดูที่ [[บทน')).toEqual({ start: 6, query: 'บทน' });
  });

  it('allows spaces, because page names have them', () => {
    expect(matchWikiLink('[[บท ที่ 1')).toEqual({ start: 0, query: 'บท ที่ 1' });
  });

  it('closes once the link is finished', () => {
    expect(matchWikiLink('[[บทที่ 1]]')).toBeNull();
    expect(matchWikiLink('[[a]] แล้วต่อ')).toBeNull();
  });

  it('ignores a single bracket', () => {
    expect(matchWikiLink('[ยัง')).toBeNull();
    expect(matchWikiLink('')).toBeNull();
    expect(matchWikiLink(null)).toBeNull();
  });

  it('tracks the last opener', () => {
    expect(matchWikiLink('[[a]] [[b')).toEqual({ start: 6, query: 'b' });
  });
});

describe('pageLabel', () => {
  it('prefers the page name', () => {
    expect(pageLabel({ name: 'บทนำ' }, 0)).toBe('บทนำ');
  });

  it('falls back to what is written on the page', () => {
    expect(pageLabel({ texts: [{ lines: [{ text: 'หลักอะกีดะฮฺ' }] }] }, 2)).toBe('3. หลักอะกีดะฮฺ');
  });

  it('reads legacy text objects and sticky notes too', () => {
    expect(pageLabel({ texts: [{ text: 'เก่า' }] }, 0)).toBe('1. เก่า');
    expect(pageLabel({ stickers: [{ text: 'จากโน้ต' }] }, 1)).toBe('2. จากโน้ต');
  });

  it('truncates a long line', () => {
    const long = 'ก'.repeat(60);
    expect(pageLabel({ texts: [{ text: long }] }, 0)).toBe(`1. ${'ก'.repeat(28)}…`);
  });

  it('falls back to the page number when the page is blank', () => {
    expect(pageLabel({}, 4)).toBe('หน้า 5');
    expect(pageLabel(null, 0)).toBe('หน้า 1');
  });
});

describe('filterPages', () => {
  const pages = [{ name: 'บทนำ' }, { name: 'อะกีดะฮฺ' }, { name: 'ฟิกฮฺ' }];

  it('lists every page but the one being written on', () => {
    expect(filterPages(pages, '', 1).map((r) => r.index)).toEqual([0, 2]);
  });

  it('filters by label', () => {
    expect(filterPages(pages, 'ฟิก', 0).map((r) => r.label)).toEqual(['ฟิกฮฺ']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterPages(pages, 'zzz', 0)).toEqual([]);
  });

  it('survives an empty notebook', () => {
    expect(filterPages([], '', 0)).toEqual([]);
    expect(filterPages(null, '', 0)).toEqual([]);
  });
});

describe('backlinksTo', () => {
  const linkLine = (page) => ({ text: 'ไป', link: { page } });
  const pages = [
    { id: 'p0', name: 'บทนำ', texts: [{ lines: [linkLine(2)] }] },
    { id: 'p1', name: 'กลาง', texts: [{ lines: [{ text: 'ธรรมดา' }] }] },
    { id: 'p2', name: 'ปลายทาง', texts: [] },
    { id: 'p3', name: 'อีกหน้า', texts: [{ lines: [linkLine(2), linkLine(2)] }] },
  ];

  it('finds the pages pointing at this one', () => {
    expect(backlinksTo(pages, 2).map((b) => b.label)).toEqual(['บทนำ', 'อีกหน้า']);
  });

  it('counts a page once however many links it holds', () => {
    expect(backlinksTo(pages, 2).filter((b) => b.index === 3)).toHaveLength(1);
  });

  it('returns nothing for a page nobody links to', () => {
    expect(backlinksTo(pages, 1)).toEqual([]);
  });

  it('never lists the page itself', () => {
    const selfLink = [{ id: 'only', texts: [{ lines: [linkLine(0)] }] }];
    expect(backlinksTo(selfLink, 0)).toEqual([]);
  });

  it('survives pages with no texts and a missing notebook', () => {
    expect(backlinksTo([{}, {}], 0)).toEqual([]);
    expect(backlinksTo(null, 0)).toEqual([]);
  });
});

describe('resolveLinkIndex', () => {
  const pages = [{ id: 'p-a' }, { id: 'p-b' }, { id: 'p-c' }];

  it('finds the page by its id', () => {
    expect(resolveLinkIndex(pages, { pageId: 'p-c' })).toBe(2);
  });

  it('still points at the same page after one is inserted before it', () => {
    const grown = [{ id: 'p-a' }, { id: 'p-new' }, { id: 'p-b' }, { id: 'p-c' }];
    expect(resolveLinkIndex(grown, { pageId: 'p-c' })).toBe(3);
  });

  it('reads a plain index, for links written before ids were used', () => {
    expect(resolveLinkIndex(pages, { page: 1 })).toBe(1);
  });

  it('clamps a legacy index that now runs past the end', () => {
    expect(resolveLinkIndex(pages, { page: 99 })).toBe(2);
  });

  it('reports a target that no longer exists', () => {
    expect(resolveLinkIndex(pages, { pageId: 'gone' })).toBe(-1);
    expect(resolveLinkIndex(pages, null)).toBe(-1);
    expect(resolveLinkIndex(null, { pageId: 'p-a' })).toBe(-1);
  });
});
