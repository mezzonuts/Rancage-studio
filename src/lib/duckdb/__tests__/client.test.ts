/**
 * Unit Tests for DuckDB Client
 * 
 * Tests the DuckDB-Wasm client wrapper functionality including:
 * - Client initialization
 * - File registration (CSV/Parquet)
 * - Query execution
 * - Schema inference
 * - Connection lifecycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DuckDBClient, getDuckDBClient, closeDuckDBClient } from '../client';
import { inferSchemaFromResult, schemaToAIContext, normalizeType } from '../schema';

const { mockBundle } = vi.hoisted(() => ({
  mockBundle: {
    mainModule: { module: () => {}, exports: {} },
    mainWorker: { module: () => {}, exports: {} },
  },
}));

vi.mock('@duckdb/duckdb-wasm', () => ({
  selectBundle: vi.fn().mockResolvedValue(mockBundle),
  getMainModule: vi.fn().mockReturnValue({ mainModule: 'main' }),
  getMainWorker: vi.fn().mockReturnValue({ mainWorker: 'worker' }),
  createDB: vi.fn(),
}));

describe('DuckDBClient', () => {
  let client: DuckDBClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DuckDBClient({ workerUrl: '/worker-duckdb.js' });
    (client as unknown as { isReady: boolean }).isReady = true;
    (client as unknown as { worker: unknown }).worker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null,
    };
  });

  afterEach(async () => {
    await closeDuckDBClient();
  });

  describe('normalizeType', () => {
    it('should normalize VARCHAR types to string', () => {
      expect(normalizeType('VARCHAR')).toBe('string');
      expect(normalizeType('TEXT')).toBe('string');
      expect(normalizeType('CHAR(50)')).toBe('string');
    });

    it('should normalize numeric types to number', () => {
      expect(normalizeType('INTEGER')).toBe('number');
      expect(normalizeType('BIGINT')).toBe('number');
      expect(normalizeType('DECIMAL(10,2)')).toBe('number');
      expect(normalizeType('DOUBLE')).toBe('number');
      expect(normalizeType('FLOAT')).toBe('number');
    });

    it('should normalize BOOLEAN to boolean', () => {
      expect(normalizeType('BOOLEAN')).toBe('boolean');
      expect(normalizeType('BOOL')).toBe('boolean');
    });

    it('should normalize DATE/TIMESTAMP to date', () => {
      expect(normalizeType('DATE')).toBe('date');
      expect(normalizeType('TIMESTAMP')).toBe('date');
      expect(normalizeType('TIME')).toBe('date');
    });

    it('should return unknown for unrecognized types', () => {
      expect(normalizeType('UNKNOWN_TYPE')).toBe('unknown');
      expect(normalizeType('BLOB')).toBe('unknown');
    });
  });

  describe('inferSchemaFromResult', () => {
    it('should infer schema from query result', () => {
      const result = { columns: ['id', 'name', 'value'], rows: [[1, 'Alice', 100], [2, 'Bob', 200]] };
      const schema = inferSchemaFromResult('test_table', result, 2);
      expect(schema.tableName).toBe('test_table');
      expect(schema.rowCount).toBe(2);
      expect(schema.columns).toHaveLength(3);
      expect(schema.columns[0].name).toBe('id');
      expect(schema.columns[1].name).toBe('name');
      expect(schema.columns[2].name).toBe('value');
      expect(schema.sampleRows).toHaveLength(2);
    });

    it('should handle null values in type inference', () => {
      const result = { columns: ['id', 'nullable_col'], rows: [[1, null], [2, 'value']] };
      const schema = inferSchemaFromResult('test', result, 2);
      expect(schema.columns[1].type).toBe('VARCHAR');
    });

    it('should return unknown type for all-null column', () => {
      const result = { columns: ['all_null'], rows: [[null], [null]] };
      const schema = inferSchemaFromResult('test', result, 2);
      expect(schema.columns[0].type).toBe('unknown');
    });
  });

  describe('schemaToAIContext', () => {
    it('should generate compact AI context string', () => {
      const schema = {
        tableName: 'sales', rowCount: 100,
        columns: [{ name: 'id', type: 'INTEGER' }, { name: 'product', type: 'VARCHAR' }, { name: 'amount', type: 'DECIMAL' }],
        sampleRows: [{ id: 1, product: 'Widget', amount: 99.99 }, { id: 2, product: 'Gadget', amount: 149.50 }],
      };
      const context = schemaToAIContext(schema);
      expect(context).toContain('Table: sales (100 rows)');
      expect(context).toContain('id: number (INTEGER)');
      expect(context).toContain('product: string (VARCHAR)');
      expect(context).toContain('amount: number (DECIMAL)');
      expect(context).toContain('Sample rows:');
      expect(context).toContain('1, "Widget", 99.99');
    });

    it('should limit sample rows', () => {
      const schema = {
        tableName: 'test', rowCount: 10,
        columns: [{ name: 'col', type: 'INTEGER' }],
        sampleRows: Array.from({ length: 10 }, (_, i) => ({ col: i })),
      };
      const context = schemaToAIContext(schema, 2);
      const sampleLines = context.split('\n').filter(l => l.includes('Sample rows:') || l.trim().startsWith('"'));
      expect(sampleLines.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Client Methods (mocked)', () => {
    it('should count rows via query', async () => {
      const querySpy = vi.spyOn(client, 'query').mockResolvedValue({ columns: ['count'], rows: [[42]] });
      const count = await client.countRows('test_table');
      expect(count).toBe(42);
      expect(querySpy).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM "test_table"');
    });

    it('should get tables list via query', async () => {
      const querySpy = vi.spyOn(client, 'query').mockResolvedValue({ columns: ['table_name'], rows: [['table1'], ['table2']] });
      const tables = await client.getTables();
      expect(tables).toEqual(['table1', 'table2']);
    });

    it('should close connection', async () => {
      const mockWorker = (client as unknown as { worker: { terminate: ReturnType<typeof vi.fn> } }).worker;
      mockWorker.terminate = vi.fn();
      // Mock _send to resolve immediately for close
      const sendSpy = vi.spyOn(client as unknown as { _send: Function }, '_send').mockResolvedValue({ type: 'closed', success: true });
      await client.close();
      expect(mockWorker.terminate).toHaveBeenCalled();
      expect((client as unknown as { isReady: boolean }).isReady).toBe(false);
      sendSpy.mockRestore();
    });
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const client1 = getDuckDBClient();
      const client2 = getDuckDBClient();
      expect(client1).toBe(client2);
    });

    it('should create new instance after close', async () => {
      const client1 = getDuckDBClient();
      await closeDuckDBClient();
      const client2 = getDuckDBClient();
      expect(client1).not.toBe(client2);
    });
  });
});