import { useCallback, useRef } from 'react';
import type { CellValue, CellFormat, CellRange, CellPosition } from '@/lib/grid/types';
import { normalizeRange, cellRef, parseRef } from '@/lib/grid/store';
import { SAMPLE_DATA } from '../utils/constants';

interface ClipboardData {
  data: CellValue[][];
  formats: Record<string, CellFormat>;
  range: CellRange;
  cut: boolean;
}

export function useClipboard(
  gridData: CellValue[][],
  cellFormats: Record<string, CellFormat>,
  selectedRange: CellRange | null,
  selectedCell: string | null,
  onGridChange: (data: CellValue[][]) => void,
  onFormatChange: (range: CellRange, format: Partial<CellFormat>) => void,
) {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const copy = useCallback(() => {
    if (!selectedRange) return;
    const nr = normalizeRange(selectedRange);
    const rows: CellValue[][] = [];
    const fmtMap: Record<string, CellFormat> = {};

    for (let r = nr.start.row; r <= nr.end.row; r++) {
      const row: CellValue[] = [];
      for (let c = nr.start.col; c <= nr.end.col; c++) {
        row.push(gridData[r]?.[c] ?? null);
        const ref = gridCellRef(r, c);
        if (cellFormats[ref]) fmtMap[`${r - nr.start.row},${c - nr.start.col}`] = cellFormats[ref]!;
      }
      rows.push(row);
    }

    clipboardRef.current = { data: rows, formats: fmtMap, range: nr, cut: false };
    const tsv = rows.map((r) => r.map((v) => (v === null ? '' : String(v))).join('\t')).join('\n');
    navigator.clipboard?.writeText(tsv).catch(() => {});
  }, [selectedRange, gridData, cellFormats]);

  const cut = useCallback(() => {
    if (!selectedRange) return;
    copy();
    const nr = normalizeRange(selectedRange);
    const newData = gridData.map((r) => [...r]);
    for (let r = nr.start.row; r <= nr.end.row; r++) {
      for (let c = nr.start.col; c <= nr.end.col; c++) {
        if (newData[r]) newData[r]![c] = null;
      }
    }
    onGridChange(newData);
  }, [selectedRange, gridData, copy, onGridChange]);

  const paste = useCallback(async () => {
    if (!selectedCell) return;
    const pos = parseRef(selectedCell);
    if (!pos) return;

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const lines = text.split('\n').filter((l) => l.length > 0);
        const newData = gridData.map((r) => [...r]);
        for (let r = 0; r < lines.length; r++) {
          const cells = lines[r]!.split('\t');
          for (let c = 0; c < cells.length; c++) {
            const dr = pos.row + r;
            const dc = pos.col + c;
            if (!newData[dr]) continue;
            let v: CellValue = cells[c] ?? '';
            if (v !== '' && !isNaN(Number(v))) v = Number(v);
            newData[dr]![dc] = v;
          }
        }
        onGridChange(newData);
        return;
      }
    } catch {}

    if (clipboardRef.current) {
      const { data: clipData, formats: clipFormats } = clipboardRef.current;
      const newData = gridData.map((r) => [...r]);
      const newFormats = { ...cellFormats };
      for (let r = 0; r < clipData.length; r++) {
        for (let c = 0; c < clipData[r]!.length; c++) {
          const dr = pos.row + r;
          const dc = pos.col + c;
          if (!newData[dr]) continue;
          newData[dr]![dc] = clipData[r]![c] ?? null;
          const srcKey = `${r},${c}`;
          const dstRef = gridCellRef(dr, dc);
          if (clipFormats[srcKey]) newFormats[dstRef] = { ...clipFormats[srcKey] };
        }
      }
      onGridChange(newData);
      // Note: formats would need separate handling
    }
  }, [selectedCell, gridData, cellFormats, onGridChange]);

  const clearClipboard = useCallback(() => {
    clipboardRef.current = null;
  }, []);

  return { copy, cut, paste, clearClipboard, clipboardRef };
}

export type UseClipboardReturn = ReturnType<typeof useClipboard>;