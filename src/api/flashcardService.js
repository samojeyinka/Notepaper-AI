import { apiClient } from './apiClient';

export const flashcardService = {
    list: (params = {}) => {
        const query = new URLSearchParams();
        if (params.folder_id)  query.set('folder_id',  params.folder_id);
        if (params.page)       query.set('page',       params.page);
        if (params.sort)       query.set('sort',       params.sort);
        if (params.searching)  query.set('searching',  params.searching);
        const qs = query.toString();
        return apiClient(`/workspace/flashcards${qs ? '?' + qs : ''}`);
    },

    create: (data) => apiClient('/workspace/flashcards', {
        method: 'POST',
        body: data,
    }),

    show: (id) => apiClient(`/workspace/flashcards/${id}`),

    update: (id, data) => apiClient(`/workspace/flashcards/${id}`, {
        method: 'PATCH',
        body: data,
    }),

    delete: (id) => apiClient(`/workspace/flashcards/${id}`, { method: 'DELETE' }),

    duplicate: (id) => apiClient(`/workspace/flashcards/duplicate/${id}`, { method: 'POST' }),
};
