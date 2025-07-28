import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Base URL for all API calls
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// 1. Public API instance for non-authenticated routes (login, register)
const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 2. Authenticated API instance with JWT token in Authorization header
const createAuthenticatedApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  // Request interceptor to add Authorization header
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor to handle authentication errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear invalid token
        localStorage.removeItem('token');
        // Redirect to login only if not already on a public page
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

// Getter to create a fresh authenticated instance for each call
const getAuthenticatedApi = () => createAuthenticatedApi();

// 3. API endpoint definitions

// Auth API: Uses public instance (no authentication required)
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    publicApi.post('/login', credentials),
  register: (userData: { email: string; password: string }) =>
    publicApi.post('/register', userData),
};

// User API: Uses authenticated instance (requires JWT token)
export const userAPI = {
  getUsers: () => getAuthenticatedApi().get('/users'),
  createUser: (userData: { email: string; password: string; role: string }) =>
    getAuthenticatedApi().post('/users', userData),
  updateUser: (id: number, userData: { email?: string; password?: string; role?: string }) =>
    getAuthenticatedApi().put(`/users/${id}`, userData),
  deleteUser: (id: number) => getAuthenticatedApi().delete(`/users/${id}`),
  assignRole: (userId: number, role: string) =>
    getAuthenticatedApi().post('/assign-role', { userId, role }),
};

// Audit API: Uses authenticated instance (requires JWT token)
export const auditAPI = {
  getAuditLogs: () => getAuthenticatedApi().get('/audit-log'),
};

// Roles API: Uses authenticated instance (requires JWT token)
export const rolesAPI = {
  getRoles: () => getAuthenticatedApi().get('/roles'),
  createRole: (roleData: { name: string; description: string }) =>
    getAuthenticatedApi().post('/roles', roleData),
  updateRole: (id: number, roleData: { name?: string; description?: string }) =>
    getAuthenticatedApi().put(`/roles/${id}`, roleData),
  deleteRole: (id: number) => getAuthenticatedApi().delete(`/roles/${id}`),
  getRolePermissions: (roleId: number) => getAuthenticatedApi().get(`/roles/${roleId}/permissions`),
  updateRolePermissions: (roleId: number, permissions: number[]) =>
    getAuthenticatedApi().put(`/roles/${roleId}/permissions`, { permissions }),
};

// Permissions API: Uses authenticated instance (requires JWT token)
export const permissionsAPI = {
  getPermissions: () => getAuthenticatedApi().get('/permissions'),
  createPermission: (permissionData: { name: string; description: string }) =>
    getAuthenticatedApi().post('/permissions', permissionData),
  updatePermission: (id: number, permissionData: { name?: string; description?: string }) =>
    getAuthenticatedApi().put(`/permissions/${id}`, permissionData),
  deletePermission: (id: number) => getAuthenticatedApi().delete(`/permissions/${id}`),
};
