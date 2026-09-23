import type {
  AIAdapterConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIMessage,
  AIStreamChunk,
} from './types';
import { AIAdapterError } from './types';

/**
 * Universal AI Adapter — OpenAI-compatible client.
 * Works with Ollama, LM Studio, OpenAI, Anthropic (via proxy), OpenRouter.
 *
 * ponytail: Anthropic native format not yet normalized; uses /v1/messages when needed.
 */
export class AIClient {
  constructor(private readonly config: AIAdapterConfig) {}

  /** Build headers for the provider */
  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) h['Authorization'] = `Bearer ${this.config.apiKey}`;
    return h;
  }

  /** Build OpenAI-compatible request body */
  private buildBody(req: AICompletionRequest): Record<string, unknown> {
    return {
      model: req.model ?? this.config.model,
      messages: req.messages,
      max_tokens: req.maxTokens ?? this.config.maxTokens,
      temperature: req.temperature ?? this.config.temperature,
      stream: req.stream ?? false,
    };
  }

  /** Normalize messages — strip empty system messages, trim content */
  static normalizeMessages(messages: AIMessage[]): AIMessage[] {
    return messages
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({ ...m, content: m.content.trim() }));
  }

  /** Non-streaming completion */
  async complete(
    messages: AIMessage[],
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<AICompletionResponse> {
    const normalized = AIClient.normalizeMessages(messages);
    if (normalized.length === 0)
      throw new AIAdapterError('No messages provided', this.config.provider);

    const body = this.buildBody({
      messages: normalized,
      model: options?.model,
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      stream: false,
    });

    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AIAdapterError(
        `HTTP ${res.status}: ${text.slice(0, 200) || res.statusText}`,
        this.config.provider,
        res.status
      );
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    if (!choice) throw new AIAdapterError('No completion returned', this.config.provider);

    return {
      id: data.id ?? '',
      content: choice.message?.content ?? '',
      model: data.model ?? this.config.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  /** Streaming completion — yields delta chunks via async generator */
  async *stream(
    messages: AIMessage[],
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const normalized = AIClient.normalizeMessages(messages);
    if (normalized.length === 0)
      throw new AIAdapterError('No messages provided', this.config.provider);

    const body = this.buildBody({
      messages: normalized,
      model: options?.model,
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      stream: true,
    });

    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AIAdapterError(
        `HTTP ${res.status}: ${text.slice(0, 200) || res.statusText}`,
        this.config.provider,
        res.status
      );
    }

    const reader = res.body?.getReader();
    if (!reader) throw new AIAdapterError('No response body', this.config.provider);

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') {
            yield { delta: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) yield { delta, done: false };
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
