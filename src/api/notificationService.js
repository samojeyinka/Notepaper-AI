import { apiClient } from './apiClient';

export const notificationService = {
    list: (page = 1) => apiClient(`/users/notifications?page=${page}`),
    markAsRead: (id) => apiClient(`/users/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => apiClient('/users/notifications/read-all', { method: 'POST' }),
    delete: (id) => apiClient(`/users/notifications/${id}`, { method: 'DELETE' }),
};
