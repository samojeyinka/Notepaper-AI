import { apiClient } from './apiClient';

const BASE = '/workspace/presentations';

export const presentationService = {
  list:    (params = '') => apiClient(`${BASE}${params ? `?${params}` : ''}`),
  create:  (payload) => apiClient(BASE, { method: 'POST', body: payload }),
  get:     (id) => apiClient(`${BASE}/${id}`),
  update:  (id, payload) => apiClient(`${BASE}/${id}`, { method: 'PATCH', body: payload }),
  destroy: (id) => apiClient(`${BASE}/${id}`, { method: 'DELETE' }),
};
