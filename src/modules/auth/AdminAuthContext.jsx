import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../../common/api/client.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (token, adminData) => {
    if (token) localStorage.setItem('gymweek_admin_token', token);
    setAdmin(adminData);
  };

  const clearSession = () => {
    localStorage.removeItem('gymweek_admin_token');
    setAdmin(null);
  };

  const loadAdmin = async () => {
    if (!localStorage.getItem('gymweek_admin_token')) { setLoading(false); return; }
    try {
      const res = await adminApi.get('/auth/profile');
      setAdmin(res.data[0]);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmin(); }, []);

  const login = async (email, password) => {
    const res = await adminApi.post('/auth/login', { email, password });
    const { admin: a, token } = res.data[0];
    setSession(token, a);
    return a;
  };

  const logout = () => {
    clearSession();
    window.location.href = '/admin/login';
  };

  const impersonateUser = async (userId) => {
    const res = await adminApi.post(`/users/${userId}/impersonate`);
    const { token, user } = res.data[0];
    localStorage.setItem('gymweek_admin_token_backup', localStorage.getItem('gymweek_admin_token'));
    localStorage.setItem('gymweek_user_token', token);
    window.location.href = '/dashboard';
    return user;
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, impersonateUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
