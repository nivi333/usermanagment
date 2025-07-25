import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Typography, Table, Card, Modal, Form, 
  Input, Select, Space, Avatar, message, Popconfirm, Tag 
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
  user: User;
  onLogout: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ user, onLogout }) => {
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
        message.success('User updated successfully');
      } else {
        await userAPI.createUser(values);
        message.success('User created successfully');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to save user');
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
          <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
          <Popconfirm title="Are you sure?" onConfirm={() => handleDeleteUser(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
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
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginBottom: 16 }}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
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
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserManagement;
