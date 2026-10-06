const BASE_URL = import.meta.env.VITE_API_URL || 'https://notepaperai-api.synchrome.co/api/v1';
const BASE = '/ai/generate';

// Reject with the parsed body, but keep the HTTP status so callers can detect
// 428 (missing API key) instead of string-matching the message.
const toError = (result, response) => {
    const payload = result && typeof result === 'object' && !Array.isArray(result)
        ? result
        : { message: String(result ?? 'Request failed.') };

    payload.status = response.status;

    return Promise.reject(payload);
};

const post = async (endpoint, { materialIds = [], uploads = [], ...params }) => {
    const formData = new FormData();

    Object.entries(params).forEach(([key, val]) => {
        if (val !== null && val !== undefined) formData.append(key, val);
    });

    materialIds.forEach((mat, i) => {
        formData.append(`material_ids[${i}][type]`, mat.type);
        formData.append(`material_ids[${i}][id]`, mat.id);
    });

    uploads.forEach(file => formData.append('uploads[]', file));

    const response = await fetch(`${BASE_URL}${BASE}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        body: formData,
    });

    const result = await response.json();
    if (response.ok) return result;
    return toError(result, response);
};

const expandPost = async ({ source_type, source_id }) => {
    const response = await fetch(`${BASE_URL}/ai/expand`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ source_type, source_id }),
    });
    const result = await response.json();
    if (response.ok) return result;
    return toError(result, response);
};

const simplifyPost = async ({ source_type, source_id }) => {
    const response = await fetch(`${BASE_URL}/ai/simplify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ source_type, source_id }),
    });
    const result = await response.json();
    if (response.ok) return result;
    return toError(result, response);
};


export const generateService = {
    flashcards: ({ materialIds, uploads, count, topic }) =>
        post('/flashcards', { materialIds, uploads, count, topic }),

    quiz: ({ materialIds, uploads, count, difficulty, question_type, topic }) =>
        post('/quiz', { materialIds, uploads, count, difficulty, question_type, topic }),

    presentation: ({ materialIds, uploads, slide_count, topic }) =>
        post('/presentation', { materialIds, uploads, slide_count, topic }),

    notes: ({ materialIds, uploads, topic, tone, length }) =>
        post('/notes', { materialIds, uploads, topic, tone, length }),

    expand: ({ source_type, source_id }) =>
        expandPost({ source_type, source_id }),

     simplify: ({ source_type, source_id }) =>
        simplifyPost({ source_type, source_id }),
    
};
