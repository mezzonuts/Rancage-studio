import { useCallback, useEffect } from 'react';
import type { CellRange, CellFormat } from '@/lib/grid/types';
import { cellRef } from '@/lib/grid/store';

export function useKeyboardShortcuts(
  editingCell: { row: number; col: number } | null,
  selectedRange: CellRange | null,
  cellFormats: Record<string, CellFormat>,
  onFormatChange: (range: CellRange, format: Partial<CellFormat>) => void,
  onCommitEdit: () => void,
  onCancelEdit: () => void,
  onStartEdit: (pos: { row: number; col: number }) => void,
  onDeleteCell: (pos: { row: number; col: number }) => void,
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !editingCell && selectedRange) {
        const ref = cellRef(selectedRange.start);
        if (onFormatChange && selectedRange) {
          if (e.key === 'b') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(selectedRange, { bold: !cur?.bold });
            return;
          }
          if (e.key === 'i') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(selectedRange, { italic: !cur?.italic });
            return;
          }
          if (e.key === 'u') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(selectedRange, { underline: !cur?.underline });
            return;
          }
        }
      }

      if (editingCell) {
        if (e.key === 'Enter') {
          onCommitEdit();
          e.preventDefault();
        } else if (e.key === 'Escape') {
          onCancelEdit();
        } else if (e.key === 'Tab') {
          onCommitEdit();
          e.preventDefault();
        }
        return;
      }

      if (!selectedRange) return;
      const pos = selectedRange.start;

      if (e.key === 'Enter' || e.key === 'F2') {
        onStartEdit(pos);
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteCell(pos);
      }
    },
    [editingCell, selectedRange, cellFormats, onFormatChange, onCommitEdit, onCancelEdit, onStartEdit, onDeleteCell],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as EventListener);
    return () => window.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [handleKeyDown]);
}

export type UseKeyboardReturn = void;