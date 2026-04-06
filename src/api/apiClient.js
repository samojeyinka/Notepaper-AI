/**
 * Base API Client
 * Token is stored in memory only (not localStorage/cookies).
 * AuthContext injects the token via setApiToken() after login.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Token is no longer kept in memory or headers! 
// It is securely sent to the backend as an HttpOnly cookie automatically.

export const apiClient = async (endpoint, { body, method, ...customConfig } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // We NO LONGER set 'Authorization: Bearer' manually.
  // The browser automatically attaches the HttpOnly cookie.

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
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    return Promise.reject(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
