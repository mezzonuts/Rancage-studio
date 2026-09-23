'use client';

import { useBYOK } from '@/lib/byok/context';
import type { ProviderConfig, BYOKConfig } from '@/lib/byok/types';

export function BYOKManager() {
  const {
    config,
    providers,
    isLoading,
    availableModels,
    connectionStatus,
    connectionError,
    setProvider,
    setBaseUrl,
    setApiKey,
    setModel,
    setMaxTokens,
    setTemperature,
    testConnection,
  } = useBYOK();

  const isApiKeyRequired = getProviderConfig(config.provider).requiresApiKey;
  const canTest = !isLoading && config.baseUrl.trim().length > 0;
  const hasApiKeyForProvider = !isApiKeyRequired || config.apiKey.trim().length > 0;

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Configuration</h2>
        {connectionStatus === 'success' && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <StatusIndicator status="connected" /> Connected
            {availableModels.length > 0 && (
              <span className="text-muted-foreground ml-1 text-xs">
                ({availableModels.length} models)
              </span>
            )}
          </span>
        )}
        {connectionStatus === 'error' && (
          <span className="inline-flex items-center gap-1 text-sm text-red-600">
            <StatusIndicator status="disconnected" /> Connection Failed
          </span>
        )}
        {connectionStatus === 'testing' && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
            <StatusIndicator status="testing" /> Testing...
          </span>
        )}
      </div>

      {/* Provider Selector */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Provider</label>
        <select
          value={config.provider}
          onChange={(e) => setProvider(e.target.value as BYOKConfig['provider'])}
          disabled={isLoading || connectionStatus === 'testing'}
          className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Base URL */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Base URL</label>
        <input
          type="url"
          value={config.baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={getProviderConfig(config.provider).defaultBaseUrl}
          disabled={isLoading || connectionStatus === 'testing'}
          className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Ollama: http://localhost:11434/v1 | LM Studio: http://localhost:1234/v1
        </p>
      </div>

      {/* API Key */}
      {isApiKeyRequired && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${getProviderConfig(config.provider).name} API key`}
            disabled={isLoading || connectionStatus === 'testing'}
            className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
        </div>
      )}

      {/* Model Selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Model</label>
        {availableModels.length > 0 ? (
          <>
            <select
              value={config.model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLoading || connectionStatus === 'testing'}
              className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground mt-1 text-xs">
              {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available —
              auto-detected
            </p>
          </>
        ) : (
          <input
            type="text"
            value={config.model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Enter model name or ID"
            disabled={isLoading || connectionStatus === 'testing'}
            className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
        )}
      </div>
      {/* Advanced Settings */}
      <details className="group mb-4">
        <summary className="group-open:text-primary cursor-pointer list-none text-sm font-medium select-none">
          Advanced Settings (Optional)
        </summary>
        <div className="mt-4 space-y-4 pl-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Maximum Tokens</label>
            <input
              type="number"
              min={256}
              max={65536}
              value={config.maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              disabled={isLoading || connectionStatus === 'testing'}
              className="bg-background focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Temperature ({config.temperature.toFixed(2)})
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              disabled={isLoading || connectionStatus === 'testing'}
              className="accent-primary w-full"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Lower = more deterministic, Higher = more creative
            </p>
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => void testConnection()}
          disabled={!canTest || (isApiKeyRequired && !hasApiKeyForProvider)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <StatusIndicator status={connectionStatus} className="h-4 w-4" />
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </button>
        {connectionStatus === 'success' && (
          <a
            href="/studio"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Launch Studio →
          </a>
        )}
      </div>

      {/* Error Message */}
      {connectionError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {connectionError}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-medium">Getting Started:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
          <li>Select your provider (Ollama for local, OpenAI for cloud)</li>
          <li>Set base URL (defaults provided for common providers)</li>
          <li>Add API key if required by provider</li>
          <li>Click &quot;Test Connection&quot; to verify connectivity</li>
          <li>If successful, proceed to studio</li>
        </ol>
      </div>
    </div>
  );
}

function getProviderConfig(providerId: string): ProviderConfig {
  const providers: ProviderConfig[] = [
    {
      id: 'ollama',
      name: 'Ollama',
      defaultBaseUrl: 'http://localhost:11434/v1',
      requiresApiKey: false,
      modelsEndpoint: '/models',
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
  const found = providers.find((p) => p.id === providerId);
  if (found) return found;
  // This should never happen since we default to first element, but TypeScript needs assurance
  return providers[0] as ProviderConfig;
}

interface StatusIndicatorProps {
  status: 'idle' | 'testing' | 'success' | 'error' | 'connected' | 'disconnected';
  className?: string;
}

function StatusIndicator({ status, className }: StatusIndicatorProps) {
  switch (status) {
    case 'connected':
    case 'success':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          />
        </svg>
      );
    case 'disconnected':
    case 'error':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z"
          />
        </svg>
      );
    case 'testing':
      return (
        <svg
          className={`${className} animate-spin`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    default:
      return <div className={`${className} h-3 w-3 rounded-full bg-gray-300`} />;
  }
}
