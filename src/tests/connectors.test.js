import { describe, expect, it } from 'vitest';
import { pruneDanglingConnectors } from '../pages/reading/components/notebook/connectors.js';

const conn = (id, from, to) => ({ id, type: 'connector', from, to });

describe('pruneDanglingConnectors', () => {
  it('keeps a connector whose both ends still exist', () => {
    const page = { texts: [{ id: 'a' }, { id: 'b' }], shapes: [conn('c1', { id: 'a' }, { id: 'b' })] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['c1']);
  });

  it('drops a connector whose target was deleted', () => {
    const page = { texts: [{ id: 'a' }], shapes: [conn('c1', { id: 'a' }, { id: 'gone' })] };
    expect(pruneDanglingConnectors(page)).toEqual([]);
  });

  it('drops one whose source was deleted', () => {
    const page = { texts: [{ id: 'b' }], shapes: [conn('c1', { id: 'gone' }, { id: 'b' })] };
    expect(pruneDanglingConnectors(page)).toEqual([]);
  });

  it('keeps a hand-drawn connector with loose ends', () => {
    const page = { shapes: [conn('c1', { x: 10, y: 10 }, { x: 90, y: 90 })] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['c1']);
  });

  it('lets a connector bind to another shape, not only to text', () => {
    const page = { shapes: [{ id: 'r1', type: 'rect' }, conn('c1', { id: 'r1' }, { x: 5, y: 5 })] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['r1', 'c1']);
  });

  it('leaves every non-connector shape alone', () => {
    const page = { shapes: [{ id: 's1', type: 'rect' }, { id: 's2', type: 'polygon' }] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['s1', 's2']);
  });

  it('counts notes and images as valid anchors', () => {
    const page = { stickers: [{ id: 'n1' }], images: [{ id: 'i1' }], shapes: [conn('c1', { id: 'n1' }, { id: 'i1' })] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['c1']);
  });

  it('counts ink strokes as valid anchors', () => {
    const page = { lines: [{ id: 'ink-1', points: [10, 10, 30, 30] }], shapes: [conn('c1', { id: 'ink-1' }, { x: 90, y: 90 })] };
    expect(pruneDanglingConnectors(page).map((s) => s.id)).toEqual(['c1']);
  });

  it('survives an empty or missing page', () => {
    expect(pruneDanglingConnectors({})).toEqual([]);
    expect(pruneDanglingConnectors(null)).toEqual([]);
  });
});
