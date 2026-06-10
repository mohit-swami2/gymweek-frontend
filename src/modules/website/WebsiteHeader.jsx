import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export function WebsiteHeader() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8, 8, 8, 0.9)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)', padding: '16px 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Dumbbell size={22} color="var(--color-primary)" strokeWidth={2.5} />
          <span className="gymweek-logo">GYM<span>WEEK</span></span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#about" style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>About</a>
          <a href="#testimonials" style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Reviews</a>
          <a href="#contact" style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Contact</a>
          <Link to="/terms" style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Terms</Link>
          <Link to="/auth/login" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
