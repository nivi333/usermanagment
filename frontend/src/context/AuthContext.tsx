import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from '../utils/api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from JWT in localStorage (decode)
    const fetchCurrentUser = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: typeof payload.id === 'number' ? payload.id : 0,
            email: payload.email,
            role: payload.role,
            ...payload
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
