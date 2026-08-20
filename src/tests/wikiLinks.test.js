import { describe, expect, it } from 'vitest';
import { filterPages, matchWikiLink, pageLabel } from '../pages/reading/components/notebook/wikiLinks.js';

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
