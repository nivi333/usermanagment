import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin, App as AntApp } from 'antd';
import Login from '../components/common/Login';
import Register from '../components/common/Register';
import Dashboard from '../components/dashboard';
import UserManagement from '../components/users/UserManagement';
import '../styles/App.css';
import RoleManagement from './RoleManagement';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AppLayout from '../components/common/AppLayout';

function AppContent() {
  const { user, loading, setUser } = useAuth();

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 64 }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <AppLayout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </AppLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/users"
            element={
              user ? (
                <AppLayout user={user} onLogout={handleLogout}>
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                </AppLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/role-management"
            element={
              user ? (
                <AppLayout user={user} onLogout={handleLogout}>
                  <ProtectedRoute requiredRole="admin">
                    <RoleManagement />
                  </ProtectedRoute>
                </AppLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch all - redirect to dashboard or login */}
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

// Main App component that renders the AuthProvider and AppContent
const App: React.FC = () => (
  <ErrorBoundary>
    <AntApp>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AntApp>
  </ErrorBoundary>
);

export default App;
