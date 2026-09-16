import { it, expect } from 'vitest';
import { a4Tiles, A4_MM_PER_PIXEL } from '../pages/reading/components/notebook/exportLayout.js';

it('keeps a small note at readable scale on one A4 sheet', () => {
  expect(a4Tiles(600, 900)).toEqual([{ x: 0, y: 0, width: 600, height: 900 }]);
});
it('covers a large board exactly without shrinking or losing the edges', () => {
  const tiles = a4Tiles(1901, 3001);
  expect(tiles.reduce((area, tile) => area + tile.width * tile.height, 0)).toBe(1901 * 3001);
  for (const tile of tiles) {
    expect(tile.width * A4_MM_PER_PIXEL).toBeLessThanOrEqual(190);
    expect(tile.height * A4_MM_PER_PIXEL).toBeLessThanOrEqual(277);
  }
  expect(tiles.at(-1).x + tiles.at(-1).width).toBe(1901);
  expect(tiles.at(-1).y + tiles.at(-1).height).toBe(3001);
});
