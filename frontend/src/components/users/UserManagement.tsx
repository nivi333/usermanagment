import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Table,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Avatar,
  notification,
  Popconfirm,
  Tag,
  Alert,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
// Use Select.Option for options below

interface User {
  id: number;
  email: string;
  role: string;
}

import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Filter users by search and role
  const filteredUsers = users.filter((u) => {
    const matchEmail = u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchEmail && matchRole;
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch users. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!user) return null; // Prevent null errors

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      email: record.email,
      role: record.role,
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await userAPI.deleteUser(userId);
      notification.success({
        message: 'Success',
        description: 'User deleted successfully.',
      });
      fetchUsers();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete user. Please try again.',
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, values);
        notification.success({
          message: 'Success',
          description: 'User updated successfully.',
        });
      } else {
        await userAPI.createUser(values);
        notification.success({
          message: 'Success',
          description: 'User created successfully.',
        });
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      const description =
        error.response?.data?.error || 'An unexpected error occurred. Please try again.';
      notification.error({ message: 'Error', description });
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'geekblue' : 'green'}>{role}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          {isAdmin && <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)} />}
          {isAdmin && (
            <Popconfirm title="Are you sure?" onConfirm={() => handleDeleteUser(record.id)}>
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          User Management
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['users']}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Dashboard</Link>,
            },
            {
              key: 'users',
              icon: <TeamOutlined />,
              label: 'User Management',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            User Management
          </Title>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user.email}</Text>
            <Text type="secondary">({user.role})</Text>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <Card
            title={
              <Title level={3} style={{ marginBottom: 0 }}>
                Users
              </Title>
            }
            extra={
              isAdmin && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                  aria-label="Add new user"
                >
                  Add User
                </Button>
              )
            }
            style={{ maxWidth: 1000, margin: '0 auto', minHeight: 400 }}
          >
            {/* Filter/Search Bar */}
            <Space
              style={{ marginBottom: 16, flexWrap: 'wrap' }}
              direction="horizontal"
              size={[8, 8]}
            >
              <Input
                placeholder="Search email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users by email"
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                style={{ width: 160 }}
                aria-label="Filter users by role"
              >
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
              </Select>
            </Space>
            {/* User Table with accessibility and empty state */}
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: <span>No users found.</span>,
              }}
              scroll={{ x: 'max-content' }}
              aria-label="User list table"
            />
          </Card>
          {/* Modal for Add/Edit User with accessible labels */}
          <Modal
            title={editingUser ? 'Edit User' : 'Add User'}
            open={modalVisible}
            onOk={handleModalOk}
            onCancel={() => setModalVisible(false)}
            okText={editingUser ? 'Update' : 'Create'}
            destroyOnClose
            aria-label={editingUser ? 'Edit user modal' : 'Add user modal'}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ role: 'user' }}
              preserve={false}
              validateTrigger="onChange"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input prefix={<MailOutlined />} aria-label="User email" />
              </Form.Item>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Role is required' }]}
              >
                <Select aria-label="User role">
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="user">User</Select.Option>
                </Select>
              </Form.Item>
              {/* Password field only for creation */}
              {editingUser === null && (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Password is required' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                      message:
                        'Password must be at least 8 characters, include upper, lower, and digit.',
                    },
                  ]}
                >
                  <Input.Password aria-label="User password" />
                </Form.Item>
              )}
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserManagement;
