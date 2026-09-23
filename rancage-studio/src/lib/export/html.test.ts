import { describe, it, expect } from 'vitest';
import { buildStandaloneHTML, downloadHTML } from './html';
import type { HTMLExportConfig } from './html';

describe('HTML Exporter', () => {
  const config: HTMLExportConfig = {
    title: 'Sales Dashboard',
    datasets: [
      {
        name: 'sales',
        data: [
          { month: 'Jan', revenue: 1000 },
          { month: 'Feb', revenue: 2000 },
        ],
      },
    ],
    charts: [
      { type: 'bar', title: 'Revenue', datasetIndex: 0, xField: 'month', yField: 'revenue' },
    ],
  };

  it('generates valid HTML string', () => {
    const html = buildStandaloneHTML(config);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Sales Dashboard');
    expect(html).toContain('echarts');
    expect(html).toContain('"revenue"');
  });

  it('includes dataset as JSON', () => {
    const html = buildStandaloneHTML(config);
    expect(html).toContain('Jan');
    expect(html).toContain('1000');
  });

  it('respects maxDataSize', () => {
    const bigData = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));
    const bigConfig: HTMLExportConfig = {
      ...config,
      datasets: [{ name: 'big', data: bigData }],
      maxDataSize: 1000,
    };
    const html = buildStandaloneHTML(bigConfig);
    expect(html.length).toBeLessThan(50000); // truncated significantly
  });

  it('escapes HTML in title', () => {
    const xss: HTMLExportConfig = { ...config, title: '<script>alert(1)</script>' };
    const html = buildStandaloneHTML(xss);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles empty datasets', () => {
    const empty: HTMLExportConfig = {
      ...config,
      datasets: [{ name: 'empty', data: [] }],
    };
    const html = buildStandaloneHTML(empty);
    expect(html).toContain('<!DOCTYPE html>');
  });
});
