import { apiClient } from './apiClient';

/**
 * Example User Service
 * All API calls related to users should be handled here.
 */

export const userService = {
  getProfile: () => {
    return apiClient('/user/profile');
  },
  
  updateProfile: (userData) => {
    return apiClient('/user/profile', {
      method: 'PUT',
      body: userData,
    });
  },
  
  // Example of a custom endpoint
  getStats: () => {
    return apiClient('/user/stats');
  }
};
