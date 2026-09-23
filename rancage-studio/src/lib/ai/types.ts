import type { ProviderId, BYOKConfig } from '@/lib/byok/types';

// ── Message ──────────────────────────────────────────────────
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── Request ──────────────────────────────────────────────────
export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

// ── Response ─────────────────────────────────────────────────
export interface AICompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

// ── Streaming ────────────────────────────────────────────────
export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

// ── Error ────────────────────────────────────────────────────
export class AIAdapterError extends Error {
  constructor(
    message: string,
    public readonly provider: ProviderId,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AIAdapterError';
  }
}

// ── Adapter Config ───────────────────────────────────────────
export interface AIAdapterConfig {
  provider: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/** Derive adapter config from BYOKConfig */
export function adapterConfigFromBYOK(config: BYOKConfig): AIAdapterConfig {
  return {
    provider: config.provider,
    baseUrl: config.baseUrl.replace(/\/$/, ''),
    apiKey: config.apiKey,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  };
}
