import axios, { AxiosInstance, AxiosError } from 'axios';

// Base response types (matching backend)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  deviceId: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface EventResponse {
  id: number;
  deviceId: string;
  timestamp: string;
  type: number;
  details: unknown;
  createdAt: string;
}

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nepal-api.indirex.io/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  deviceId: string;
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
        localStorage.setItem('deviceId', response.data.data.user.deviceId);
        document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `userId=${response.data.data.user.id}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `email=${response.data.data.user.email}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `name=${response.data.data.user.name || ''}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `deviceId=${response.data.data.user.deviceId}; path=/; max-age=86400; SameSite=Strict`;
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
        localStorage.setItem('deviceId', response.data.data.user.deviceId);
        document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `userId=${response.data.data.user.id}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `email=${response.data.data.user.email}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `name=${response.data.data.user.name || ''}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `deviceId=${response.data.data.user.deviceId}; path=/; max-age=86400; SameSite=Strict`;
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
    localStorage.removeItem('deviceId');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'userId=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'email=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'name=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'deviceId=; path=/; max-age=0; SameSite=Strict';
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUserData = (): { userId: string | null; email: string | null; name: string | null; deviceId: string | null } => {
  if (typeof window !== 'undefined') {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      name: localStorage.getItem('name'),
      deviceId: localStorage.getItem('deviceId'),
    };
  }
  return { userId: null, email: null, name: null, deviceId: null };
};