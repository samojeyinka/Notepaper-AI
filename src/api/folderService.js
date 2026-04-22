import { apiClient } from './apiClient';

const BASE = '/workspace/folders';

export const folderService = {
  list:   (params = '') => apiClient(`${BASE}${params ? `?${params}` : ''}`),
  get:    (id)          => apiClient(`${BASE}/${id}`),
  create: (payload)     => apiClient(BASE, { method: 'POST', body: payload }),
  update: (id, payload) => apiClient(`${BASE}/${id}`, { method: 'PATCH', body: payload }),
};
