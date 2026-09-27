import { useState, useCallback, useRef } from 'react';
import type { CellValue, CellPosition, CellRange, CellFormat } from '@/lib/grid/types';
import {
  createGridFromData,
  setCell,
  normalizeRange,
  isInRange,
  cellRef,
  colLetter,
} from '@/lib/grid/store';
import { SAMPLE_DATA } from '../utils/constants';

export function useGridState(initialData: CellValue[][] = SAMPLE_DATA) {
  const [grid, setGrid] = useState(() => createGridFromData(initialData));
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>('A1');
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditing = useCallback((row: number, col: number) => {
    const val = grid.data[row]?.[col];
    setEditingCell({ row, col });
    setEditingValue(
      val === null || val === undefined ? '' : String(val),
    );
  }, [grid.data]);

  const commitEditing = useCallback(() => {
    if (!editingCell) return;
    let v: CellValue = editingValue;
    if (editingValue === '' || editingValue === 'null') v = null;
    else if (!isNaN(Number(editingValue)) && editingValue !== '') v = Number(editingValue);
    else if (editingValue === 'true') v = true;
    else if (editingValue === 'false') v = false;

    const ng = setCell(grid, { row: editingCell.row, col: editingCell.col }, v);
    setGrid(ng);
    setEditingCell(null);
    return ng.data;
  }, [editingCell, editingValue, grid]);

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  const applyFormat = useCallback((range: CellRange, format: Partial<CellFormat>) => {
    const nr = normalizeRange(range);
    setCellFormats((prev) => {
      const next = { ...prev };
      for (let r = nr.start.row; r <= nr.end.row; r++) {
        for (let c = nr.start.col; c <= nr.end.col; c++) {
          const ref = `${String.fromCharCode(65 + (c % 26))}${r + 1}`;
          next[ref] = { ...next[ref], ...format };
        }
      }
      return next;
    });
  }, []);

  const getCellFormat = useCallback((ref: string) => cellFormats[ref] ?? null, [cellFormats]);

  return {
    grid,
    setGrid,
    cellFormats,
    setCellFormats,
    selectedCell,
    setSelectedCell,
    selectedRange,
    setSelectedRange,
    editingCell,
    setEditingCell,
    editingValue,
    setEditingValue,
    startEditing,
    commitEditing,
    cancelEditing,
    applyFormat,
    getCellFormat,
  };
}

export type UseGridStateReturn = ReturnType<typeof useGridState>;