import { Link } from 'react-router-dom';

const cards = [
  { title: 'Users', desc: 'CRUD, restrict, one-click impersonation', to: '/admin/users' },
  { title: 'Contacts', desc: 'Lead inquiries with status tracking', to: '/admin/contacts' },
  { title: 'Themes', desc: 'White-label branding with live preview', to: '/admin/themes' },
  { title: 'CMS', desc: 'Sections, testimonials, emails, legal pages', to: '/admin/cms/sections' },
];

export function AdminOverview() {
  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '8px' }}>
        GymWeek Super Admin
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Full platform control — create, update, delete, and preview all content.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {cards.map((card) => (
          <Link key={card.title} to={card.to} className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary)' }}>{card.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
