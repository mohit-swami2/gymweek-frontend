import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { AuthLayout } from './AuthLayout.jsx';
import { useAuthCms } from './useAuthCms.js';

export function ForgotPasswordPage() {
  const { section, content } = useAuthCms('auth_forgot_password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await websiteApi.post('/auth/forgot-password', { email });
      toast.success(res.data[0]?.message || res.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={section?.title || 'Reset Password'} subtitle={section?.subtitle || "We'll send you a recovery link"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="email" placeholder={content.emailPlaceholder || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? (content.submitLoading || 'Sending...') : (content.submitLabel || 'Send Reset Link')}
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
