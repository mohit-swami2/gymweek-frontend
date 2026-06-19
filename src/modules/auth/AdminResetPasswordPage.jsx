import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { adminApi } from '../../common/api/client.js';
import { PasswordInput } from '../../common/components/PasswordInput.jsx';
import './admin-login.css';

export function AdminResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await adminApi.post('/auth/reset-password', { token, password });
      toast.success('Password updated!');
      navigate('/admin/login');
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Set New Password</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Choose a strong password</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <PasswordInput placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" className="btn-primary" disabled={loading || !token} style={{ marginTop: '8px' }}>
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '0.875rem', textAlign: 'center' }}>
          <Link to="/admin/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
