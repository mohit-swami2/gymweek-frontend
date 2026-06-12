import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { navLinkTo } from './navUtils.js';

const DEFAULT_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Login', href: '/auth/login' },
  { label: 'Sign Up', href: '/auth/register' },
  { label: 'Admin', href: '/admin/login' },
];

export function Footer({ section }) {
  const content = section?.content || {};
  const links = content.links?.length ? content.links : DEFAULT_LINKS;
  const copyright = content.copyright || 'GymWeek. All rights reserved.';

  return (
    <footer className="gw-footer">
      <div className="gw-container gw-footer__inner">
        <div className="gw-footer__brand">
          <span className="gw-nav__logo" style={{ width: 28, height: 28 }}>
            <Dumbbell size={14} strokeWidth={2.5} />
          </span>
          <span className="gw-nav__name" style={{ fontSize: '0.875rem' }}>{content.brandName || 'GYMWEEK'}</span>
        </div>
        <div className="gw-footer__links">
          {links.map((l) => (
            <Link key={l.label} to={navLinkTo(l.href)}>{l.label}</Link>
          ))}
        </div>
        <div className="gw-footer__copy">
          &copy; {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  );
}
