/// <reference lib="webworker" />

import * as duckdb from '@duckdb/duckdb-wasm';
import type { DuckDBInstance, DuckDBConnection } from '@duckdb/duckdb-wasm';

// Worker message types
type WorkerMessage =
  | { type: 'init'; bundle: duckdb.DuckDBBundle }
  | { type: 'registerFile'; name: string; data: ArrayBuffer | Uint8Array; extension?: 'csv' | 'parquet' }
  | { type: 'query'; sql: string; id: number }
  | { type: 'schema'; tableName: string; id: number }
  | { type: 'close'; id: number };

type WorkerResponse =
  | { type: 'ready'; success: boolean; error?: string }
  | { type: 'fileRegistered'; success: boolean; name: string; error?: string }
  | { type: 'queryResult'; id: number; columns: string[]; rows: unknown[][]; error?: string }
  | { type: 'schemaResult'; id: number; columns: { name: string; type: string }[]; error?: string }
  | { type: 'closed'; id: number; success: boolean; error?: string }
  | { type: 'error'; message: string };

let db: DuckDBInstance | null = null;
let conn: DuckDBConnection | null = null;
let isInitialized = false;

async function initializeDuckDB(bundle: duckdb.DuckDBBundle): Promise<void> {
  if (isInitialized) return;

  try {
    // Instantiate DuckDB
    db = await duckdb.createDB(bundle.mainModule, bundle.mainWorker);
    conn = await db.connect();

    // Load CSV and Parquet extensions
    await conn.query(`
      INSTALL csv;
      LOAD csv;
      INSTALL parquet;
      LOAD parquet;
    `);

    isInitialized = true;
    postMessage({ type: 'ready', success: true } as WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'ready', success: false, error: message } as WorkerResponse);
  }
}

async function registerFile(name: string, data: ArrayBuffer | Uint8Array, extension?: 'csv' | 'parquet'): Promise<void> {
  if (!conn) throw new Error('DuckDB not initialized');

  try {
    // Register the file as a DuckDB table using read_csv_auto or read_parquet
    const ext = extension || (name.endsWith('.parquet') ? 'parquet' : 'csv');
    const query = ext === 'parquet'
      ? `CREATE TABLE "${name}" AS SELECT * FROM read_parquet('${name}')`
      : `CREATE TABLE "${name}" AS SELECT * FROM read_csv_auto('${name}')`;

    // First, we need to register the file in the virtual filesystem
    await db!.registerFileBuffer(name, new Uint8Array(data));
    await conn.query(query);

    postMessage({ type: 'fileRegistered', success: true, name } as WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'fileRegistered', success: false, name, error: message } as WorkerResponse);
  }
}

async function executeQuery(sql: string, id: number): Promise<void> {
  if (!conn) throw new Error('DuckDB not initialized');

  try {
    const result = await conn.query(sql);
    const columns = result.schema.fields.map(f => f.name);
    const rows = result.toArray().map(row => columns.map(col => row[col]));

    postMessage({ type: 'queryResult', id, columns, rows } as WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'queryResult', id, columns: [], rows: [], error: message } as WorkerResponse);
  }
}

async function getSchema(tableName: string, id: number): Promise<void> {
  if (!conn) throw new Error('DuckDB not initialized');

  try {
    const result = await conn.query(`DESCRIBE "${tableName}"`);
    const columns = result.toArray().map(row => ({
      name: row.column_name as string,
      type: row.column_type as string,
    }));

    postMessage({ type: 'schemaResult', id, columns } as WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'schemaResult', id, columns: [], error: message } as WorkerResponse);
  }
}

async function closeConnection(id: number): Promise<void> {
  try {
    if (conn) {
      await conn.close();
      conn = null;
    }
    if (db) {
      await db.terminate();
      db = null;
    }
    isInitialized = false;
    postMessage({ type: 'closed', id, success: true } as WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'closed', id, success: false, error: message } as WorkerResponse);
  }
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case 'init':
        await initializeDuckDB(msg.bundle);
        break;
      case 'registerFile':
        await registerFile(msg.name, msg.data, msg.extension);
        break;
      case 'query':
        await executeQuery(msg.sql, msg.id);
        break;
      case 'schema':
        await getSchema(msg.tableName, msg.id);
        break;
      case 'close':
        await closeConnection(msg.id);
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postMessage({ type: 'error', message } as WorkerResponse);
  }
};

// Export for TypeScript compilation
export {};