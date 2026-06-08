import { apiClient } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BASE = '/scholar';

export const scholarService = {
    list: () => apiClient(BASE),

    create: async ({ prompt, exportFormat = 'pdf', citationStyle = 'apa', uploads = [] }) => {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('export_format', exportFormat);
        formData.append('citation_style', citationStyle);
        uploads.forEach(file => formData.append('uploads[]', file));

        const res = await fetch(`${BASE_URL}${BASE}`, {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' },
            body: formData,
        });
        const result = await res.json();
        if (res.ok) return result;
        return Promise.reject(result);
    },

    show: (ulid) => apiClient(`${BASE}/${ulid}`),

    destroy: (ulid) => apiClient(`${BASE}/${ulid}`, { method: 'DELETE' }),

    approveOutline: (ulid) => apiClient(`${BASE}/${ulid}/approve-outline`, { method: 'POST' }),

    showChapter: (ulid, chapterNumber) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterNumber}`),

    updateChapter: (ulid, chapterId, content) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}`, {
            method: 'PATCH',
            body: JSON.stringify({ content }),
        }),

    approveChapter: (ulid, chapterId) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}/approve`, { method: 'POST' }),

    retryChapter: (ulid, chapterId) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}/retry`, { method: 'POST' }),

    exportUrl: (ulid) => `${BASE_URL}${BASE}/${ulid}/export`,
};
