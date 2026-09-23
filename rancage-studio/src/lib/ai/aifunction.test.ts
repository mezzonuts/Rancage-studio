import { describe, it, expect, vi } from 'vitest';
import { AIFunction, evaluateAIFormula } from './aifunction';
import type { AIAdapterConfig, AICompletionResponse } from './types';
import type { EvalContext, CellValue } from '@/lib/formula/types';

const testConfig: AIAdapterConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  apiKey: '',
  model: 'llama3.1',
  maxTokens: 4096,
  temperature: 0.1,
};

function makeCtx(data: Record<string, CellValue>): EvalContext {
  return { getCell: (ref) => data[ref] ?? null, getRange: () => [] };
}

describe('AIFunction.cacheKey', () => {
  it('generates key from prompt + refs', () => {
    const key = AIFunction.cacheKey('sum', ['A1', 'B1']);
    expect(key).toBe('sum||A1,B1');
  });

  it('sorts refs for consistency', () => {
    const key1 = AIFunction.cacheKey('test', ['B1', 'A1']);
    const key2 = AIFunction.cacheKey('test', ['A1', 'B1']);
    expect(key1).toBe(key2);
  });
});

describe('AIFunction cache', () => {
  it('returns null for empty cache', () => {
    const fn = new AIFunction({ adapterConfig: testConfig });
    expect(fn.getCached('test', [])).toBeNull();
  });

  it('returns null for expired cache', () => {
    const fn = new AIFunction({ adapterConfig: testConfig, cacheTTL: 0 });
    // @ts-expect-error testing internals
    fn.cache.set('test||', {
      result: {
        content: 'cached',
        id: '',
        model: '',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      },
      timestamp: 0,
    });
    expect(fn.getCached('test', [])).toBeNull();
  });

  it('clearExpired removes stale entries', () => {
    const fn = new AIFunction({ adapterConfig: testConfig, cacheTTL: 0 });
    // @ts-expect-error testing internals
    fn.cache.set('old', { result: {} as AICompletionResponse, timestamp: 0 });
    expect(fn.clearExpired()).toBe(1);
  });

  it('clearAll empties cache', () => {
    const fn = new AIFunction({ adapterConfig: testConfig });
    // @ts-expect-error testing internals
    fn.cache.set('x', { result: {} as AICompletionResponse, timestamp: Date.now() });
    fn.clearAll();
    expect(fn.size).toBe(0);
  });

  it('pending tracks queue + running', () => {
    const fn = new AIFunction({ adapterConfig: testConfig });
    expect(fn.pending).toBe(0);
  });
});
