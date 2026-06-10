import { createContext, useContext, useEffect, useState } from 'react';
import { websiteApi } from '../../common/api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authMeta, setAuthMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const setSession = (token, userData, meta = {}) => {
    if (token) localStorage.setItem('gymweek_user_token', token);
    setUser(userData);
    setAuthMeta(meta);
  };

  const clearSession = () => {
    localStorage.removeItem('gymweek_user_token');
    setUser(null);
    setAuthMeta({});
  };

  const loadUser = async () => {
    if (!localStorage.getItem('gymweek_user_token')) { setLoading(false); return; }
    try {
      const res = await websiteApi.get('/auth/me');
      const payload = res.data[0] || {};
      setUser(payload.user);
      setAuthMeta(payload.authMeta || {});
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const login = async (email, password) => {
    const res = await websiteApi.post('/auth/login', { email, password });
    const { user: u, token } = res.data[0];
    setSession(token, u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await websiteApi.post('/auth/register', { name, email, password });
    const { user: u, token } = res.data[0];
    setSession(token, u);
    return u;
  };

  const logout = () => clearSession();

  const exitImpersonation = () => {
    const adminToken = localStorage.getItem('gymweek_admin_token_backup');
    if (adminToken) {
      localStorage.setItem('gymweek_admin_token', adminToken);
      localStorage.removeItem('gymweek_admin_token_backup');
    }
    clearSession();
    window.location.href = '/admin/users';
  };

  return (
    <AuthContext.Provider value={{ user, authMeta, loading, login, register, logout, exitImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
