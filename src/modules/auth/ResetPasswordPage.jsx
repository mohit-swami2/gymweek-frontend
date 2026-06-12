import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { AuthLayout } from './AuthLayout.jsx';
import { useAuthCms } from './useAuthCms.js';

export function ResetPasswordPage() {
  const { section, content } = useAuthCms('auth_reset_password');
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
      await websiteApi.post('/auth/reset-password', { token, password });
      toast.success('Password updated!');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={section?.title || 'Set New Password'} subtitle={section?.subtitle || 'Choose a strong password'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="password" placeholder={content.passwordPlaceholder || 'New password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        <button type="submit" disabled={loading || !token} style={btnStyle}>
          {loading ? (content.submitLoading || 'Saving...') : (content.submitLabel || 'Update Password')}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.875rem', textAlign: 'center' }}>
        <Link to="/auth/login">{content.backLink || 'Back to login'}</Link>
      </p>
    </AuthLayout>
  );
}

const inputStyle = {
  padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)',
  background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem',
};

const btnStyle = {
  padding: '14px', borderRadius: '10px', border: 'none', background: 'var(--color-primary)',
  color: '#080808', fontWeight: 700, cursor: 'pointer',
};
