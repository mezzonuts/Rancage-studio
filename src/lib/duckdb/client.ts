/**
 * DuckDB-Wasm Client Wrapper
 * 
 * Provides a clean async API for interacting with DuckDB running in a Web Worker.
 * Handles worker lifecycle, message passing, and query execution.
 */

import * as duckdb from '@duckdb/duckdb-wasm';
import type { DuckDBBundle } from '@duckdb/duckdb-wasm';

// Message types matching the worker
interface WorkerMessage {
  type: 'init' | 'registerFile' | 'query' | 'schema' | 'close';
  bundle?: DuckDBBundle;
  name?: string;
  data?: ArrayBuffer | Uint8Array;
  extension?: 'csv' | 'parquet';
  sql?: string;
  tableName?: string;
  id: number;
}

interface WorkerResponse {
  type: 'ready' | 'fileRegistered' | 'queryResult' | 'schemaResult' | 'closed' | 'error';
  success?: boolean;
  error?: string;
  name?: string;
  columns?: string[];
  rows?: unknown[][];
  id?: number;
  message?: string;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface ColumnSchema {
  name: string;
  type: string;
}

export interface DuckDBClientConfig {
  workerUrl?: string;
  bundle?: DuckDBBundle;
}
/**
 * DuckDB Client - Main entry point for DuckDB operations
 */
export class DuckDBClient {
  private worker: Worker | null = null;
  private bundle: DuckDBBundle | null = null;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }>();
  private requestId = 0;
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  constructor(private config: DuckDBClientConfig = {}) {
    this.config.workerUrl = config.workerUrl || '/worker-duckdb.js';
  }

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    const bundle = await this._loadBundle();
    this.bundle = bundle;
    this.worker = new Worker(this.config.workerUrl!, { type: 'module' });

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this._handleMessage(event.data);
    };

    this.worker.onerror = (error) => {
      console.error('[DuckDBClient] Worker error:', error);
      this._rejectAllPending(new Error(`Worker error: ${error.message}`));
    };

    this.worker.postMessage({ type: 'init', bundle, id: 0 } as WorkerMessage);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('DuckDB initialization timeout')), 30000);
      const checkReady = () => {
        if (this.isReady) { clearTimeout(timeout); resolve(); }
        else { setTimeout(checkReady, 50); }
      };
      checkReady();
    });
  }

  private async _loadBundle(): Promise<DuckDBBundle> {
    const bundle = await duckdb.selectBundle({
      mainModule: duckdb.getMainModule({ mainModule: 'main' }),
      mainWorker: duckdb.getMainWorker({ mainWorker: 'worker' }),
    });
    return bundle;
  }

  private _handleMessage(response: WorkerResponse): void {
    switch (response.type) {
      case 'ready':
        this.isReady = response.success === true;
        if (!response.success) this._rejectAllPending(new Error(response.error || 'Initialization failed'));
        break;
      case 'fileRegistered':
      case 'queryResult':
      case 'schemaResult':
      case 'closed': {
        const id = response.id;
        if (id !== undefined) {
          const pending = this.pendingRequests.get(id);
          if (pending) {
            this.pendingRequests.delete(id);
            if (response.error) pending.reject(new Error(response.error));
            else pending.resolve(response);
          }
        }
        break;
      }
      case 'error':
        console.error('[DuckDBClient] Worker error:', response.message);
        this._rejectAllPending(new Error(response.message || 'Unknown worker error'));
        break;
    }
  }

  private _rejectAllPending(error: Error): void {
    for (const [, pending] of this.pendingRequests) pending.reject(error);
    this.pendingRequests.clear();
  }

  private _nextId(): number { return ++this.requestId; }

  private _send<T>(message: WorkerMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = message.id;
      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker!.postMessage(message);
    });
  }
async registerFile(
    name: string,
    data: ArrayBuffer | Uint8Array,
    extension?: 'csv' | 'parquet'
  ): Promise<void> {
    await this._ensureReady();
    await this._send<WorkerResponse>({
      type: 'registerFile', name, data, extension, id: this._nextId(),
    });
  }

  async query(sql: string): Promise<QueryResult> {
    await this._ensureReady();
    const response = await this._send<WorkerResponse>({
      type: 'query', sql, id: this._nextId(),
    });
    if (response.error) throw new Error(response.error);
    return { columns: response.columns || [], rows: response.rows || [] };
  }

  async getSchema(tableName: string): Promise<ColumnSchema[]> {
    await this._ensureReady();
    const response = await this._send<WorkerResponse>({
      type: 'schema', tableName, id: this._nextId(),
    });
    if (response.error) throw new Error(response.error);
    return response.columns || [];
  }

  async countRows(tableName: string): Promise<number> {
    const result = await this.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return Number(result.rows[0]?.[0] || 0);
  }

  async getTables(): Promise<string[]> {
    const result = await this.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'");
    return result.rows.map(row => String(row[0]));
  }

  async close(): Promise<void> {
    if (!this.worker) return;
    const id = this._nextId();
    await this._send<WorkerResponse>({ type: 'close', id });
    this.worker.terminate();
    this.worker = null;
    this.isReady = false;
    this.initPromise = null;
  }

  private async _ensureReady(): Promise<void> {
    if (!this.isReady) await this.initialize();
    if (!this.isReady) throw new Error('DuckDB not ready');
  }

  get ready(): boolean { return this.isReady; }
}

let _clientInstance: DuckDBClient | null = null;

export function getDuckDBClient(config?: DuckDBClientConfig): DuckDBClient {
  if (!_clientInstance) _clientInstance = new DuckDBClient(config);
  return _clientInstance;
}

export async function closeDuckDBClient(): Promise<void> {
  if (_clientInstance) { await _clientInstance.close(); _clientInstance = null; }
}