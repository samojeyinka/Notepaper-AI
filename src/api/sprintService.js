import { apiClient } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BASE = '/ai/sprints';

export const sprintService = {
    list: () => apiClient(BASE),

    create: async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.goal) formData.append('goal', data.goal);
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);

        (data.material_ids || []).forEach((mat, i) => {
            formData.append(`material_ids[${i}][type]`, mat.type);
            formData.append(`material_ids[${i}][id]`, mat.id);
        });

        (data.uploads || []).forEach(file => formData.append('uploads[]', file));

        const response = await fetch(`${BASE_URL}${BASE}`, {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' },
            body: formData,
        });
        const result = await response.json();
        if (response.ok) return result;
        return Promise.reject(result);
    },

    show: (id) => apiClient(`${BASE}/${id}`),

    destroy: (id) => apiClient(`${BASE}/${id}`, { method: 'DELETE' }),

    showChallenge: (sprintId, challengeId) =>
        apiClient(`${BASE}/${sprintId}/challenges/${challengeId}`),

    completeChallenge: (sprintId, challengeId) =>
        apiClient(`${BASE}/${sprintId}/challenges/${challengeId}/complete`, { method: 'POST' }),
};
