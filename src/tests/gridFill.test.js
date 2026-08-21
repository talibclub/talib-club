import { describe, expect, it } from 'vitest';
import { columnsAt, completeRows } from '../pages/articles/gridFill.js';

describe('columnsAt', () => {
  it('counts what the grid actually fits', () => {
    expect(columnsAt(1280)).toBe(4);
    expect(columnsAt(960)).toBe(3);
    expect(columnsAt(640)).toBe(2);
    expect(columnsAt(320)).toBe(1);
  });

  it('never reports fewer than one column', () => {
    expect(columnsAt(0)).toBe(1);
    expect(columnsAt(undefined)).toBe(1);
    expect(columnsAt(120)).toBe(1);
  });

  it('accounts for the gap between cards', () => {
    // two cards plus one gap is 612; a hair under must still be one column short
    expect(columnsAt(611)).toBe(1);
    expect(columnsAt(612)).toBe(2);
  });
});

describe('completeRows', () => {
  it('fills whole rows and drops the ragged remainder', () => {
    expect(completeRows(20, 4)).toBe(12);
    expect(completeRows(20, 5)).toBe(10);
    expect(completeRows(20, 3)).toBe(12);
  });

  it('was the reported case: six articles across four columns', () => {
    expect(completeRows(6, 4)).toBe(4);
  });

  it('leaves a short list alone rather than rounding it away', () => {
    expect(completeRows(3, 4)).toBe(3);
    expect(completeRows(1, 4)).toBe(1);
    expect(completeRows(0, 4)).toBe(0);
  });

  it('respects the cap', () => {
    expect(completeRows(500, 4)).toBe(12);
    expect(completeRows(500, 4, 8)).toBe(8);
  });

  it('survives a nonsense column count', () => {
    expect(completeRows(9, 0)).toBe(9);
    expect(completeRows(9, undefined)).toBe(9);
  });
});
