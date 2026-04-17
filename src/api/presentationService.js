import { apiClient } from './apiClient';

const BASE = '/workspace/presentations';

export const presentationService = {
  list:    () => apiClient(BASE),
  create:  (payload) => apiClient(BASE, { method: 'POST', body: payload }),
  get:     (id) => apiClient(`${BASE}/${id}`),
  update:  (id, payload) => apiClient(`${BASE}/${id}`, { method: 'PATCH', body: payload }),
  destroy: (id) => apiClient(`${BASE}/${id}`, { method: 'DELETE' }),
};
