import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import AuthContext from './authContextValue.js';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('factoryUser'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(localStorage.getItem('factoryToken'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('factoryToken')));

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data.user);
        localStorage.setItem('factoryUser', JSON.stringify(data.user));
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('factoryToken', data.token);
    localStorage.setItem('factoryUser', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('factoryToken');
    localStorage.removeItem('factoryUser');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
