import React from 'react';
import { Layout, Menu, Button, Typography, Card, Row, Col, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface DashboardProps {
  user: { email: string; role: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...(user.role === 'admin' ? [{
      key: 'users',
      icon: <TeamOutlined />,
      label: <Link to="/users">User Management</Link>,
    }] : []),
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
          defaultSelectedKeys={['dashboard']}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
          items={menuItems}
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
          <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user.email}</Text>
            <Text type="secondary">({user.role})</Text>
            {user.role === 'admin' && (
              <Button
                type="primary"
                icon={<span className="anticon"><svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="currentColor"><path d="M832 112H192c-44.2 0-80 35.8-80 80v640c0 44.2 35.8 80 80 80h640c44.2 0 80-35.8 80-80V192c0-44.2-35.8-80-80-80zm0 720H192V192h640v640zm-96-400c0-88.4-71.6-160-160-160s-160 71.6-160 160c0 70.7 45.8 130.5 110 151.2V736c0 13.3 10.7 24 24 24h52c13.3 0 24-10.7 24-24V583.2c64.2-20.7 110-80.5 110-151.2z"/></svg></span>}
                style={{ marginRight: 8 }}
                onClick={() => navigate('/role-management')}
              >
                Roles & Permissions
              </Button>
            )}
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
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card title="Welcome!" bordered={false}>
                  <p>This is your dashboard.</p>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
