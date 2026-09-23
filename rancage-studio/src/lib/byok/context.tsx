'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { BYOKConfig, ProviderId } from './types';
import { DEFAULT_CONFIG, getProviderConfig, loadConfig, saveConfig, PROVIDERS } from './types';

interface BYOKContextValue {
  config: BYOKConfig;
  providers: typeof PROVIDERS;
  isLoading: boolean;
  availableModels: string[];
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionError: string | null;
  setProvider: (provider: ProviderId) => void;
  setBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setMaxTokens: (tokens: number) => void;
  setTemperature: (temp: number) => void;
  testConnection: () => Promise<void>;
  resetConfig: () => void;
}

const BYOKContext = createContext<BYOKContextValue | null>(null);

export function BYOKProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BYOKConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Hydrate from localStorage after client mount (avoids SSR hydration mismatch)
  // This is the standard Next.js pattern for client-only storage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate hydration sync
    setConfig(loadConfig());
    setIsLoading(false);
  }, []);

  const updateConfig = useCallback((updates: Partial<BYOKConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      saveConfig(next);
      return next;
    });
  }, []);

  const setProvider = useCallback(
    (provider: ProviderId) => {
      const providerConfig = getProviderConfig(provider);
      updateConfig({
        provider,
        baseUrl: providerConfig.defaultBaseUrl,
        apiKey: providerConfig.requiresApiKey ? '' : config.apiKey,
        model: providerConfig.defaultModel ?? config.model,
      });
      setAvailableModels([]);
      setConnectionStatus('idle');
      setConnectionError(null);
    },
    [config.apiKey, config.model, updateConfig]
  );

  const setBaseUrl = useCallback((baseUrl: string) => updateConfig({ baseUrl }), [updateConfig]);
  const setApiKey = useCallback((apiKey: string) => updateConfig({ apiKey }), [updateConfig]);
  const setModel = useCallback((model: string) => updateConfig({ model }), [updateConfig]);
  const setMaxTokens = useCallback(
    (maxTokens: number) => updateConfig({ maxTokens }),
    [updateConfig]
  );
  const setTemperature = useCallback(
    (temperature: number) => updateConfig({ temperature }),
    [updateConfig]
  );

  /** Fetch model list from provider's /models endpoint, falling back to alt endpoint */
  const fetchModels = useCallback(
    async (baseUrl: string, apiKey: string, providerId: ProviderId): Promise<string[]> => {
      const providerConfig = getProviderConfig(providerId);
      const headers: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
      const strippedBase = baseUrl.replace(/\/$/, '');

      // Try primary endpoint first (/models — OpenAI-compatible)
      try {
        const res = await fetch(`${strippedBase}${providerConfig.modelsEndpoint}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const models = data.data?.map((m: { id: string }) => m.id) ?? [];
          if (models.length > 0) return models;
        }
      } catch {
        // fall through to alt
      }

      // Try alt endpoint (e.g. Ollama /api/tags)
      if (providerConfig.altModelsEndpoint) {
        try {
          const altBase = strippedBase.replace(/\/v1$/, ''); // Ollama: strip /v1
          const res = await fetch(`${altBase}${providerConfig.altModelsEndpoint}`, { headers });
          if (res.ok) {
            const data = await res.json();
            // Ollama /api/tags returns { models: [{ name, ... }] }
            const models = data.models?.map((m: { name: string }) => m.name) ?? [];
            if (models.length > 0) return models;
          }
        } catch {
          // ignore
        }
      }

      return [];
    },
    []
  );

  const testConnection = useCallback(async () => {
    setConnectionStatus('testing');
    setConnectionError(null);
    try {
      const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/models`, {
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      setConnectionStatus('success');

      // Fetch available models after successful connection
      const models = await fetchModels(config.baseUrl, config.apiKey, config.provider);
      setAvailableModels(models);

      // Auto-select first model if current model is empty or not in list
      if (models.length > 0 && !models.includes(config.model)) {
        setModel(models[0]!);
      }
    } catch (err) {
      setConnectionStatus('error');
      setConnectionError(err instanceof Error ? err.message : 'Connection failed');
      setAvailableModels([]);
    }
  }, [config.baseUrl, config.apiKey, config.provider, config.model, fetchModels, setModel]);

  const resetConfig = useCallback(() => {
    const providerConfig = getProviderConfig('ollama');
    const reset = { ...DEFAULT_CONFIG, baseUrl: providerConfig.defaultBaseUrl };
    saveConfig(reset);
    setConfig(reset);
    setConnectionStatus('idle');
    setConnectionError(null);
    setAvailableModels([]);
  }, []);

  return (
    <BYOKContext.Provider
      value={{
        config,
        providers: PROVIDERS,
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
        resetConfig,
      }}
    >
      {children}
    </BYOKContext.Provider>
  );
}

export function useBYOK() {
  const ctx = useContext(BYOKContext);
  if (!ctx) throw new Error('useBYOK must be used within BYOKProvider');
  return ctx;
}
