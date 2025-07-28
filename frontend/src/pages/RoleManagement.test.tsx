import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoleManagement from './RoleManagement';
import api from '../utils/api';

jest.mock('../utils/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('RoleManagement Page', () => {
  beforeEach(() => {
    mockedApi.get
      .mockResolvedValueOnce({ data: [] }) // roles
      .mockResolvedValueOnce({ data: [] }); // permissions
  });

  it('renders roles and permissions sections', async () => {
    render(<RoleManagement />);
    expect(screen.getByText(/Role Management/i)).toBeInTheDocument();
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/roles'));
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/permissions'));
    expect(screen.getByText(/Roles/i)).toBeInTheDocument();
    expect(screen.getByText(/Permissions/i)).toBeInTheDocument();
  });

  it('submits new role', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 1, name: 'admin', description: '' } });
    render(<RoleManagement />);
    fireEvent.change(screen.getByPlaceholderText('Role name'), { target: { value: 'admin' } });
    fireEvent.submit(screen.getByText('Add Role').closest('form')!);
    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/roles',
        expect.objectContaining({ name: 'admin' }),
      ),
    );
  });

  it('submits new permission', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 1, name: 'perm', description: '' } });
    render(<RoleManagement />);
    fireEvent.change(screen.getByPlaceholderText('Permission name'), { target: { value: 'perm' } });
    fireEvent.submit(screen.getByText('Add Permission').closest('form')!);
    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/permissions',
        expect.objectContaining({ name: 'perm' }),
      ),
    );
  });
});
