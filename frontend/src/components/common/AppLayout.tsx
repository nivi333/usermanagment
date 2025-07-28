import React from 'react';
import { Layout, Menu, Button, Typography, Avatar, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  user: { email: string; role: string } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ user, onLogout, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="dark">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ color: 'white' }}>
            User Management
          </Title>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/users" icon={<TeamOutlined />}>
            <Link to="/users">User Management</Link>
          </Menu.Item>
          <Menu.Item key="/role-management" icon={<SafetyCertificateOutlined />}>
            <Link to="/role-management">Roles & Permissions</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Space size="middle">
            <Avatar icon={<UserOutlined />} />
            <Typography.Text>{user?.email}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
