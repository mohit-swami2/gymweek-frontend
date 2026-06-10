import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './modules/auth/AuthContext.jsx';
import { useAdminAuth } from './modules/auth/AdminAuthContext.jsx';
import { useTheme, resolvePanel } from './context/ThemeProvider.jsx';
import { LandingPage } from './modules/website/LandingPage.jsx';
import { LegalPage } from './modules/website/LegalPage.jsx';
import { LoginPage } from './modules/auth/LoginPage.jsx';
import { RegisterPage } from './modules/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './modules/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './modules/auth/ResetPasswordPage.jsx';
import { AdminLoginPage } from './modules/auth/AdminLoginPage.jsx';
import { UserDashboardLayout } from './modules/user-dashboard/UserDashboardLayout.jsx';
import { AdminDashboardLayout } from './modules/admin-dashboard/AdminDashboardLayout.jsx';

function UserRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function ThemeSync() {
  const location = useLocation();
  const { setPanel } = useTheme();
  useEffect(() => { setPanel(resolvePanel(location.pathname)); }, [location.pathname, setPanel]);
  return null;
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/dashboard/*" element={<UserRoute><UserDashboardLayout /></UserRoute>} />
        <Route path="/planner" element={<UserRoute><UserDashboardLayout initialView="planner" /></UserRoute>} />
        <Route path="/log" element={<UserRoute><UserDashboardLayout initialView="log" /></UserRoute>} />
        <Route path="/progress" element={<UserRoute><UserDashboardLayout initialView="progress" /></UserRoute>} />
        <Route path="/profile" element={<UserRoute><UserDashboardLayout initialView="profile" /></UserRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
