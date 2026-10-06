import { apiClient } from './apiClient';

export const PROVIDERS = [
    { id: 'gemini',  label: 'Google Gemini', icon: 'auto_awesome', docs: 'https://aistudio.google.com/apikey', site: 'aistudio.google.com' },
    { id: 'deepseek', label: 'DeepSeek',      icon: 'bolt',         docs: 'https://platform.deepseek.com/api_keys', site: 'platform.deepseek.com' },
    { id: 'openai',   label: 'OpenAI',        icon: 'rocket_launch', docs: 'https://platform.openai.com/api-keys', site: 'platform.openai.com' },
    { id: 'claude',   label: 'Anthropic Claude', icon: 'psychology', docs: 'https://console.anthropic.com/settings/keys', site: 'console.anthropic.com' },
];

export const aiKeysService = {
    get: () => apiClient('/ai/key'),

    save: ({ provider, key, model, is_default }) =>
        apiClient('/ai/key', {
            method: 'POST',
            body: { provider, key, model, is_default },
        }),

    verify: ({ provider, key, model }) =>
        apiClient('/ai/key/verify', {
            method: 'POST',
            body: { provider, key, model },
        }),

    setDefault: (provider) =>
        apiClient(`/ai/key/${provider}/default`, {
            method: 'POST',
            body: {},
        }),

    remove: (provider) => apiClient(`/ai/key/${provider}`, { method: 'DELETE' }),
};
