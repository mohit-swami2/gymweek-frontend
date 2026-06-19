import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { adminApi } from '../../common/api/client.js';
import './admin-login.css';

export function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.post('/auth/forgot-password', { email });
      toast.success(res.data[0]?.message || res.message || 'Reset link sent');
      setSent(true);
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Reset Password</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          {sent ? 'Check your inbox for a recovery link.' : "We'll email you a recovery link"}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '0.875rem', textAlign: 'center' }}>
          <Link to="/admin/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
