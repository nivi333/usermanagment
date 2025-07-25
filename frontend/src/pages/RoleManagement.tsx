import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, Typography, Form, Input, Button, Table, Modal, Select, Alert, Space, message } from 'antd';

const { Title } = Typography;

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
    <Card style={{ maxWidth: 900, margin: '2rem auto', borderRadius: 12 }} bodyStyle={{ padding: 32 }}>
      <Title level={2} style={{ marginBottom: 16 }}>Role Management</Title>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}
      <Space direction="vertical" size={32} style={{ width: '100%' }}>
        <Card type="inner" title="Roles" style={{ borderRadius: 8 }}>
          <Form layout="inline" onFinish={handleRoleSubmit} style={{ marginBottom: 16 }}>
            <Form.Item>
              <Input
                placeholder="Role name"
                value={roleForm.name || ''}
                onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                required
                style={{ minWidth: 140 }}
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder="Description"
                value={roleForm.description || ''}
                onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                style={{ minWidth: 180 }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">{roleForm.id ? 'Update' : 'Add'} Role</Button>
            </Form.Item>
            {roleForm.id && (
              <Form.Item>
                <Button onClick={() => setRoleForm({})}>Cancel</Button>
              </Form.Item>
            )}
          </Form>
          <Table
            dataSource={roles}
            rowKey="id"
            pagination={false}
            bordered
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Description', dataIndex: 'description' },
              {
                title: 'Permissions',
                render: (_, role) => (
                  <Button size="small" onClick={() => openPermModal(role)}>Manage</Button>
                )
              },
              {
                title: 'Actions',
                render: (_, role) => (
                  <Space>
                    <Button size="small" onClick={() => setRoleForm(role)}>Edit</Button>
                    <Button size="small" danger onClick={() => handleRoleDelete(role.id)}>Delete</Button>
                  </Space>
                )
              }
            ]}
          />
          <Modal
            open={permModalOpen}
            title={`Manage Permissions for: ${permRole?.name}`}
            onCancel={() => setPermModalOpen(false)}
            onOk={handlePermAssign}
            okText="Save"
            confirmLoading={permLoading}
            cancelText="Cancel"
          >
            {permLoading ? (
              <div>Loading...</div>
            ) : (
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                value={permRolePerms}
                onChange={setPermRolePerms}
                placeholder="Select permissions"
                optionFilterProp="children"
              >
                {permissions.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.name} - {p.description}</Select.Option>
                ))}
              </Select>
            )}
          </Modal>
        </Card>
        <Card type="inner" title="Permissions" style={{ borderRadius: 8 }}>
          <Form layout="inline" onFinish={handlePermissionSubmit} style={{ marginBottom: 16 }}>
            <Form.Item>
              <Input
                placeholder="Permission name"
                value={permissionForm.name || ''}
                onChange={e => setPermissionForm(f => ({ ...f, name: e.target.value }))}
                required
                style={{ minWidth: 140 }}
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder="Description"
                value={permissionForm.description || ''}
                onChange={e => setPermissionForm(f => ({ ...f, description: e.target.value }))}
                style={{ minWidth: 180 }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">{permissionForm.id ? 'Update' : 'Add'} Permission</Button>
            </Form.Item>
            {permissionForm.id && (
              <Form.Item>
                <Button onClick={() => setPermissionForm({})}>Cancel</Button>
              </Form.Item>
            )}
          </Form>
          <Table
            dataSource={permissions}
            rowKey="id"
            pagination={false}
            bordered
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Description', dataIndex: 'description' },
              {
                title: 'Actions',
                render: (_, perm) => (
                  <Space>
                    <Button size="small" onClick={() => setPermissionForm(perm)}>Edit</Button>
                    <Button size="small" danger onClick={() => handlePermissionDelete(perm.id)}>Delete</Button>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </Space>
    </Card>
  );
};

export default RoleManagement;
