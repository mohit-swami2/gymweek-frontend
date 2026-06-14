import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './AuthContext.jsx';
import { AuthLayout } from './AuthLayout.jsx';
import { useAuthCms } from './useAuthCms.js';
import { PasswordInput } from '../../common/components/PasswordInput.jsx';

export function LoginPage() {
  const { section, content } = useAuthCms('auth_login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={section?.title || 'Sign In'} subtitle={section?.subtitle || 'Access your GymWeek workspace'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input type="email" placeholder={content.emailPlaceholder || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordInput placeholder={content.passwordPlaceholder || 'Password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (content.submitLoading || 'Signing in...') : (content.submitLabel || 'Sign In')}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
        <Link to="/auth/forgot-password">{content.forgotLink || 'Forgot password?'}</Link>
        {' · '}
        <Link to="/auth/register">{content.registerLink || 'Create account'}</Link>
      </p>
      <Link
        to="/admin/login"
        className="btn-secondary"
        style={{ display: 'block', marginTop: '16px', textAlign: 'center', textDecoration: 'none', padding: '12px' }}
      >
        {content.adminLink || 'Login as Admin'}
      </Link>
    </AuthLayout>
  );
}
