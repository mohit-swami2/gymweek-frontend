import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--color-background)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', textDecoration: 'none' }}>
          <Dumbbell size={20} color="var(--color-primary)" />
          <span className="gymweek-logo">GYM<span>WEEK</span></span>
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>{title}</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '24px' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
