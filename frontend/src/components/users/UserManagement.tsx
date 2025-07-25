import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Typography, Table, Card, Modal, Form, 
  Input, Select, Space, Avatar, message, Popconfirm, Tag, Alert 
} from 'antd';
import { 
  UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined 
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

interface UserManagementProps {
  onLogout: () => void;
}

import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC<UserManagementProps> = ({ onLogout }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return null; // Prevent null errors
  const [alert, setAlert] = useState<{visible: boolean; message: string; type?: 'success' | 'error'}>({visible: false, message: '', type: undefined});

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    onLogout();
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
      role: record.role
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await userAPI.deleteUser(userId);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, values);
        message.success('User updated successfully.', 3);
      } else {
        const res = await userAPI.createUser(values);
        message.success(res?.data?.message || 'User created successfully.', 3);
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      let errMsg = 'Failed to save user';
      if (error?.response?.data?.error) {
        errMsg = error.response.data.error;
      }
      setAlert({visible: true, message: errMsg});
      setTimeout(() => setAlert({visible: false, message: ''}), 3000);
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
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
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
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Title level={4} style={{ margin: 0 }}>User Management</Title>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user.email}</Text>
            <Text type="secondary">({user.role})</Text>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            {isAdmin && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                style={{ marginBottom: 16 }}
                onClick={handleCreateUser}
              >
                Add User
              </Button>
            )}
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              bordered
            />
            <Modal
              visible={modalVisible}
              title={editingUser ? 'Edit User' : 'Add User'}
              onCancel={() => setModalVisible(false)}
              onOk={handleModalOk}
              okText={editingUser ? 'Update' : 'Create'}
            >
              {alert.visible && (
                <div style={{ marginBottom: 16 }}>
                  <Alert message={alert.message} type={alert.type || 'error'} showIcon />
                </div>
              )}
              <Form
                form={form}
                layout="vertical"
                initialValues={{ role: 'user' }}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input the email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Please select a role!' }]}
                >
                  <Select
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' }
                    ]}
                  />
                </Form.Item>
                {/* Password field only for creation */}
                {editingUser === null && (
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: 'Please input the password!' },
                      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Password must be at least 8 characters, include upper, lower, and digit.' }
                    ]}
                  >
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                )}
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserManagement;
