import { apiClient } from './apiClient';

export const userService = {
  getProfile: () => {
    return apiClient('/users/profile');
  },

  updatePersonalInfo: (data) => {
    return apiClient('/users/personal-info', { method: 'PATCH', body: data });
  },

  // Password Change
  requestPasswordChange: () => {
    return apiClient('/users/request-password-change', {method: 'POST'});
  },

  changePassword: (data) => {
    return apiClient('/users/change-password', { method: 'POST', body: data });
  },

  getUserTypes: () => {
    return apiClient('/users/user-types');
  },

  // 2FA
  setup2fa: () => {
    return apiClient('/users/google-2fa', { method: 'POST' });
  },

  enable2fa: (otp) => {
    return apiClient('/users/enable-google-2fa', { method: 'POST', body: { otp } });
  },

  disable2fa: (otp) => {
    return apiClient('/users/disable-google-2fa', { method: 'POST', body: { otp } });
  },

  // Account Deletion
  requestAccountDeletion: () => {
    return apiClient('/users/request-account-deletion', { method: 'POST' });
  },

  deleteAccount: (data) => {
    return apiClient('/users/delete-account', { method: 'DELETE', body: data });
  },
};
