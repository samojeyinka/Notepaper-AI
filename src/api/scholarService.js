import { apiClient } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BASE = '/scholar';

export const scholarService = {
    list: () => apiClient(BASE),

    create: async ({ prompt, citationStyle = 'apa', pageCount = 20, includeToc = true, pageNumbering = true, includeReferences = true, uploads = [] }) => {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('citation_style', citationStyle);
        formData.append('page_count', pageCount);
        formData.append('include_toc', includeToc ? '1' : '0');
        formData.append('page_numbering', pageNumbering ? '1' : '0');
        formData.append('include_references', includeReferences ? '1' : '0');
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
            body: { content },
        }),

    approveChapter: (ulid, chapterId) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}/approve`, { method: 'POST' }),

    retryOutline: (ulid) =>
        apiClient(`${BASE}/${ulid}/retry-outline`, { method: 'POST' }),

    retryChapter: (ulid, chapterId) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}/retry`, { method: 'POST' }),

    deleteChapter: (ulid, chapterId) =>
        apiClient(`${BASE}/${ulid}/chapters/${chapterId}`, { method: 'DELETE' }),

    addChapter: (ulid, title) =>
        apiClient(`${BASE}/${ulid}/chapters`, {
            method: 'POST',
            body: { title },
        }),

    reorderChapters: (ulid, orderedIds) =>
        apiClient(`${BASE}/${ulid}/chapters/reorder`, {
            method: 'PATCH',
            body: { order: orderedIds },
        }),

    updateBibliography: (ulid, citations) =>
        apiClient(`${BASE}/${ulid}/bibliography`, {
            method: 'PATCH',
            body: { citations },
        }),

    exportUrl: (ulid) => `${BASE_URL}${BASE}/${ulid}/export`,

    updateCover: (ulid, coverData) =>
        apiClient(`${BASE}/${ulid}/cover`, {
            method: 'PATCH',
            body: coverData,
        }),
};
