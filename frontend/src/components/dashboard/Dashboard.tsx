import React from 'react';
import { Bar, Pie } from '@ant-design/charts';
import CountUpStat from './CountUpStat';

// Error boundary for charts
import ReactDOM from 'react-dom';

class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Chart render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', textAlign: 'center', padding: 16 }}>Chart failed to load.</div>
      );
    }
    return this.props.children;
  }
}

import {
  Layout,
  Menu,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Space,
  Table,
  Badge,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Enhanced mock data
const barChartData = [
  { type: 'Jan', value: 30 },
  { type: 'Feb', value: 50 },
  { type: 'Mar', value: 38 },
  { type: 'Apr', value: 60 },
  { type: 'May', value: 75 },
  { type: 'Jun', value: 48 },
  { type: 'Jul', value: 90 },
  { type: 'Aug', value: 70 },
  { type: 'Sep', value: 55 },
  { type: 'Oct', value: 65 },
  { type: 'Nov', value: 80 },
  { type: 'Dec', value: 95 },
];

const barChartConfig = {
  data: barChartData,
  xField: 'type',
  yField: 'value',
  color: '#1677ff',
  height: 200,
  autoFit: true,
};

const rolePieData = [
  { type: 'Admin', value: 5 },
  { type: 'Manager', value: 8 },
  { type: 'User', value: 32 },
  { type: 'Guest', value: 10 },
];

const pieChartConfig = {
  appendPadding: 10,
  data: rolePieData,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  label: {
    type: 'spider',
    labelHeight: 28,
    content: '{name} {percentage}',
  },
  legend: { position: 'bottom' },
};

const recentActivityData = [
  { key: 1, user: 'Alice', action: 'Logged in', time: '2025-07-28 09:30' },
  { key: 2, user: 'Bob', action: 'Changed password', time: '2025-07-28 09:15' },
  { key: 3, user: 'Charlie', action: 'Created new user', time: '2025-07-28 08:50' },
  { key: 4, user: 'Diana', action: 'Logged out', time: '2025-07-28 08:40' },
  { key: 5, user: 'Eve', action: 'Updated profile', time: '2025-07-28 08:35' },
];

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
    ...(user.role === 'admin'
      ? [
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: <Link to="/users">User Management</Link>,
          },
        ]
      : []),
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
          defaultSelectedKeys={['dashboard']}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user.email}</Text>
            <Text type="secondary">({user.role})</Text>
            {user.role === 'admin' && (
              <Button
                type="primary"
                icon={
                  <span className="anticon">
                    <svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="currentColor">
                      <path d="M832 112H192c-44.2 0-80 35.8-80 80v640c0 44.2 35.8 80 80 80h640c44.2 0 80-35.8 80-80V192c0-44.2-35.8-80-80-80zm0 720H192V192h640v640zm-96-400c0-88.4-71.6-160-160-160s-160 71.6-160 160c0 70.7 45.8 130.5 110 151.2V736c0 13.3 10.7 24 24 24h52c13.3 0 24-10.7 24-24V583.2c64.2-20.7 110-80.5 110-151.2z" />
                    </svg>
                  </span>
                }
                style={{ marginRight: 8 }}
                onClick={() => navigate('/role-management')}
              >
                Roles & Permissions
              </Button>
            )}
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {/* Welcome Banner */}
          <Card
            style={{
              marginBottom: 24,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Space size={16}>
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1677ff' }}
                  />
                  <div>
                    <Typography.Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      Welcome back, {user.email.split('@')[0]}!
                    </Typography.Title>
                    <Typography.Text style={{ color: '#6b7280', fontSize: 16 }}>
                      Role: <Badge color="#52c41a" text={user.role} /> • Last login: Today at 09:30
                    </Typography.Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Typography.Text style={{ color: '#6b7280' }}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography.Text>
              </Col>
            </Row>
          </Card>

          <div style={{ padding: '0 24px', minHeight: 360 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  title={
                    <span>
                      <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                      User Profile
                    </span>
                  }
                  bordered={false}
                  bodyStyle={{ padding: 20 }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                    height: '100%',
                  }}
                >
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    <Avatar
                      size={72}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1677ff', margin: '0 auto' }}
                    />
                    <div style={{ textAlign: 'left', width: '100%' }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#374151' }}>
                          Name:
                        </Text>
                        <br />
                        <Text style={{ fontSize: 16, color: '#1f2937' }}>Nivetha Ramdev</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#374151' }}>
                          Email:
                        </Text>
                        <br />
                        <Text style={{ fontSize: 14, color: '#6b7280' }}>{user.email}</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#374151' }}>
                          Role:
                        </Text>
                        <br />
                        <Badge color="#52c41a" text={user.role} style={{ fontSize: 14 }} />
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#374151' }}>
                          Status:
                        </Text>
                        <br />
                        <Badge status="success" text="Active" />
                      </div>
                      <div>
                        <Text strong style={{ color: '#374151' }}>
                          Last Login:
                        </Text>
                        <br />
                        <Text style={{ fontSize: 14, color: '#6b7280' }}>2025-07-28 09:30</Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={10}>
                <Card
                  title={
                    <span>
                      <TeamOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                      Statistics
                    </span>
                  }
                  bordered={false}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={12}>
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 16,
                          background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                          borderRadius: 8,
                          color: 'white',
                        }}
                      >
                        <UsergroupAddOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <CountUpStat label="Total Users" value={120} color="white" />
                      </div>
                    </Col>
                    <Col xs={12} sm={12}>
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 16,
                          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                          borderRadius: 8,
                          color: 'white',
                        }}
                      >
                        <SafetyCertificateOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <CountUpStat label="Total Roles" value={5} color="white" />
                      </div>
                    </Col>
                    <Col xs={12} sm={12}>
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 16,
                          background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                          borderRadius: 8,
                          color: 'white',
                        }}
                      >
                        <ClockCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <CountUpStat label="Active Sessions" value={14} color="white" />
                      </div>
                    </Col>
                    <Col xs={12} sm={12}>
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 16,
                          background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                          borderRadius: 8,
                          color: 'white',
                        }}
                      >
                        <MailOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <CountUpStat label="Pending Invites" value={3} color="white" />
                      </div>
                    </Col>
                  </Row>
                </Card>
                <Card
                  title={
                    <span>
                      <LockOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                      Security Status
                    </span>
                  }
                  bordered={false}
                  style={{
                    marginTop: 16,
                    minHeight: 110,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={12}>
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 12,
                          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                          borderRadius: 8,
                          color: 'white',
                        }}
                      >
                        <LockOutlined style={{ fontSize: 20, marginBottom: 4 }} />
                        <CountUpStat label="Locked Accounts" value={2} color="white" />
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div style={{ padding: 12 }}>
                        <Text strong style={{ color: '#52c41a' }}>
                          System Status:{' '}
                        </Text>
                        <Badge status="success" text="All systems operational" />
                        <br />
                        <Text strong style={{ color: '#1677ff' }}>
                          Last Deploy:{' '}
                        </Text>
                        <Text>2025-07-28</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card
                  title={
                    <span>
                      <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                      User Roles Distribution
                    </span>
                  }
                  bordered={false}
                  style={{
                    minHeight: 340,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                >
                  <div style={{ height: 220 }}>
                    <ChartErrorBoundary>
                      <Pie {...pieChartConfig} style={{ height: 220 }} />
                    </ChartErrorBoundary>
                  </div>
                  <div style={{ marginTop: 16, padding: '16px 0' }}>
                    <Typography.Text strong style={{ color: '#374151', fontSize: 16 }}>
                      Role Breakdown:
                    </Typography.Text>
                    <div style={{ marginTop: 12 }}>
                      {rolePieData.map((role, index) => (
                        <div
                          key={role.type}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            marginBottom: 4,
                            background: index % 2 === 0 ? '#f9fafb' : 'transparent',
                            borderRadius: 6,
                          }}
                        >
                          <span style={{ fontWeight: 500, color: '#374151' }}>{role.type}</span>
                          <Badge
                            count={role.value}
                            style={{
                              backgroundColor: ['#1677ff', '#52c41a', '#faad14', '#722ed1'][index],
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={24}>
                <Card
                  title={
                    <span>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                      User Activity by Month
                    </span>
                  }
                  bordered={false}
                  style={{
                    marginTop: 24,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                >
                  <ChartErrorBoundary>
                    <Bar {...barChartConfig} style={{ height: 260 }} />
                  </ChartErrorBoundary>
                </Card>
              </Col>
              <Col xs={24}>
                <Card
                  title={
                    <span>
                      <DashboardOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Recent Activity
                    </span>
                  }
                  bordered={false}
                  style={{
                    marginTop: 24,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                >
                  <Table
                    columns={[
                      { title: 'User', dataIndex: 'user', key: 'user' },
                      { title: 'Action', dataIndex: 'action', key: 'action' },
                      { title: 'Time', dataIndex: 'time', key: 'time' },
                    ]}
                    dataSource={recentActivityData}
                    pagination={false}
                    size="small"
                  />
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
