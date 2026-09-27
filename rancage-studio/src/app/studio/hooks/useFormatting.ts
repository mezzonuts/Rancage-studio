import { useCallback } from 'react';
import type { CellRange, CellFormat } from '@/lib/grid/types';
import { normalizeRange, cellRef } from '@/lib/grid/store';

export function useFormatting(
  cellFormats: Record<string, CellFormat>,
  setCellFormats: React.Dispatch<React.SetStateAction<Record<string, CellFormat>>>,
  selectedRange: CellRange | null,
) {
  const applyFormat = useCallback(
    (format: Partial<CellFormat>) => {
      if (!selectedRange) return;
      const nr = normalizeRange(selectedRange);
      setCellFormats((prev) => {
        const next = { ...prev };
        for (let r = nr.start.row; r <= nr.end.row; r++) {
          for (let c = nr.start.col; c <= nr.end.col; c++) {
            const ref = cellRef(r, c);
            next[ref] = { ...next[ref], ...format };
          }
        }
        return next;
      });
    },
    [selectedRange, setCellFormats],
  );

  const toggleBold = useCallback(() => applyFormat({ bold: true }), [applyFormat]);
  const toggleItalic = useCallback(() => applyFormat({ italic: true }), [applyFormat]);
  const toggleUnderline = useCallback(() => applyFormat({ underline: true }), [applyFormat]);
  const toggleStrikethrough = useCallback(() => applyFormat({ strikethrough: true }), [applyFormat]);
  const setTextAlign = useCallback((align: 'left' | 'center' | 'right') => applyFormat({ textAlign: align }), [applyFormat]);
  const setVerticalAlign = useCallback((align: 'top' | 'middle' | 'bottom') => applyFormat({ verticalAlign: align }), [applyFormat]);
  const setWrapText = useCallback((wrap: boolean) => applyFormat({ wrapText: wrap }), [applyFormat]);
  const setFontFamily = useCallback((family: string) => applyFormat({ fontFamily: family }), [applyFormat]);
  const setFontSize = useCallback((size: number) => applyFormat({ fontSize: size }), [applyFormat]);
  const setNumberFormat = useCallback((format: string) => applyFormat({ numberFormat: format }), [applyFormat]);
  const setBgColor = useCallback((color: string) => applyFormat({ bgColor: color }), [applyFormat]);
  const setTextColor = useCallback((color: string) => applyFormat({ color }), [applyFormat]);

  return {
    applyFormat,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    setTextAlign,
    setVerticalAlign,
    setWrapText,
    setFontFamily,
    setFontSize,
    setNumberFormat,
    setBgColor,
    setTextColor,
  };
}

export type UseFormattingReturn = ReturnType<typeof useFormatting>;