import { describe, it, expect } from 'vitest';
import { tableToContext, buildAIContext, estimateTokens, createTableContext } from './context';
import type { TableContext } from './context';
import type { ColumnSchema } from '@/lib/duckdb/client';

const salesColumns: ColumnSchema[] = [
  { name: 'id', type: 'INTEGER' },
  { name: 'product', type: 'VARCHAR' },
  { name: 'amount', type: 'DOUBLE' },
  { name: 'sale_date', type: 'DATE' },
];

const salesRows: Record<string, unknown>[] = [
  { id: 1, product: 'Widget', amount: 29.99, sale_date: '2024-01-15' },
  { id: 2, product: 'Gadget', amount: 49.99, sale_date: '2024-01-16' },
  { id: 3, product: 'Thingamajig', amount: 15.5, sale_date: '2024-01-17' },
];

const salesTable: TableContext = {
  tableName: 'sales',
  columns: salesColumns,
  rowCount: 1000,
  sampleRows: salesRows,
};

describe('tableToContext', () => {
  it('includes table name and row count', () => {
    const ctx = tableToContext(salesTable);
    expect(ctx).toContain('## Table: sales (1000 rows)');
  });

  it('lists all columns with types', () => {
    const ctx = tableToContext(salesTable);
    expect(ctx).toContain('- id (INTEGER)');
    expect(ctx).toContain('- product (VARCHAR)');
    expect(ctx).toContain('- amount (DOUBLE)');
    expect(ctx).toContain('- sale_date (DATE)');
  });

  it('shows sample rows in CSV format', () => {
    const ctx = tableToContext(salesTable);
    expect(ctx).toContain('id | product | amount | sale_date');
    expect(ctx).toContain('"Widget"');
    expect(ctx).toContain('29.99');
  });

  it('respects maxSampleRows', () => {
    const ctx = tableToContext(salesTable, 1);
    const lines = ctx.split('\n');
    const dataLines = lines.filter(
      (l) => l.includes('|') && !l.startsWith('##') && !l.startsWith('Col')
    );
    expect(dataLines.length).toBe(2); // header + 1 data row
  });

  it('handles empty sample rows', () => {
    const empty: TableContext = { ...salesTable, sampleRows: [] };
    const ctx = tableToContext(empty);
    expect(ctx).toContain('## Table: sales');
    expect(ctx).not.toContain('Sample data');
  });

  it('truncates long string values', () => {
    const longStr = 'x'.repeat(100);
    const ctx = tableToContext({
      ...salesTable,
      sampleRows: [{ id: 1, product: longStr, amount: 1, sale_date: '2024-01-01' }],
    });
    expect(ctx).toContain('...');
  });
});

describe('buildAIContext', () => {
  it('returns empty string for no tables', () => {
    expect(buildAIContext([])).toBe('');
  });

  it('includes table count header', () => {
    const ctx = buildAIContext([salesTable]);
    expect(ctx).toContain('You have access to 1 table');
  });

  it('lists multiple tables with counts', () => {
    const usersTable: TableContext = {
      tableName: 'users',
      columns: [{ name: 'id', type: 'INTEGER' }],
      rowCount: 500,
      sampleRows: [{ id: 1 }],
    };
    const ctx = buildAIContext([salesTable, usersTable]);
    expect(ctx).toContain('2 tables');
    expect(ctx).toContain('- sales (1000 rows, 4 columns)');
    expect(ctx).toContain('- users (500 rows, 1 columns)');
  });

  it('respects maxChars by truncating', () => {
    const ctx = buildAIContext([salesTable, salesTable, salesTable], { maxChars: 200 });
    expect(ctx).toContain('omitted');
  });
});

describe('estimateTokens', () => {
  it('estimates ~4 chars per token', () => {
    expect(estimateTokens('hello')).toBe(2); // 5 chars / 4 = 1.25 → ceil = 2
    expect(estimateTokens('12345678')).toBe(2);
    expect(estimateTokens('')).toBe(0);
  });
});

describe('createTableContext', () => {
  it('creates a TableContext object', () => {
    const result = createTableContext('test', salesColumns, 10, salesRows);
    expect(result.tableName).toBe('test');
    expect(result.rowCount).toBe(10);
    expect(result.columns).toBe(salesColumns);
    expect(result.sampleRows).toBe(salesRows);
  });
});
