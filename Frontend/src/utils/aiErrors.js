// Provider backends (especially the Gemini free tier) frequently return
// 429/503 "high demand" errors under load, and the Vercel AI SDK wraps these in
// an AI_RetryError after exhausting retries. Detect that case so we can tell the
// user what's actually going on instead of a generic "please try again".
const OVERLOAD_PATTERN = /high demand|overloaded|quota|rate.?limit|too many requests|resource_exhausted|unavailable|\b429\b|\b503\b/i;

export function isAIOverloadedError(err) {
    if (!err) return false;
    if (err.name === 'AI_RetryError') return true;
    const msg = err.message || err.lastError?.message || '';
    return OVERLOAD_PATTERN.test(msg);
}

export const AI_OVERLOAD_MESSAGE =
    'Your AI provider is overloaded right now — this usually happens at peak times. Wait a few minutes and try again, or switch to another model in Settings.';

export function friendlyAIError(err, fallback) {
    return isAIOverloadedError(err) ? AI_OVERLOAD_MESSAGE : fallback;
}
