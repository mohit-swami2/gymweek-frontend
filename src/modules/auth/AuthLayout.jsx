import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import './auth-layout.css';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__bg" aria-hidden>
        <div className="auth-layout__grid" />
        <div className="auth-layout__orb auth-layout__orb--1" />
        <div className="auth-layout__orb auth-layout__orb--2" />
      </div>
      <div className="card auth-layout__card">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', textDecoration: 'none' }}>
          <Dumbbell size={20} color="var(--color-primary)" />
          <span className="gymweek-logo">GYM<span>WEEK</span></span>
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
