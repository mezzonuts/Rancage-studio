import { useCallback } from 'react';
import { addRow, removeRow, addColumn, removeColumn } from '@/lib/grid/store';

export function useRowsCols(
  grid: { data: CellValue[][]; rowCount: number; colCount: number; columnWidths: number[] },
  setGrid: React.Dispatch<React.SetStateAction<{ data: CellValue[][]; rowCount: number; colCount: number; columnWidths: number[] }>>,
) {
  const insertRowAbove = useCallback(() => {
    const newGrid = addRow(grid, 0);
    setGrid(newGrid);
  }, [grid, setGrid]);

  const insertRowBelow = useCallback(() => {
    const newGrid = addRow(grid, grid.rowCount);
    setGrid(newGrid);
  }, [grid, setGrid]);

  const deleteRow = useCallback(() => {
    if (grid.rowCount <= 1) return;
    const newGrid = removeRow(grid, grid.rowCount - 1);
    setGrid(newGrid);
  }, [grid, setGrid]);

  const insertColLeft = useCallback(() => {
    const newGrid = addColumn(grid, 0);
    setGrid(newGrid);
  }, [grid, setGrid]);

  const insertColRight = useCallback(() => {
    const newGrid = addColumn(grid, grid.colCount);
    setGrid(newGrid);
  }, [grid, setGrid]);

  const deleteCol = useCallback(() => {
    if (grid.colCount <= 1) return;
    const newGrid = removeColumn(grid, grid.colCount - 1);
    setGrid(newGrid);
  }, [grid, setGrid]);

  return {
    insertRowAbove,
    insertRowBelow,
    deleteRow,
    insertColLeft,
    insertColRight,
    deleteCol,
  };
}

export type UseRowsColsReturn = ReturnType<typeof useRowsCols>;