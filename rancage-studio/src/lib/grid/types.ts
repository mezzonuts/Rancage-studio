// ── Grid Data Types ──────────────────────────────────────────
export type CellValue = string | number | boolean | null;

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrapText?: boolean;
  fontFamily?: string;
  fontSize?: number;
  numberFormat?: string;
  color?: string;
  bgColor?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export interface GridState {
  data: CellValue[][];
  rowCount: number;
  colCount: number;
  columnWidths: number[];
  selectedRange: CellRange | null;
  editingCell: CellPosition | null;
  editValue: string;
}

export interface GridOperation {
  type: 'set_cell' | 'add_row' | 'remove_row' | 'add_col' | 'remove_col';
  payload: unknown;
}

export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 28;
export const HEADER_HEIGHT = 32;
export const ROW_HEADER_WIDTH = 48;
