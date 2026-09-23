export type ProviderId = 'ollama' | 'lmstudio' | 'openai' | 'anthropic' | 'openrouter';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  requiresApiKey: boolean;
  /** Path to list models (OpenAI-compatible /v1/models) */
  modelsEndpoint: string;
  /** Alternative models path (e.g. Ollama /api/tags) — used as fallback */
  altModelsEndpoint?: string;
  defaultModel?: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    defaultBaseUrl: 'http://localhost:11434/v1',
    requiresApiKey: false,
    modelsEndpoint: '/models',
    altModelsEndpoint: '/api/tags',
    defaultModel: 'llama3.1',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    defaultBaseUrl: 'http://localhost:1234/v1',
    requiresApiKey: false,
    modelsEndpoint: '/models',
    defaultModel: 'local-model',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    modelsEndpoint: '/models',
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    modelsEndpoint: '/models',
    defaultModel: 'claude-3-haiku-20240307',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    modelsEndpoint: '/models',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
  },
];

export interface BYOKConfig {
  provider: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_CONFIG: BYOKConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  apiKey: '',
  model: 'llama3.1',
  maxTokens: 4096,
  temperature: 0.1,
};

export const STORAGE_KEY = 'rancage-byok-config';

export function getProviderConfig(provider: ProviderId): ProviderConfig {
  const found = PROVIDERS.find((p) => p.id === provider);
  if (found) return found;
  // This should never happen since we default to first element, but TypeScript needs assurance
  return PROVIDERS[0] as ProviderConfig;
}

export function loadConfig(): BYOKConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: BYOKConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
