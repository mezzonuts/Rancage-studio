/**
 * DuckDB-Wasm Client Wrapper
 *
 * Direct async API over DuckDB-Wasm using AsyncDuckDB (no custom worker protocol).
 * Handles engine lifecycle, file registration, query execution, and schema inference.
 */

import {
  AsyncDuckDB,
  ConsoleLogger,
  createWorker,
  getJsDelivrBundles,
  selectBundle,
} from '@duckdb/duckdb-wasm';
import type { DuckDBBundle } from '@duckdb/duckdb-wasm';

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface ColumnSchema {
  name: string;
  type: string;
}

export interface DuckDBClientConfig {
  bundle?: DuckDBBundle;
}

/**
 * DuckDB Client - Main entry point for DuckDB operations.
 */
export class DuckDBClient {
  private db: AsyncDuckDB | null = null;
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  constructor(private config: DuckDBClientConfig = {}) {}

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    const bundle = this.config.bundle ?? (await selectBundle(getJsDelivrBundles()));

    if (!bundle.mainWorker) throw new Error('DuckDB bundle missing mainWorker');
    const worker = await createWorker(bundle.mainWorker);
    const logger = new ConsoleLogger();
    this.db = new AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.mainWorker);

    // CSV and Parquet extensions are pre-bundled in duckdb-wasm 1.33+
    // No INSTALL/LOAD needed — avoids CDN fetch that fails offline
    this.isReady = true;
  }

  private async _ensureReady(): Promise<void> {
    if (!this.isReady) await this.initialize();
    if (!this.isReady || !this.db) throw new Error('DuckDB not ready');
  }

  async registerFile(
    name: string,
    data: ArrayBuffer | Uint8Array,
    extension?: 'csv' | 'parquet'
  ): Promise<void> {
    await this._ensureReady();

    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    await this.db!.registerFileBuffer(name, bytes);

    const ext = extension || (name.endsWith('.parquet') ? 'parquet' : 'csv');
    const source = ext === 'parquet' ? `read_parquet('${name}')` : `read_csv_auto('${name}')`;

    const conn = await this.db!.connect();
    try {
      await conn.query(`CREATE OR REPLACE TABLE "${name}" AS SELECT * FROM ${source}`);
    } finally {
      await conn.close();
    }
  }

  async query(sql: string): Promise<QueryResult> {
    await this._ensureReady();
    const conn = await this.db!.connect();
    try {
      const result = await conn.query(sql);
      const columns = result.schema.fields.map((f) => f.name);
      const rows = result.toArray().map((row) => {
        const record = row as Record<string, unknown>;
        return columns.map((col) => record[col]);
      });
      return { columns, rows };
    } finally {
      await conn.close();
    }
  }

  async getSchema(tableName: string): Promise<ColumnSchema[]> {
    await this._ensureReady();
    const conn = await this.db!.connect();
    try {
      const result = await conn.query(`DESCRIBE "${tableName}"`);
      return result.toArray().map((row) => {
        const record = row as Record<string, unknown>;
        return {
          name: String(record['column_name']),
          type: String(record['column_type']),
        };
      });
    } finally {
      await conn.close();
    }
  }

  async countRows(tableName: string): Promise<number> {
    const result = await this.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return Number(result.rows[0]?.[0] ?? 0);
  }

  async getSample(tableName: string, limit = 10): Promise<QueryResult> {
    await this._ensureReady();
    const count = await this.countRows(tableName);
    if (count === 0) return { columns: [], rows: [] };

    const conn = await this.db!.connect();
    try {
      if (count <= limit) {
        const result = await conn.query(`SELECT * FROM "${tableName}"`);
        return this._toQueryResult(result);
      }
      const result = await conn.query(
        `SELECT * FROM "${tableName}" USING SAMPLE ${Math.round((limit / count) * 100)}% (BERNOULLI) LIMIT ${limit}`
      );
      return this._toQueryResult(result);
    } finally {
      await conn.close();
    }
  }

  private _toQueryResult(result: {
    schema: { fields: { name: string }[] };
    toArray: () => Record<string, unknown>[];
  }): QueryResult {
    const columns = result.schema.fields.map((f) => f.name);
    const rows = result.toArray().map((row) => columns.map((col) => row[col]));
    return { columns, rows };
  }

  async getTables(): Promise<string[]> {
    const result = await this.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'"
    );
    return result.rows.map((row) => String(row[0]));
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
      this.isReady = false;
      this.initPromise = null;
    }
  }

  get ready(): boolean {
    return this.isReady;
  }
}

let _clientInstance: DuckDBClient | null = null;

export function getDuckDBClient(config?: DuckDBClientConfig): DuckDBClient {
  if (!_clientInstance) _clientInstance = new DuckDBClient(config);
  return _clientInstance;
}

export async function closeDuckDBClient(): Promise<void> {
  if (_clientInstance) {
    await _clientInstance.close();
    _clientInstance = null;
  }
}
