import api from './api';
import { ApiResponse, LoginResponse, User } from '@/types';

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', data).then((r) => r.data.data),

  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }).then((r) => r.data.data),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/auth/me', data).then((r) => r.data.data),
};
