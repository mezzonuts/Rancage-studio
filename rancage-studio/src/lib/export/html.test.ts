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

  it('generates valid HTML string', async () => {
    const html = await buildStandaloneHTML(config);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Sales Dashboard');
    expect(html).toContain('echarts');
    expect(html).toContain('"revenue"');
  });

  it('includes dataset as JSON', async () => {
    const html = await buildStandaloneHTML(config);
    expect(html).toContain('Jan');
    expect(html).toContain('1000');
  });

  it('respects maxDataSize', async () => {
    const bigData = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));
    const bigConfig: HTMLExportConfig = {
      ...config,
      datasets: [{ name: 'big', data: bigData }],
      maxDataSize: 1000,
    };
    const html = await buildStandaloneHTML(bigConfig);
    expect(html.length).toBeLessThan(50000); // truncated significantly
  });

  it('escapes HTML in title', async () => {
    const xss: HTMLExportConfig = { ...config, title: '<script>alert(1)</script>' };
    const html = await buildStandaloneHTML(xss);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('<script>');
  });

  it('handles empty datasets', async () => {
    const empty: HTMLExportConfig = {
      ...config,
      datasets: [{ name: 'empty', data: [] }],
    };
    const html = await buildStandaloneHTML(empty);
    expect(html).toContain('<!DOCTYPE html>');
  });
});