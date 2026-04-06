import { apiClient } from './apiClient';

export const authService = {
  login: (credentials) => {
    return apiClient('/auth/signin', {
      method: 'POST',
      body: credentials,
    });
  },

  verify2fa: (data) => {
    return apiClient('/auth/2fa', {
      method: 'POST',
      body: data,
    });
  },

  signup: (userData) => {
    return apiClient('/auth/signup', {
      method: 'POST',
      body: userData,
      headers: {
        'Accept': 'application/json',
      }
    });
  },
  
  verify: (data) => {
    return apiClient('/auth/verify', {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
      }
    });
  },
  
  resendVerification: (data) => {
    return apiClient('/auth/resend-verification', {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
      }
    });
  },

  logout: () => {
    return apiClient('/auth/signout', { method: 'POST' });
  },

  requestPasswordReset: (email) => {
    return apiClient('/auth/request-password-reset-token', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword: (data) => {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: data,
    });
  },

  requestRestoreAccount: (email) => {
    return apiClient('/auth/request-restore-account', {
      method: 'POST',
      body: { email },
    });
  },

  restoreAccount: (data) => {
    return apiClient('/auth/restore-account', {
      method: 'PATCH',
      body: data,
    });
  },
};
