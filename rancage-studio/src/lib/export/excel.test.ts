import { describe, it, expect } from 'vitest';
import { exportToExcel, downloadBlob } from './excel';
import type { ExcelExportData } from './excel';

describe('Excel Exporter', () => {
  it('generates valid xlsx blob', async () => {
    const data: ExcelExportData = {
      sheetName: 'Test',
      headers: ['Name', 'Amount'],
      rows: [
        ['Alice', 100],
        ['Bob', 200],
      ],
    };
    const blob = await exportToExcel(data);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('spreadsheetml');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('includes formulas', async () => {
    const data: ExcelExportData = {
      sheetName: 'Formulas',
      headers: ['A', 'B', 'Sum'],
      rows: [[10, 20, '']],
      formulas: [{ row: 0, col: 2, formula: 'A2+B2' }],
    };
    const blob = await exportToExcel(data);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('handles empty data', async () => {
    const data: ExcelExportData = {
      sheetName: 'Empty',
      headers: ['Col1'],
      rows: [],
    };
    const blob = await exportToExcel(data);
    expect(blob.size).toBeGreaterThan(0);
  });
});
