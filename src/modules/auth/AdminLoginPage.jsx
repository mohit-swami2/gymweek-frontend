import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { useTheme } from '../../context/ThemeProvider.jsx';
import { Dumbbell } from 'lucide-react';
import { PasswordInput } from '../../common/components/PasswordInput.jsx';
import './admin-login.css';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const { refreshThemes, setPanel } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      await refreshThemes();
      setPanel('admin');
      toast.success('Welcome back, Super Admin');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__bg" aria-hidden>
        <div className="admin-login__grid" />
        <div className="admin-login__orb admin-login__orb--1" />
        <div className="admin-login__orb admin-login__orb--2" />
      </div>
      <div className="card admin-login__card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <Dumbbell size={20} color="var(--color-primary)" />
          <span className="gymweek-logo">GYM<span>WEEK</span> Admin</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Super Admin Login</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Manage GymWeek platform</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '0.875rem', textAlign: 'center' }}>
          <Link to="/admin/forgot-password">Forgot password?</Link>
        </p>
        <Link
          to="/auth/login"
          className="btn-secondary"
          style={{ display: 'block', marginTop: '12px', textAlign: 'center', textDecoration: 'none', padding: '12px' }}
        >
          Login as User
        </Link>
      </div>
    </div>
  );
}
