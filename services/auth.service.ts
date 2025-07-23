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
        localStorage.setItem('userId', response.data.data.user.id);
        localStorage.setItem('email', response.data.data.user.email);
        localStorage.setItem('name', response.data.data.user.name || '');
        document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `userId=${response.data.data.user.id}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `email=${response.data.data.user.email}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `name=${response.data.data.user.name || ''}; path=/; max-age=86400; SameSite=Strict`;
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
        localStorage.setItem('userId', response.data.data.user.id);
        localStorage.setItem('email', response.data.data.user.email);
        localStorage.setItem('name', response.data.data.user.name || '');
        document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `userId=${response.data.data.user.id}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `email=${response.data.data.user.email}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `name=${response.data.data.user.name || ''}; path=/; max-age=86400; SameSite=Strict`;
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
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'userId=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'email=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'name=; path=/; max-age=0; SameSite=Strict';
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUserData = (): { userId: string | null; email: string | null; name: string | null } => {
  if (typeof window !== 'undefined') {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      name: localStorage.getItem('name'),
    };
  }
  return { userId: null, email: null, name: null };
};