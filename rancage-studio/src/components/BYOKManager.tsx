'use client';

import { useBYOK } from '@/lib/byok/context';
import type { ProviderConfig, BYOKConfig } from '@/lib/byok/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import Link from '@mui/material/Link';

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h2">AI Configuration</Typography>
        {connectionStatus === 'success' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
            <CheckCircleIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" color="success.main">
              Connected
              {availableModels.length > 0 && (
                <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                  ({availableModels.length} models)
                </Typography>
              )}
            </Typography>
          </Box>
        )}
        {connectionStatus === 'error' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
            <ErrorIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" color="error.main">Connection Failed</Typography>
          </Box>
        )}
        {connectionStatus === 'testing' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Testing...</Typography>
          </Box>
        )}
      </Box>

      {/* Provider Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Provider</InputLabel>
        <Select
          value={config.provider}
          label="Provider"
          onChange={(e) => setProvider(e.target.value as BYOKConfig['provider'])}
          disabled={isLoading || connectionStatus === 'testing'}
        >
          {providers.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Base URL */}
      <TextField
        fullWidth
        label="Base URL"
        type="url"
        value={config.baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder={getProviderConfig(config.provider).defaultBaseUrl}
        disabled={isLoading || connectionStatus === 'testing'}
        sx={{ mb: 2 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1.5, mb: 2 }}>
        Ollama: http://localhost:11434/v1 | LM Studio: http://localhost:1234/v1
      </Typography>

      {/* API Key */}
      {isApiKeyRequired && (
        <TextField
          fullWidth
          label="API Key"
          type="password"
          value={config.apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`Enter ${getProviderConfig(config.provider).name} API key`}
          disabled={isLoading || connectionStatus === 'testing'}
          sx={{ mb: 2 }}
        />
      )}

      {/* Model Selection */}
      {availableModels.length > 0 ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={config.model}
            label="Model"
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading || connectionStatus === 'testing'}
          >
            {availableModels.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available — auto-detected
          </Typography>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          label="Model"
          value={config.model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Enter model name or ID"
          disabled={isLoading || connectionStatus === 'testing'}
          sx={{ mb: 2 }}
        />
      )}

      {/* Advanced Settings */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600, mb: 1 }}>
          Advanced Settings (Optional)
        </Typography>
        <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Maximum Tokens"
            type="number"
            value={config.maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 256, max: 65536 } }}
            disabled={isLoading || connectionStatus === 'testing'}
            size="small"
          />
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Temperature ({config.temperature.toFixed(2)})
            </Typography>
            <Slider
              value={config.temperature}
              onChange={(_, v) => setTemperature(v as number)}
              min={0}
              max={1}
              step={0.01}
              disabled={isLoading || connectionStatus === 'testing'}
            />
            <Typography variant="caption" color="text.secondary">
              Lower = more deterministic, Higher = more creative
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => void testConnection()}
          disabled={!canTest || (isApiKeyRequired && !hasApiKeyForProvider)}
          startIcon={connectionStatus === 'testing' ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </Button>
        {connectionStatus === 'success' && (
          <Button
            variant="outlined"
            component={Link as any}
            href="/studio"
            endIcon={<LaunchIcon />}
          >
            Launch Studio
          </Button>
        )}
      </Box>

      {/* Error Message */}
      {connectionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {connectionError}
        </Alert>
      )}

      {/* Info Box */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Getting Started:</Typography>
        <Box component="ol" sx={{ mt: 1, pl: 2, m: 0 }}>
          <li><Typography variant="body2">Select your provider (Ollama for local, OpenAI for cloud)</Typography></li>
          <li><Typography variant="body2">Set base URL (defaults provided for common providers)</Typography></li>
          <li><Typography variant="body2">Add API key if required by provider</Typography></li>
          <li><Typography variant="body2">Click &quot;Test Connection&quot; to verify connectivity</Typography></li>
          <li><Typography variant="body2">If successful, proceed to studio</Typography></li>
        </Box>
      </Alert>
    </Box>
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
  return providers[0] as ProviderConfig;
}