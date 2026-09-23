import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  STORAGE_KEY,
  getProviderConfig,
  PROVIDERS,
  type BYOKConfig,
} from './types';

describe('BYOK Config Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadConfig returns DEFAULT_CONFIG when localStorage is empty', () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it('saveConfig persists to localStorage', () => {
    const custom: BYOKConfig = {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
      maxTokens: 8192,
      temperature: 0.5,
    };
    saveConfig(custom);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.provider).toBe('openai');
    expect(stored.apiKey).toBe('sk-test');
  });

  it('loadConfig restores saved config with defaults merged', () => {
    // Save partial config (missing maxTokens, temperature)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ provider: 'anthropic', model: 'claude-3-sonnet' })
    );

    const loaded = loadConfig();
    expect(loaded.provider).toBe('anthropic');
    expect(loaded.model).toBe('claude-3-sonnet');
    // Should keep DEFAULT values for missing fields
    expect(loaded.maxTokens).toBe(DEFAULT_CONFIG.maxTokens);
    expect(loaded.temperature).toBe(DEFAULT_CONFIG.temperature);
  });

  it('loadConfig returns DEFAULT_CONFIG on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json!!!');
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });
});

describe('Provider Config', () => {
  it('getProviderConfig returns correct config for known provider', () => {
    const ollama = getProviderConfig('ollama');
    expect(ollama.name).toBe('Ollama');
    expect(ollama.requiresApiKey).toBe(false);
    expect(ollama.defaultBaseUrl).toBe('http://localhost:11434/v1');
  });

  it('getProviderConfig returns config for each provider ID', () => {
    for (const provider of PROVIDERS) {
      const config = getProviderConfig(provider.id);
      expect(config.id).toBe(provider.id);
      expect(config.modelsEndpoint).toBe('/models');
    }
  });

  it('every provider has required fields', () => {
    for (const p of PROVIDERS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.defaultBaseUrl).toBeTruthy();
      expect(p.modelsEndpoint).toBeTruthy();
    }
  });

  it('Ollama has altModelsEndpoint for /api/tags', () => {
    const ollama = getProviderConfig('ollama');
    expect(ollama.altModelsEndpoint).toBe('/api/tags');
  });
});

describe('fetchModels URL construction', () => {
  it('constructs correct OpenAI-compatible URL', () => {
    const baseUrl = 'https://api.openai.com/v1';
    const provider = getProviderConfig('openai');
    const url = `${baseUrl.replace(/\/$/, '')}${provider.modelsEndpoint}`;
    expect(url).toBe('https://api.openai.com/v1/models');
  });

  it('strips /v1 for Ollama alt endpoint', () => {
    const baseUrl = 'http://localhost:11434/v1';
    const altBase = baseUrl.replace(/\/v1$/, '');
    const provider = getProviderConfig('ollama');
    const url = `${altBase}${provider.altModelsEndpoint}`;
    expect(url).toBe('http://localhost:11434/api/tags');
  });
});
