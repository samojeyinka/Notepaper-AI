import { apiClient } from './apiClient';

export const quizService = {
    list: (params = {}) => {
        const query = new URLSearchParams();
        if (params.page)      query.set('page',      params.page);
        if (params.sort)      query.set('sort',      params.sort);
        if (params.searching) query.set('searching', params.searching);
        const qs = query.toString();
        return apiClient(`/workspace/quizzes${qs ? '?' + qs : ''}`);
    },

    create: (data) => apiClient('/workspace/quizzes', {
        method: 'POST',
        body: data,
    }),

    show: (id) => apiClient(`/workspace/quizzes/${id}`),

    delete: (id) => apiClient(`/workspace/quizzes/${id}`, { method: 'DELETE' }),
};
