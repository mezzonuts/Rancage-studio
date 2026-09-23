/**
 * Task 27: E2E Integration — Wire all modules together
 * Task 29: Performance Optimization — Timing helpers
 */

import type { DashboardState } from '@/lib/dashboard/types';
import type { ExcelExportData } from '@/lib/export/excel';
import type { HTMLExportConfig } from '@/lib/export/html';

// ── Pipeline: Data → Grid → Dashboard → Export ──────────────
export interface AppContext {
  gridData: unknown[][];
  gridHeaders: string[];
  dashboard: DashboardState;
}

/** Convert grid data to dashboard widget data for Excel export */
export function gridToExcelExport(
  headers: string[],
  data: unknown[][],
  sheetName = 'Sheet1'
): ExcelExportData {
  return {
    sheetName,
    headers,
    rows: data.map((r) => [...r]),
  };
}

/** Convert dashboard to HTML export config */
export function dashboardToHTMLConfig(
  dash: DashboardState,
  widgetData: Map<string, { columns: string[]; rows: unknown[][] }>
): HTMLExportConfig {
  const datasets: HTMLExportConfig['datasets'] = [];
  const charts: HTMLExportConfig['charts'] = [];

  dash.widgets.forEach((w, i) => {
    const dsName = `dataset_${i}`;
    const d = widgetData.get(w.id);
    if (d) {
      const records = d.rows.map((r) => {
        const obj: Record<string, unknown> = {};
        d.columns.forEach((c, ci) => {
          obj[c] = r[ci];
        });
        return obj;
      });
      datasets.push({ name: dsName, data: records });
    }
    if (w.type !== 'kpi') {
      charts.push({
        type: w.type,
        title: w.title,
        datasetIndex: i,
        xField: w.xField || d?.columns[0] || 'x',
        yField: w.yField || d?.columns[1] || 'y',
      });
    }
  });

  return { title: dash.name, datasets, charts };
}

// ── Performance: Timing ─────────────────────────────────────
export class PerfTimer {
  private marks = new Map<string, number>();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (start === undefined) return 0;
    const elapsed = performance.now() - start;
    this.marks.delete(label);
    return elapsed;
  }

  report(): string {
    return [...this.marks.entries()]
      .map(([label, start]) => `${label}: ${(performance.now() - start).toFixed(1)}ms`)
      .join('\n');
  }
}
