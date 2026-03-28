import apiClient, { tokenManager } from './client';
import { AuthTokens, LoginCredentials, User, UserRegistration } from '../types';

export const authApi = {
  // Register new user
  register: async (data: UserRegistration): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register/', data);
    return response.data;
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login/', credentials);
    const { access, refresh } = response.data;
    tokenManager.setTokens(access, refresh);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/auth/profile/', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> => {
    await apiClient.post('/auth/password/change/', data);
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password/reset/', { email });
  },

  // Confirm password reset
  confirmPasswordReset: async (data: {
    token: string;
    password: string;
    password_confirm: string;
  }): Promise<void> => {
    await apiClient.post('/auth/password/reset/confirm/', data);
  },
};
