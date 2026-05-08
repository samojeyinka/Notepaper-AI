const BASE = 'https://api.deepseek.com';

/**
 * Call DeepSeek v4 flash. Returns the raw text content from the model.
 * @param {string} prompt  - User message
 * @param {string|null} system - Optional system prompt
 */
export async function callDeepSeek(prompt, system = null) {
    const key = import.meta.env.VITE_DEEPSEEK_API_KEY;
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'deepseek-v4-flash',
            messages,
            stream: false,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `DeepSeek error ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}
