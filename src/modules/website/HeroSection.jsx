import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';

export function HeroSection({ section }) {
  const content = section?.content || {};
  const stats = content.stats || [];

  return (
    <section style={{ padding: '100px 24px 80px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-accent)', marginBottom: '24px', fontWeight: 600 }}>
        #1 Fitness Tracking Platform
      </div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, marginBottom: '20px' }}>
        {section?.title || 'GymWeek'}
      </h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)', maxWidth: '560px', margin: '0 auto 40px' }}>
        {section?.subtitle || 'Train smarter. Track harder. Crush every rep.'}
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/auth/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '14px 28px' }}>
          <Play size={16} fill="#080808" /> {content.ctaPrimary || 'Start Free Trial'}
        </Link>
        <a href="#about" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '14px 28px' }}>
          {content.ctaSecondary || 'View Features'} <ChevronRight size={16} />
        </a>
      </div>
      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: '24px', marginTop: '80px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
