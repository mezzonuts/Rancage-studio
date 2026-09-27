import type { CellValue, CellFormat } from '@/lib/grid/types';

export const SAMPLE_DATA: CellValue[][] = [
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null, null],
];

export const DEFAULT_CELL_FORMAT: CellFormat = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  textAlign: 'left',
  verticalAlign: 'bottom',
  wrapText: false,
  fontFamily: 'Inter',
  fontSize: 13,
  numberFormat: 'General',
  color: '#111827',
  bgColor: '#ffffff',
};

export const TABS = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'AI Analyst'];

export type ViewMode = 'spreadsheets' | 'dashboards';
export type AIPanelTab = 'Chat' | 'Replays' | 'Templates' | 'Scripts' | 'Settings';

export interface DashboardState {
  id: string;
  name: string;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'text';
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export interface DashboardCanvasProps {
  dashboard: DashboardState;
  onChange: (d: DashboardState) => void;
  viewMode: ViewMode;
}

export interface DashboardConfig {
  theme: 'light' | 'dark';
  gridSize: number;
}