import { apiClient } from '../api/apiClient';

export const NO_AI_KEY_MESSAGE = 'Add your AI API key in Settings to use this feature.';

export class NoAIKeyError extends Error {
    constructor(message = NO_AI_KEY_MESSAGE) {
        super(message);
        this.name = 'NoAIKeyError';
    }
}

const readError = (error, fallback) => {
    if (error?.name === 'AbortError') {
        return error;
    }

    if (error?.status === 428) {
        return new NoAIKeyError();
    }

    return new Error(error?.message || fallback);
};

/**
 * Single text-generation entry point for the browser.
 *
 * The user's provider key never reaches the client: the request is proxied
 * through the backend, which decrypts the key and calls the provider.
 *
 * @param {{ prompt: string, system?: string, signal?: AbortSignal }} opts
 * @returns {Promise<{ text: string }>}
 */
export async function generateWithUserKey({ prompt, system, signal }) {
    try {
        const response = await apiClient('/ai/proxy/text', {
            method: 'POST',
            body: { prompt, system },
            signal,
        });

        return { text: response?.data?.text ?? '' };
    } catch (error) {
        throw readError(error, 'AI generation failed. Please try again.');
    }
}

/**
 * Stream text generation token-by-token from the backend proxy.
 *
 * @param {{ prompt: string, system?: string, signal?: AbortSignal, onDelta: (chunk: string) => void }} opts
 * @returns {Promise<string>} the full accumulated text
 */
export async function streamWithUserKey({ prompt, system, signal, onDelta }) {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://notepaperai-api.synchrome.co/api/v1';

    const response = await fetch(`${baseUrl}/ai/proxy/stream`, {
        method: 'POST',
        credentials: 'include',
        signal,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
        },
        body: JSON.stringify({ prompt, system }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw response.status === 428
            ? new NoAIKeyError()
            : new Error(errorData.message || 'AI generation failed. Please try again.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    for (;;) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
            const line = frame.split('\n').find((l) => l.startsWith('data:'));
            if (!line) continue;

            const payload = line.slice(5).trim();

            if (payload === '[DONE]') {
                return full;
            }

            const parsed = JSON.parse(payload);

            if (parsed.error) {
                throw new Error(parsed.error);
            }

            if (parsed.delta) {
                full += parsed.delta;
                onDelta(parsed.delta);
            }
        }
    }

    return full;
}

/**
 * Image generation entry point. Requires a Gemini key on the account.
 *
 * @param {string} prompt
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ url: string }>} a data: URL ready for an <img> tag
 */
export async function generateImageWithUserKey(prompt, signal) {
    try {
        const response = await apiClient('/ai/proxy/image', {
            method: 'POST',
            body: { prompt },
            signal,
        });

        const { mime_type: mimeType, data } = response?.data ?? {};

        if (!data) {
            throw new Error('No image was returned. Try rephrasing your prompt.');
        }

        return { url: `data:${mimeType || 'image/png'};base64,${data}` };
    } catch (error) {
        throw readError(error, 'Image generation failed. Please try again.');
    }
}
