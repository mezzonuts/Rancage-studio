import { describe, it, expect } from 'vitest';
import { gridToExcelExport, dashboardToHTMLConfig, PerfTimer } from './integration';
import { createDefaultDashboard, createWidget } from '@/lib/dashboard/types';

describe('Integration (T27)', () => {
  it('gridToExcelExport produces correct structure', () => {
    const result = gridToExcelExport(
      ['Name', 'Value'],
      [
        ['A', 1],
        ['B', 2],
      ],
      'Data'
    );
    expect(result.sheetName).toBe('Data');
    expect(result.headers).toEqual(['Name', 'Value']);
    expect(result.rows).toHaveLength(2);
  });

  it('dashboardToHTMLConfig maps widgets to charts', () => {
    const dash = createDefaultDashboard('Test');
    const w = createWidget('bar', 'Sales', 'SELECT *', { xField: 'month', yField: 'revenue' });
    dash.widgets = [w];

    const data = new Map();
    data.set(w.id, { columns: ['month', 'revenue'], rows: [['Jan', 100]] });
    const config = dashboardToHTMLConfig(dash, data);

    expect(config.title).toBe('Test');
    expect(config.datasets).toHaveLength(1);
    expect(config.charts).toHaveLength(1);
    expect(config.charts[0]!.type).toBe('bar');
  });

  it('dashboardToHTMLConfig skips kpi widgets', () => {
    const dash = createDefaultDashboard('Test');
    const kpi = createWidget('kpi', 'Total', 'SELECT 1', { kpiValue: 42 });
    dash.widgets = [kpi];
    const config = dashboardToHTMLConfig(dash, new Map());
    expect(config.charts).toHaveLength(0);
  });
});

describe('PerfTimer', () => {
  it('measures elapsed time', () => {
    const timer = new PerfTimer();
    timer.start('test');
    const elapsed = timer.end('test');
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for unknown label', () => {
    const timer = new PerfTimer();
    expect(timer.end('unknown')).toBe(0);
  });
});
