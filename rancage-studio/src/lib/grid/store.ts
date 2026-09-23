import type { CellValue, CellPosition, CellRange, GridState } from './types';
import { DEFAULT_COL_WIDTH } from './types';

/** Create empty grid */
export function createGrid(rows: number, cols: number): GridState {
  return {
    data: Array.from({ length: rows }, () => Array(cols).fill(null) as CellValue[]),
    rowCount: rows,
    colCount: cols,
    columnWidths: Array(cols).fill(DEFAULT_COL_WIDTH),
    selectedRange: null,
    editingCell: null,
    editValue: '',
  };
}

/** Create grid from 2D array */
export function createGridFromData(data: CellValue[][]): GridState {
  const colCount = data.reduce((max, row) => Math.max(max, row.length), 0);
  const rowCount = data.length;
  // Ensure rectangular
  const normalized = data.map((row) => {
    const r = [...row];
    while (r.length < colCount) r.push(null);
    return r;
  });
  return {
    data: normalized,
    rowCount,
    colCount,
    columnWidths: Array(colCount).fill(DEFAULT_COL_WIDTH),
    selectedRange: null,
    editingCell: null,
    editValue: '',
  };
}

/** Get cell value */
export function getCell(grid: GridState, pos: CellPosition): CellValue {
  return grid.data[pos.row]?.[pos.col] ?? null;
}

/** Set cell value (immutable) */
export function setCell(grid: GridState, pos: CellPosition, value: CellValue): GridState {
  const data = grid.data.map((row) => [...row]);
  if (data[pos.row]) data[pos.row]![pos.col] = value;
  return { ...grid, data };
}

/** Add row at index (or end if -1) */
export function addRow(grid: GridState, index = -1): GridState {
  const newRow: CellValue[] = Array(grid.colCount).fill(null);
  const data = [...grid.data];
  const insertAt = index < 0 ? data.length : index;
  data.splice(insertAt, 0, newRow);
  return { ...grid, data, rowCount: data.length };
}

/** Remove row at index */
export function removeRow(grid: GridState, index: number): GridState {
  if (grid.rowCount <= 1) return grid;
  const data = [...grid.data];
  data.splice(index, 1);
  return { ...grid, data, rowCount: data.length };
}

/** Add column at index (or end) */
export function addColumn(grid: GridState, index = -1): GridState {
  const data = grid.data.map((row) => {
    const r = [...row];
    const insertAt = index < 0 ? r.length : index;
    r.splice(insertAt, 0, null);
    return r;
  });
  const widths = [...grid.columnWidths];
  const insertAt = index < 0 ? widths.length : index;
  widths.splice(insertAt, 0, DEFAULT_COL_WIDTH);
  return { ...grid, data, colCount: grid.colCount + 1, columnWidths: widths };
}

/** Remove column at index */
export function removeColumn(grid: GridState, index: number): GridState {
  if (grid.colCount <= 1) return grid;
  const data = grid.data.map((row) => {
    const r = [...row];
    r.splice(index, 1);
    return r;
  });
  const widths = [...grid.columnWidths];
  widths.splice(index, 1);
  return { ...grid, data, colCount: grid.colCount - 1, columnWidths: widths };
}

/** Fill range with value */
export function fillRange(grid: GridState, range: CellRange, value: CellValue): GridState {
  const data = grid.data.map((row) => [...row]);
  const minR = Math.min(range.start.row, range.end.row);
  const maxR = Math.max(range.start.row, range.end.row);
  const minC = Math.min(range.start.col, range.end.col);
  const maxC = Math.max(range.start.col, range.end.col);
  for (let r = minR; r <= maxR && r < data.length; r++) {
    for (let c = minC; c <= maxC && c < (data[r]?.length ?? 0); c++) {
      if (data[r]) data[r]![c] = value;
    }
  }
  return { ...grid, data };
}

/** Normalize range so start <= end */
export function normalizeRange(range: CellRange): CellRange {
  return {
    start: {
      row: Math.min(range.start.row, range.end.row),
      col: Math.min(range.start.col, range.end.col),
    },
    end: {
      row: Math.max(range.start.row, range.end.row),
      col: Math.max(range.start.col, range.end.col),
    },
  };
}

/** Check if position is within range */
export function isInRange(pos: CellPosition, range: CellRange): boolean {
  const n = normalizeRange(range);
  return (
    pos.row >= n.start.row && pos.row <= n.end.row && pos.col >= n.start.col && pos.col <= n.end.col
  );
}
