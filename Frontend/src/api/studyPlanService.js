import { apiClient } from './apiClient';

export const studyPlanService = {
    list: () =>
        apiClient('/ai/study-plans'),

    create: (data) =>
        apiClient('/ai/study-plans', { method: 'POST', body: data }),

    get: (id) =>
        apiClient(`/ai/study-plans/${id}`),

    delete: (id) =>
        apiClient(`/ai/study-plans/${id}`, { method: 'DELETE' }),

    toggleTask: (planId, date, taskId) =>
        apiClient(`/ai/study-plans/${planId}/tasks`, {
            method: 'PATCH',
            body: { date, task_id: taskId },
        }),
};
