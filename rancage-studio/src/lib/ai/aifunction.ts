import { AIClient } from './adapter';
import type { AIMessage, AIAdapterConfig, AICompletionResponse } from './types';
import { validateFormula, sanitizeFormulaResponse } from './validator';
import { parseFormula } from '@/lib/formula/parser';
import { evaluate, extractDeps } from '@/lib/formula/evaluator';
import type { EvalContext, CellValue } from '@/lib/formula/types';

// ── Cache Entry ──────────────────────────────────────────────
interface CacheEntry {
  result: AICompletionResponse;
  timestamp: number;
}

// ── Queue Item ───────────────────────────────────────────────
interface QueueItem {
  id: string;
  prompt: string;
  cellRefs: string[];
  resolve: (result: string) => void;
  reject: (error: Error) => void;
}

// ── AI Function Configuration ────────────────────────────────
export interface AIFunctionConfig {
  adapterConfig: AIAdapterConfig;
  /** Cache TTL in ms (default: 5 minutes) */
  cacheTTL?: number;
  /** Max concurrent requests (default: 3) */
  maxConcurrent?: number;
  /** System prompt override */
  systemPrompt?: string;
}

// ── AI Function Class ────────────────────────────────────────
export class AIFunction {
  private cache = new Map<string, CacheEntry>();
  private queue: QueueItem[] = [];
  private running = 0;
  private client: AIClient;
  private cacheTTL: number;
  private maxConcurrent: number;
  private systemPrompt: string;

  constructor(config: AIFunctionConfig) {
    this.client = new AIClient(config.adapterConfig);
    this.cacheTTL = config.cacheTTL ?? 5 * 60 * 1000;
    this.maxConcurrent = config.maxConcurrent ?? 3;
    this.systemPrompt = config.systemPrompt ?? 'You are a data assistant. Answer concisely.';
  }

  /** Generate cache key from prompt + cell refs */
  static cacheKey(prompt: string, cellRefs: string[]): string {
    return `${prompt}||${cellRefs.sort().join(',')}`;
  }

  /** Check if cached result is still valid */
  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.cacheTTL;
  }

  /** Get cached result or null */
  getCached(prompt: string, cellRefs: string[]): string | null {
    const key = AIFunction.cacheKey(prompt, cellRefs);
    const entry = this.cache.get(key);
    if (entry && this.isValidCache(entry)) return entry.result.content;
    if (entry) this.cache.delete(key);
    return null;
  }

  /** Enqueue an AI request */
  async call(prompt: string, cellRefs: string[]): Promise<string> {
    // Check cache first
    const cached = this.getCached(prompt, cellRefs);
    if (cached !== null) return cached;

    return new Promise<string>((resolve, reject) => {
      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        prompt,
        cellRefs,
        resolve,
        reject,
      };
      this.queue.push(item);
      this.processQueue();
    });
  }

  /** Process queue respecting concurrency limit */
  private async processQueue(): Promise<void> {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.running++;
      this.execute(item).finally(() => {
        this.running--;
        this.processQueue();
      });
    }
  }

  /** Execute a single AI request */
  private async execute(item: QueueItem): Promise<void> {
    try {
      const messages: AIMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: item.prompt },
      ];
      const result = await this.client.complete(messages);
      const content = result.content;

      // Cache the result
      const key = AIFunction.cacheKey(item.prompt, item.cellRefs);
      this.cache.set(key, { result, timestamp: Date.now() });

      item.resolve(content);
    } catch (err) {
      item.reject(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /** Clear expired cache entries */
  clearExpired(): number {
    let cleared = 0;
    for (const [key, entry] of this.cache) {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /** Clear all cache */
  clearAll(): void {
    this.cache.clear();
  }

  /** Cache size */
  get size(): number {
    return this.cache.size;
  }

  /** Queue length */
  get pending(): number {
    return this.queue.length + this.running;
  }
}

// ── Evaluate AI formula in grid context ──────────────────────
export async function evaluateAIFormula(
  aiPrompt: string,
  cellRefs: string[],
  gridCtx: EvalContext,
  aiFunc: AIFunction
): Promise<CellValue> {
  // Build context string from cell refs
  const contextParts: string[] = [];
  for (const ref of cellRefs) {
    const val = gridCtx.getCell(ref);
    if (val !== null && val !== undefined) contextParts.push(`${ref}=${val}`);
  }

  const fullPrompt =
    contextParts.length > 0
      ? `Data context: ${contextParts.join(', ')}\n\nRequest: ${aiPrompt}`
      : aiPrompt;

  const rawResult = await aiFunc.call(fullPrompt, cellRefs);
  const sanitized = sanitizeFormulaResponse(rawResult);

  // Try to parse as formula first
  const validation = validateFormula(sanitized);
  if (validation.valid) {
    try {
      const ast = parseFormula(sanitized);
      return evaluate(ast, gridCtx);
    } catch {
      // Fall through to raw result
    }
  }

  // Return raw result as string
  return sanitized;
}
