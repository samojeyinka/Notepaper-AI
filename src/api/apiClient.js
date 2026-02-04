/**
 * Base API Client
 * This is where you configure your base URL, headers, and interceptors.
 * You can easily swap 'fetch' for 'axios' here if needed.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  
  // You can add auth tokens here from localStorage/context
  // const token = localStorage.getItem('token');
  // if (token) headers.Authorization = `Bearer ${token}`;

  const config = {
    method: body ? 'POST' : 'GET',
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
    
    throw new Error(data.message || 'Something went wrong');
  } catch (error) {
    return Promise.reject(error.message || error);
  }
};
