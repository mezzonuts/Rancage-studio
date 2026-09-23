import type { ColumnSchema } from '@/lib/duckdb/client';

// ── Types ────────────────────────────────────────────────────
export interface TableContext {
  tableName: string;
  columns: ColumnSchema[];
  rowCount: number;
  sampleRows: Record<string, unknown>[];
}

export interface AIContextOptions {
  /** Max sample rows per table (default: 5) */
  maxSampleRows?: number;
  /** Max total estimated characters (default: 8000) */
  maxChars?: number;
}

// ── Value Formatting ─────────────────────────────────────────
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string')
    return value.length > 50 ? `"${value.slice(0, 47)}..."` : `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// ── Single Table Context ─────────────────────────────────────
/** Convert a single table to compact AI prompt text */
export function tableToContext(table: TableContext, maxSampleRows = 5): string {
  const lines = [`## Table: ${table.tableName} (${table.rowCount} rows)`, 'Columns:'];

  for (const col of table.columns) {
    lines.push(`  - ${col.name} (${col.type})`);
  }

  if (table.sampleRows.length > 0 && table.columns.length > 0) {
    const rows = table.sampleRows.slice(0, maxSampleRows);
    lines.push(`\nSample data (${rows.length} rows):`);

    // CSV-style header
    const headers = table.columns.map((c) => c.name);
    lines.push(headers.join(' | '));

    for (const row of rows) {
      const values = headers.map((h) => formatValue(row[h]));
      lines.push(values.join(' | '));
    }
  }

  return lines.join('\n');
}

// ── Multi-Table AI Context ───────────────────────────────────
/** Build compact AI prompt context from multiple tables */
export function buildAIContext(tables: TableContext[], options: AIContextOptions = {}): string {
  const { maxSampleRows = 5, maxChars = 8000 } = options;

  if (tables.length === 0) return '';

  const sections: string[] = [
    `You have access to ${tables.length} table${tables.length !== 1 ? 's' : ''} in the dataset:\n`,
  ];

  // List all table names and row counts
  const tableList = tables.map(
    (t) => `- ${t.tableName} (${t.rowCount} rows, ${t.columns.length} columns)`
  );
  sections.push(tableList.join('\n'));
  sections.push('');

  // Add table details
  let charCount = sections.join('').length;

  for (const table of tables) {
    const ctx = tableToContext(table, maxSampleRows);
    if (charCount + ctx.length > maxChars) {
      // Truncate — add partial info
      const remaining = maxChars - charCount;
      if (remaining > 100) {
        sections.push(ctx.slice(0, remaining));
        sections.push('\n[Context truncated — increase maxChars for full data]');
      } else {
        sections.push('\n[Additional tables omitted — increase maxChars for full context]');
      }
      break;
    }
    sections.push(ctx);
    sections.push('');
    charCount += ctx.length + 1;
  }

  return sections.join('\n');
}

// ── Helpers ──────────────────────────────────────────────────
/** Estimate character count for token planning (~4 chars per token) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Create TableContext from raw query results */
export function createTableContext(
  tableName: string,
  columns: ColumnSchema[],
  rowCount: number,
  sampleRows: Record<string, unknown>[]
): TableContext {
  return { tableName, columns, rowCount, sampleRows };
}
