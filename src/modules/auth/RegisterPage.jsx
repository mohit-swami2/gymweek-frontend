import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './AuthContext.jsx';
import { AuthLayout } from './AuthLayout.jsx';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Start your GymWeek fitness journey">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Already have an account? <Link to="/auth/login">Sign in</Link>
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
