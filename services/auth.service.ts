import api, { ApiResponse, AuthResponse } from './api';

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    }
    throw new Error(response.data.error || 'Registration failed');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    }
    throw new Error(response.data.error || 'Login failed');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};