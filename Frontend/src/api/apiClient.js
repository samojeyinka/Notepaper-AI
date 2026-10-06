/**
 * Base API Client
 * Token is stored in memory only (not localStorage/cookies).
 * AuthContext injects the token via setApiToken() after login.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://notepaperai-api.synchrome.co/api/v1';

// Token is no longer kept in memory or headers! 
// It is securely sent to the backend as an HttpOnly cookie automatically.

export const apiClient = async (endpoint, { body, method, ...customConfig } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    method: method || (body ? 'POST' : 'GET'),
    credentials: 'include', // <--- CRITICAL for sending cookies cross-origin
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Request failed');
      error.errors = errorData.errors;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    return Promise.reject(error);
  }
};