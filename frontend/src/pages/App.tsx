import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import Login from '../components/common/Login';
import Register from '../components/common/Register';
import Dashboard from '../components/dashboard/Dashboard';
import UserManagement from '../components/users/UserManagement';
import '../styles/App.css';
import RoleManagement from './RoleManagement';
import ProtectedRoute from '../components/common/ProtectedRoute';

const { Content } = Layout;

interface UserPayload {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

function AppContent() {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user info (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: typeof payload.id === 'number' ? payload.id : 0, // fallback if not present
          email: payload.email,
          role: payload.role,
          ...payload
        });
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: UserPayload) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Content>
            <Routes>
              <Route 
                path="/login" 
                element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/register" 
                element={!user ? <Register /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/role-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/not-authorized"
                element={<div style={{padding: 48, textAlign: 'center'}}><h2>Not Authorized</h2><p>You do not have permission to access this page.</p></div>}
              />
              <Route 
                path="/" 
                element={<Navigate to={user ? "/dashboard" : "/login"} />} 
              />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
