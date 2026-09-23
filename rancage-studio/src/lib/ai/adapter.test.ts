import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIClient } from './adapter';
import { AIAdapterError, adapterConfigFromBYOK } from './types';
import type { AIAdapterConfig } from './types';
import { DEFAULT_CONFIG } from '@/lib/byok/types';

const mockConfig: AIAdapterConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  apiKey: '',
  model: 'llama3.1',
  maxTokens: 4096,
  temperature: 0.1,
};

describe('AIClient.normalizeMessages', () => {
  it('trims whitespace from content', () => {
    const result = AIClient.normalizeMessages([{ role: 'user', content: '  hello  ' }]);
    expect(result[0]!.content).toBe('hello');
  });

  it('filters out empty messages', () => {
    const result = AIClient.normalizeMessages([
      { role: 'user', content: '' },
      { role: 'user', content: '  ' },
      { role: 'user', content: 'valid' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]!.content).toBe('valid');
  });

  it('preserves message order and roles', () => {
    const result = AIClient.normalizeMessages([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
    ]);
    expect(result.map((m) => m.role)).toEqual(['system', 'user', 'assistant']);
  });
});

describe('AIClient.complete', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed completion response', async () => {
    const mockResponse = {
      id: 'cmpl-123',
      choices: [{ message: { content: 'Hello world' } }],
      model: 'llama3.1',
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const client = new AIClient(mockConfig);
    const result = await client.complete([{ role: 'user', content: 'Say hi' }]);

    expect(result.content).toBe('Hello world');
    expect(result.id).toBe('cmpl-123');
    expect(result.usage.totalTokens).toBe(15);
  });

  it('throws AIAdapterError on non-200 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' })
    );

    const client = new AIClient(mockConfig);
    await expect(client.complete([{ role: 'user', content: 'test' }])).rejects.toThrow(
      AIAdapterError
    );
  });

  it('throws on empty messages', async () => {
    const client = new AIClient(mockConfig);
    await expect(client.complete([])).rejects.toThrow('No messages provided');
  });

  it('throws on whitespace-only messages', async () => {
    const client = new AIClient(mockConfig);
    await expect(client.complete([{ role: 'user', content: '   ' }])).rejects.toThrow(
      'No messages provided'
    );
  });

  it('sends correct request body', async () => {
    const mockResponse = {
      id: 'cmpl-456',
      choices: [{ message: { content: 'ok' } }],
      model: 'gpt-4o',
      usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
    };

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const client = new AIClient(mockConfig);
    await client.complete([{ role: 'user', content: 'test' }], {
      model: 'gpt-4o',
      maxTokens: 100,
      temperature: 0.5,
    });

    const callBody = JSON.parse(fetchSpy.mock.calls[0]![1]!.body as string);
    expect(callBody.model).toBe('gpt-4o');
    expect(callBody.max_tokens).toBe(100);
    expect(callBody.temperature).toBe(0.5);
    expect(callBody.stream).toBe(false);
  });

  it('includes Authorization header when apiKey provided', async () => {
    const configWithKey = { ...mockConfig, apiKey: 'sk-test-123' };
    const mockResponse = {
      id: 'cmpl-789',
      choices: [{ message: { content: 'ok' } }],
      model: 'test',
      usage: {},
    };

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const client = new AIClient(configWithKey);
    await client.complete([{ role: 'user', content: 'test' }]);

    const callHeaders = fetchSpy.mock.calls[0]![1]!.headers as Record<string, string>;
    expect(callHeaders['Authorization']).toBe('Bearer sk-test-123');
  });

  it('omits Authorization header when no apiKey', async () => {
    const mockResponse = {
      id: 'cmpl-000',
      choices: [{ message: { content: 'ok' } }],
      model: 'test',
      usage: {},
    };

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const client = new AIClient(mockConfig);
    await client.complete([{ role: 'user', content: 'test' }]);

    const callHeaders = fetchSpy.mock.calls[0]![1]!.headers as Record<string, string>;
    expect(callHeaders['Authorization']).toBeUndefined();
  });
});

describe('adapterConfigFromBYOK', () => {
  it('converts BYOKConfig to AIAdapterConfig', () => {
    const result = adapterConfigFromBYOK(DEFAULT_CONFIG);
    expect(result.provider).toBe('ollama');
    expect(result.baseUrl).toBe('http://localhost:11434/v1');
    expect(result.model).toBe('llama3.1');
    expect(result.maxTokens).toBe(4096);
  });

  it('strips trailing slash from baseUrl', () => {
    const result = adapterConfigFromBYOK({ ...DEFAULT_CONFIG, baseUrl: 'http://example.com/v1/' });
    expect(result.baseUrl).toBe('http://example.com/v1');
  });
});

describe('AIAdapterError', () => {
  it('has correct name and properties', () => {
    const err = new AIAdapterError('test error', 'openai', 401);
    expect(err.name).toBe('AIAdapterError');
    expect(err.message).toBe('test error');
    expect(err.provider).toBe('openai');
    expect(err.statusCode).toBe(401);
  });

  it('is instanceof Error', () => {
    const err = new AIAdapterError('fail', 'ollama');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AIAdapterError);
  });
});
