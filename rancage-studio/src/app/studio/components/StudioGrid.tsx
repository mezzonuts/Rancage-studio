'use client';

import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { FormulaBar } from '@/components/FormulaBar';
import type { CellValue, CellRange, CellFormat } from '@/lib/grid/types';

export interface StudioGridProps {
  data: CellValue[][];
  onDataChange: (data: CellValue[][]) => void;
  onCellSelect: (ref: string) => void;
  cellFormats: Record<string, CellFormat>;
  onFormatChange: (range: CellRange, format: Partial<CellFormat>) => void;
  onSelectionFormat: (format: CellFormat | null) => void;
  selectedCell: string | null;
  selectedRange: CellRange | null;
  showGridlines: boolean;
  showHeadings: boolean;
  showFormulaBar: boolean;
  zoom: number;
  formulaBarValue: string;
  onFormulaBarChange: (value: string) => void;
  onFormulaBarSubmit: () => void;
  formatPainterActive: boolean;
  onFormatPainterClick: (ref: string) => void;
}

export function StudioGrid({
  data,
  onDataChange,
  onCellSelect,
  cellFormats,
  onFormatChange,
  onSelectionFormat,
  selectedCell,
  selectedRange,
  showGridlines,
  showHeadings,
  showFormulaBar,
  zoom,
  formulaBarValue,
  onFormulaBarChange,
  onFormulaBarSubmit,
  formatPainterActive,
  onFormatPainterClick,
}: StudioGridProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {showFormulaBar && (
        <FormulaBar
          value={''}
          onChange={() => {}}
          onSubmit={() => {}}
        />
      )}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <SpreadsheetGrid
          data={data}
          onDataChange={onDataChange}
          onCellSelect={onCellSelect}
          cellFormats={cellFormats}
          onFormatChange={onFormatChange}
          onSelectionFormat={onSelectionFormat}
          showGridlines={showGridlines}
          showHeadings={showHeadings}
          formatPainterActive={false}
        />
      </div>
    </div>
  );
}