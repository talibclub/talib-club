import { describe, expect, it } from 'vitest';
import {
  BRANCH_GAP_X, BRANCH_GAP_Y, childIdsOf, childPlacement,
  makeBranchConnector, parentIdOf, siblingPlacement,
} from '../pages/reading/components/notebook/mindmap.js';

const box = (minX, minY, maxX, maxY) => ({ minX, minY, maxX, maxY });

describe('childPlacement', () => {
  it('puts a first child to the parent\u2019s right, level with its top', () => {
    expect(childPlacement(box(0, 0, 100, 40))).toEqual({ x: 100 + BRANCH_GAP_X, y: 0 });
  });

  it('stacks later children below the lowest one', () => {
    const parent = box(0, 0, 100, 40);
    const first = box(190, 0, 290, 40);
    expect(childPlacement(parent, [first])).toEqual({ x: 190, y: 40 + BRANCH_GAP_Y });
  });

  it('measures against the lowest child, not the last one added', () => {
    const parent = box(0, 0, 100, 40);
    const kids = [box(190, 200, 290, 260), box(190, 0, 290, 40)];
    expect(childPlacement(parent, kids).y).toBe(260 + BRANCH_GAP_Y);
  });

  it('ignores children whose bounds could not be worked out', () => {
    const parent = box(0, 0, 100, 40);
    expect(childPlacement(parent, [null, undefined]).y).toBe(0);
  });

  it('survives being handed no parent', () => {
    expect(childPlacement(null)).toEqual({ x: 0, y: 0 });
  });
});

describe('siblingPlacement', () => {
  it('goes straight below, keeping the left edge', () => {
    expect(siblingPlacement(box(50, 10, 150, 60))).toEqual({ x: 50, y: 60 + BRANCH_GAP_Y });
  });

  it('survives being handed nothing', () => {
    expect(siblingPlacement(null)).toEqual({ x: 0, y: 0 });
  });
});

describe('childIdsOf / parentIdOf', () => {
  const page = {
    shapes: [
      { type: 'connector', from: { id: 'a' }, to: { id: 'b' } },
      { type: 'connector', from: { id: 'a' }, to: { id: 'c' } },
      { type: 'connector', from: { id: 'b' }, to: { id: 'd' } },
      { type: 'connector', from: { id: 'a' }, to: { x: 5, y: 5 } },   // loose end
      { type: 'rect', from: { id: 'a' }, to: { id: 'z' } },           // not a connector
    ],
  };

  it('lists the objects a node points at', () => {
    expect(childIdsOf(page, 'a')).toEqual(['b', 'c']);
  });

  it('skips connectors whose far end is not bound to anything', () => {
    expect(childIdsOf(page, 'a')).not.toContain(undefined);
  });

  it('finds what points at a node', () => {
    expect(parentIdOf(page, 'b')).toBe('a');
    expect(parentIdOf(page, 'd')).toBe('b');
    expect(parentIdOf(page, 'a')).toBeNull();
  });

  it('survives an empty page', () => {
    expect(childIdsOf({}, 'a')).toEqual([]);
    expect(parentIdOf(null, 'a')).toBeNull();
  });
});

describe('makeBranchConnector', () => {
  it('binds both ends by id and points at the child', () => {
    const c = makeBranchConnector({ id: 's1', fromId: 'a', toId: 'b', color: '#000', size: 2 });
    expect(c).toMatchObject({ id: 's1', type: 'connector', from: { id: 'a' }, to: { id: 'b' }, hasArrow: true });
  });
});
