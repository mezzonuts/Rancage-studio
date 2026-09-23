// ── Dashboard Types ──────────────────────────────────────────
export type WidgetType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'kpi';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  // grid placement (CSS Grid area)
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  // data binding
  sql: string;
  // chart-specific
  xField?: string;
  yField?: string;
  seriesField?: string;
  valueField?: string;
  // kpi-specific
  kpiValue?: number;
  kpiPrevValue?: number;
  kpiFormat?: 'number' | 'currency' | 'percent';
}

export interface SlicerConfig {
  id: string;
  type: 'date-range' | 'multi-select';
  column: string;
  tableName: string;
  label: string;
}

export interface DashboardState {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  slicers: SlicerConfig[];
  // active filter values from slicers
  filters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultDashboard(name = 'New Dashboard'): DashboardState {
  return {
    id: crypto.randomUUID(),
    name,
    widgets: [],
    slicers: [],
    filters: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createWidget(
  type: WidgetType,
  title: string,
  sql: string,
  opts: Partial<WidgetConfig> = {}
): WidgetConfig {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    sql,
    col: 0,
    row: 0,
    colSpan: 1,
    rowSpan: 1,
    ...opts,
  };
}
