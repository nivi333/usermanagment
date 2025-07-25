import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add request interceptor to include auth token

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { email: string; password: string }) => api.post('/login', credentials),
  register: (userData: { email: string; password: string }) => api.post('/register', userData),
  refreshToken: () => api.post('/refresh'),
};

// User API calls
export const userAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData: { email: string; password: string; role: string }) => api.post('/users', userData),
  updateUser: (id: number, userData: { email?: string; password?: string; role?: string }) => api.put(`/users/${id}`, userData),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  assignRole: (userId: number, role: string) => api.post('/assign-role', { userId, role }),
};

// Audit API calls
export const auditAPI = {
  getAuditLogs: () => api.get('/audit-log'),
};

export default api;
