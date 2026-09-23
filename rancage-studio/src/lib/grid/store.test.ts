import { describe, it, expect } from 'vitest';
import {
  createGrid,
  createGridFromData,
  getCell,
  setCell,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  fillRange,
  normalizeRange,
  isInRange,
} from './store';
import type { CellValue } from './types';

describe('createGrid', () => {
  it('creates grid with correct dimensions', () => {
    const g = createGrid(3, 4);
    expect(g.rowCount).toBe(3);
    expect(g.colCount).toBe(4);
    expect(g.data).toHaveLength(3);
    expect(g.data[0]).toHaveLength(4);
  });

  it('fills cells with null', () => {
    const g = createGrid(2, 2);
    expect(g.data[0]![0]).toBeNull();
    expect(g.data[1]![1]).toBeNull();
  });
});

describe('createGridFromData', () => {
  it('creates grid from 2D array', () => {
    const data: CellValue[][] = [
      [1, 'a', true],
      [2, 'b', false],
    ];
    const g = createGridFromData(data);
    expect(g.rowCount).toBe(2);
    expect(g.colCount).toBe(3);
    expect(getCell(g, { row: 0, col: 0 })).toBe(1);
    expect(getCell(g, { row: 0, col: 1 })).toBe('a');
  });

  it('normalizes ragged arrays', () => {
    const data: CellValue[][] = [[1], [2, 'extra']];
    const g = createGridFromData(data);
    expect(g.colCount).toBe(2);
    expect(getCell(g, { row: 0, col: 1 })).toBeNull();
  });
});

describe('setCell', () => {
  it('sets value immutably', () => {
    const g = createGrid(2, 2);
    const g2 = setCell(g, { row: 0, col: 1 }, 'hello');
    expect(getCell(g, { row: 0, col: 1 })).toBeNull();
    expect(getCell(g2, { row: 0, col: 1 })).toBe('hello');
  });
});

describe('addRow / removeRow', () => {
  it('adds row at end', () => {
    const g = createGrid(2, 2);
    const g2 = addRow(g);
    expect(g2.rowCount).toBe(3);
  });

  it('adds row at index', () => {
    const g = createGrid(2, 2);
    const g2 = setCell(g, { row: 0, col: 0 }, 'first');
    const g3 = addRow(g2, 0);
    expect(getCell(g3, { row: 0, col: 0 })).toBeNull();
    expect(getCell(g3, { row: 1, col: 0 })).toBe('first');
  });

  it('removes row', () => {
    const g = createGrid(3, 2);
    const g2 = setCell(g, { row: 1, col: 0 }, 'middle');
    const g3 = removeRow(g2, 1);
    expect(g3.rowCount).toBe(2);
    expect(getCell(g3, { row: 1, col: 0 })).toBeNull();
  });

  it('does not remove last row', () => {
    const g = createGrid(1, 1);
    expect(removeRow(g, 0).rowCount).toBe(1);
  });
});

describe('addColumn / removeColumn', () => {
  it('adds column', () => {
    const g = createGrid(2, 2);
    const g2 = addColumn(g);
    expect(g2.colCount).toBe(3);
  });

  it('removes column', () => {
    const g = createGrid(2, 3);
    const g2 = setCell(g, { row: 0, col: 2 }, 'last');
    const g3 = removeColumn(g2, 2);
    expect(g3.colCount).toBe(2);
  });

  it('does not remove last column', () => {
    const g = createGrid(1, 1);
    expect(removeColumn(g, 0).colCount).toBe(1);
  });
});

describe('fillRange', () => {
  it('fills all cells in range', () => {
    const g = createGrid(5, 5);
    const g2 = fillRange(g, { start: { row: 1, col: 1 }, end: { row: 2, col: 2 } }, 42);
    expect(getCell(g2, { row: 1, col: 1 })).toBe(42);
    expect(getCell(g2, { row: 2, col: 2 })).toBe(42);
    expect(getCell(g2, { row: 0, col: 0 })).toBeNull();
  });
});

describe('normalizeRange', () => {
  it('normalizes reversed range', () => {
    const r = normalizeRange({
      start: { row: 3, col: 3 },
      end: { row: 0, col: 0 },
    });
    expect(r.start).toEqual({ row: 0, col: 0 });
    expect(r.end).toEqual({ row: 3, col: 3 });
  });
});

describe('isInRange', () => {
  const range = {
    start: { row: 1, col: 1 },
    end: { row: 3, col: 3 },
  };

  it('returns true for point inside', () => {
    expect(isInRange({ row: 2, col: 2 }, range)).toBe(true);
  });

  it('returns true for boundary', () => {
    expect(isInRange({ row: 1, col: 1 }, range)).toBe(true);
    expect(isInRange({ row: 3, col: 3 }, range)).toBe(true);
  });

  it('returns false outside', () => {
    expect(isInRange({ row: 0, col: 0 }, range)).toBe(false);
    expect(isInRange({ row: 4, col: 4 }, range)).toBe(false);
  });
});
