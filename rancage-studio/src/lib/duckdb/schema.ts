/**
 * Schema Inference Utilities
 *
 * Provides utilities for inferring working with table schemas
 * from DuckDB query results.
 */

import type { QueryResult, ColumnSchema } from './client';

export interface InferredSchema {
  tableName: string;
  columns: ColumnSchema[];
  rowCount: number;
  sampleRows: Record<string, unknown>[];
}

export interface ColumnProfile {
  name: string;
  type: string;
  nullable: boolean;
  uniqueCount: number;
  nullCount: number;
  min?: string | number | Date;
  max?: string | number | Date;
  sampleValues: unknown[];
}

export function normalizeType(
  duckdbType: string
): 'string' | 'number' | 'boolean' | 'date' | 'unknown' {
  const type = duckdbType.toUpperCase();
  if (
    type.includes('VARCHAR') ||
    type.includes('TEXT') ||
    type.includes('CHAR') ||
    type.includes('STRING')
  )
    return 'string';
  if (
    type.includes('INT') ||
    type.includes('DECIMAL') ||
    type.includes('NUMERIC') ||
    type.includes('FLOAT') ||
    type.includes('DOUBLE') ||
    type.includes('REAL') ||
    type.includes('NUMBER')
  )
    return 'number';
  if (type.includes('BOOL')) return 'boolean';
  if (type.includes('DATE') || type.includes('TIME') || type.includes('TIMESTAMP')) return 'date';
  return 'unknown';
}

export function inferSchemaFromResult(
  tableName: string,
  result: QueryResult,
  rowCount: number
): InferredSchema {
  const columns: ColumnSchema[] = result.columns.map((name, index) => {
    let type = 'unknown';
    for (const row of result.rows) {
      const value = row[index];
      if (value === null || value === undefined) continue;
      if (typeof value === 'number') {
        type = 'number';
        break;
      }
      if (typeof value === 'boolean') {
        type = 'boolean';
        break;
      }
      if (value instanceof Date) {
        type = 'TIMESTAMP';
        break;
      }
      if (typeof value === 'string') {
        type = 'VARCHAR';
        break;
      }
    }
    return { name, type };
  });

  const sampleRows = result.rows.slice(0, 5).map((row) => {
    const obj: Record<string, unknown> = {};
    result.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });

  return { tableName, columns, rowCount, sampleRows };
}

export function schemaToAIContext(schema: InferredSchema, maxSampleRows = 3): string {
  const lines = [`Table: ${schema.tableName} (${schema.rowCount} rows)`, 'Columns:'];
  for (const col of schema.columns) {
    const normType = normalizeType(col.type);
    lines.push(` - ${col.name}: ${normType} (${col.type})`);
  }
  if (schema.sampleRows.length > 0) {
    lines.push('\nSample rows:');
    for (const row of schema.sampleRows.slice(0, maxSampleRows)) {
      const values = schema.columns.map((c) => row[c.name]);
      lines.push(`  ${values.map((v) => formatValue(v)).join(', ')}`);
    }
  }
  return lines.join('\n');
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function profileColumn(
  client: { query: (sql: string) => Promise<QueryResult> },
  tableName: string,
  columnName: string,
  columnType: string
): Promise<ColumnProfile> {
  const normType = normalizeType(columnType);
  const queries: string[] = [];

  queries.push(
    `SELECT COUNT(*) total, COUNT("${columnName}") non_null, COUNT(DISTINCT "${columnName}") unique_count FROM "${tableName}"`
  );

  if (normType === 'number') {
    queries.push(
      `SELECT MIN("${columnName}") min_val, MAX("${columnName}") as max_val, AVG("${columnName}") avg_val FROM "${tableName}"`
    );
  } else if (normType === 'string') {
    queries.push(
      `SELECT MIN(LENGTH("${columnName}")) min_len, MAX(LENGTH("${columnName}")) max_len, AVG(LENGTH("${columnName}")) avg_len FROM "${tableName}"`
    );
  } else if (normType === 'date') {
    queries.push(
      `SELECT MIN("${columnName}") min_date, MAX("${columnName}") max_date FROM "${tableName}"`
    );
  }

  queries.push(
    `SELECT DISTINCT "${columnName}" sample_val FROM "${tableName}" WHERE "${columnName}" IS NOT NULL LIMIT 10`
  );

  const results = await Promise.all(queries.map((q) => client.query(q)));
  const basic = results[0]?.rows[0] ?? [];
  const total = Number(basic[0] ?? 0);
  const nonNull = Number(basic[1] ?? 0);
  const uniqueCount = Number(basic[2] ?? 0);
  const nullCount = total - nonNull;

  let min: string | number | Date | undefined;
  let max: string | number | Date | undefined;
  let sampleValues: unknown[] = [];

  if (results[1]) {
    const stats = results[1].rows[0] ?? [];
    if (normType === 'number') {
      min = Number(stats[0] ?? 0);
      max = Number(stats[1] ?? 0);
    } else if (normType === 'date') {
      min = stats[0] ? new Date(String(stats[0])) : undefined;
      max = stats[1] ? new Date(String(stats[1])) : undefined;
    }
  }

  const lastResult = results[results.length - 1];
  if (lastResult) {
    sampleValues = lastResult.rows.map((r) => r[0]);
  }

  return {
    name: columnName,
    type: columnType,
    nullable: nullCount > 0,
    uniqueCount,
    nullCount,
    min,
    max,
    sampleValues,
  };
}

export function generateCreateTable(schema: InferredSchema): string {
  const cols = schema.columns.map((c) => `  "${c.name}" ${c.type}`).join(',\n');
  return `CREATE TABLE "${schema.tableName}" (\n${cols}\n)`;
}
export interface SampleClient {
  query: (sql: string) => Promise<QueryResult>;
  getSchema: (tableName: string) => Promise<ColumnSchema[]>;
  getSample: (tableName: string, limit?: number) => Promise<QueryResult>;
}

export async function getSampleWithSchema(
  client: SampleClient,
  tableName: string,
  limit = 10
): Promise<{
  tableName: string;
  rowCount: number;
  sampleCount: number;
  columns: ColumnSchema[];
  rows: Record<string, unknown>[];
} | null> {
  const sample = await client.getSample(tableName, limit);
  if (!sample.columns.length) return null;

  const schema = await client.getSchema(tableName);
  const totalRows = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
  const rowCount = Number(totalRows.rows[0]?.[0] ?? 0);

  const sampleRows = sample.rows.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    sample.columns.forEach((colName: string, i: number) => {
      obj[colName] = row[i];
    });
    return obj;
  });

  return {
    tableName,
    rowCount,
    sampleCount: sample.rows.length,
    columns: schema,
    rows: sampleRows,
  };
}
