import React, { useEffect, useState } from 'react';
import api from '../utils/api';

console.log('RoleManagement component mounted');

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleForm, setRoleForm] = useState<Partial<Role>>({});
  const [permissionForm, setPermissionForm] = useState<Partial<Permission>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // New state for permission assignment modal
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [permRolePerms, setPermRolePerms] = useState<number[]>([]);
  const [permLoading, setPermLoading] = useState(false);

  // Fetch roles and permissions
  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (err: any) {
      setError('Failed to fetch roles or permissions.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch permissions for a role
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const res = await api.get(`/roles/${roleId}/permissions`);
      setPermRolePerms(res.data.map((p: Permission) => p.id));
    } catch {
      setPermRolePerms([]);
    }
  };

  // Open permission modal
  const openPermModal = async (role: Role) => {
    setPermRole(role);
    setPermModalOpen(true);
    setPermLoading(true);
    await fetchRolePermissions(role.id);
    setPermLoading(false);
  };

  // Submit permission assignments
  const handlePermAssign = async () => {
    if (!permRole) return;
    setPermLoading(true); setError(null); setSuccess(null);
    try {
      await api.post(`/roles/${permRole.id}/permissions`, { permissions: permRolePerms });
      setSuccess('Permissions updated.');
      setPermModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update permissions.');
    } finally {
      setPermLoading(false);
    }
  };

  // Role CRUD
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      if (roleForm.id) {
        await api.put(`/roles/${roleForm.id}`, roleForm);
        setSuccess('Role updated.');
      } else {
        await api.post('/roles', roleForm);
        setSuccess('Role created.');
      }
      setRoleForm({});
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save role.');
    }
  };
  const handleRoleDelete = async (id: number) => {
    if (!window.confirm('Delete this role?')) return;
    setError(null); setSuccess(null);
    try {
      await api.delete(`/roles/${id}`);
      setSuccess('Role deleted.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete role.');
    }
  };

  // Permission CRUD
  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      if (permissionForm.id) {
        await api.put(`/permissions/${permissionForm.id}`, permissionForm);
        setSuccess('Permission updated.');
      } else {
        await api.post('/permissions', permissionForm);
        setSuccess('Permission created.');
      }
      setPermissionForm({});
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save permission.');
    }
  };
  const handlePermissionDelete = async (id: number) => {
    if (!window.confirm('Delete this permission?')) return;
    setError(null); setSuccess(null);
    try {
      await api.delete(`/permissions/${id}`);
      setSuccess('Permission deleted.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete permission.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Role Management</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <section>
        <h3>Roles</h3>
        <form onSubmit={handleRoleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Role name"
            value={roleForm.name || ''}
            onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={roleForm.description || ''}
            onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
          />
          <button type="submit">{roleForm.id ? 'Update' : 'Add'} Role</button>
          {roleForm.id && <button type="button" onClick={() => setRoleForm({})}>Cancel</button>}
        </form>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Permissions</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>
                  <button onClick={() => openPermModal(role)}>Manage Permissions</button>
                </td>
                <td>
                  <button onClick={() => setRoleForm(role)}>Edit</button>
                  <button onClick={() => handleRoleDelete(role.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Permission Assignment Modal */}
        {permModalOpen && permRole && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 350 }}>
              <h4>Manage Permissions for: {permRole.name}</h4>
              {permLoading ? <div>Loading...</div> : (
                <>
                  <select
                    multiple
                    style={{ width: '100%', minHeight: 120 }}
                    value={permRolePerms.map(String)}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                      setPermRolePerms(options);
                    }}
                  >
                    {permissions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                    ))}
                  </select>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button onClick={handlePermAssign} disabled={permLoading}>Save</button>
                    <button onClick={() => setPermModalOpen(false)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
      <section style={{ marginTop: 40 }}>
        <h3>Permissions</h3>
        <form onSubmit={handlePermissionSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Permission name"
            value={permissionForm.name || ''}
            onChange={e => setPermissionForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={permissionForm.description || ''}
            onChange={e => setPermissionForm(f => ({ ...f, description: e.target.value }))}
          />
          <button type="submit">{permissionForm.id ? 'Update' : 'Add'} Permission</button>
          {permissionForm.id && <button type="button" onClick={() => setPermissionForm({})}>Cancel</button>}
        </form>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {permissions.map(perm => (
              <tr key={perm.id}>
                <td>{perm.name}</td>
                <td>{perm.description}</td>
                <td>
                  <button onClick={() => setPermissionForm(perm)}>Edit</button>
                  <button onClick={() => handlePermissionDelete(perm.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default RoleManagement;
