import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import RoleManagement from './RoleManagement';
import { rolesAPI, permissionsAPI } from '../utils/api';

// Helper to create a mock AxiosResponse
const createMockResponse = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: { 'Content-Type': 'application/json' },
  config: {} as any, // Using 'as any' for simplicity in a test environment
});

// Mock the entire module to control the API implementations
jest.mock('../utils/api', () => ({
  __esModule: true, // Handle ES module interop
  rolesAPI: {
    getRoles: jest.fn(),
    createRole: jest.fn(),
    deleteRole: jest.fn(),
    updateRolePermissions: jest.fn(),
  },
  permissionsAPI: {
    getPermissions: jest.fn(),
    createPermission: jest.fn(),
    deletePermission: jest.fn(),
  },
}));

// Create typed mocks for easier usage and type-safety in tests
const mockedRolesAPI = rolesAPI as jest.Mocked<typeof rolesAPI>;
const mockedPermissionsAPI = permissionsAPI as jest.Mocked<typeof permissionsAPI>;

describe('RoleManagement Page', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();

    // Provide default mock implementations for GET calls
    mockedRolesAPI.getRoles.mockResolvedValue(createMockResponse([]));
    mockedPermissionsAPI.getPermissions.mockResolvedValue(createMockResponse([]));
  });

  it('renders roles and permissions sections and fetches initial data', async () => {
    render(<RoleManagement />);
    expect(screen.getByText(/Role Management/i)).toBeInTheDocument();

    // Verify that the component called the APIs to fetch initial data
    await waitFor(() => expect(mockedRolesAPI.getRoles).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedPermissionsAPI.getPermissions).toHaveBeenCalledTimes(1));

    // Check that the main sections are rendered
    expect(screen.getByText(/Roles/i)).toBeInTheDocument();
    expect(screen.getByText(/Permissions/i)).toBeInTheDocument();
  });

  it('submits a new role and updates the role list', async () => {
    const newRole = { id: 1, name: 'admin', description: 'Administrator role' };
    mockedRolesAPI.createRole.mockResolvedValue(createMockResponse(newRole));

    render(<RoleManagement />);

    // Fill out and submit the new role form
    fireEvent.change(screen.getByPlaceholderText('Role name'), { target: { value: newRole.name } });
    fireEvent.change(screen.getByPlaceholderText('Role description'), { target: { value: newRole.description } });
    fireEvent.submit(screen.getByText('Add Role').closest('form')!);

    // Check that the createRole API was called with the correct payload
    await waitFor(() =>
      expect(mockedRolesAPI.createRole).toHaveBeenCalledWith({ name: newRole.name, description: newRole.description }),
    );

    // After creating, the component should refetch the roles list
    await waitFor(() => expect(mockedRolesAPI.getRoles).toHaveBeenCalledTimes(2));
  });

  it('submits a new permission and updates the permission list', async () => {
    const newPermission = { id: 1, name: 'edit:posts', description: 'Can edit posts' };
    mockedPermissionsAPI.createPermission.mockResolvedValue(createMockResponse(newPermission));

    render(<RoleManagement />);

    // Fill out and submit the new permission form
    fireEvent.change(screen.getByPlaceholderText('Permission name'), { target: { value: newPermission.name } });
    fireEvent.change(screen.getByPlaceholderText('Permission description'), { target: { value: newPermission.description } });
    fireEvent.submit(screen.getByText('Add Permission').closest('form')!);

    // Check that the createPermission API was called with the correct payload
    await waitFor(() =>
      expect(mockedPermissionsAPI.createPermission).toHaveBeenCalledWith({ name: newPermission.name, description: newPermission.description }),
    );

    // After creating, the component should refetch the permissions list
    await waitFor(() => expect(mockedPermissionsAPI.getPermissions).toHaveBeenCalledTimes(2));
  });
});
