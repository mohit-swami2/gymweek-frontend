import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton.jsx';
import { navLinkTo } from './navUtils.js';

const DEFAULT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
  { label: 'Terms', href: '/terms' },
];

export function Navbar({ section }) {
  const content = section?.content || {};
  const links = content.links?.length ? content.links : DEFAULT_LINKS;

  return (
    <motion.nav
      className="gw-nav"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="gw-container">
        <div className="gw-nav__inner">
          <Link to="/" className="gw-nav__brand">
            <span className="gw-nav__logo">
              <Dumbbell size={16} strokeWidth={2.5} />
            </span>
            <span className="gw-nav__name">{content.brandName || 'GYMWEEK'}</span>
          </Link>

          <div className="gw-nav__links">
            {links.map((l) => (
              <Link key={l.label} to={navLinkTo(l.href)} className="gw-nav__link">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="gw-nav__actions">
            <Link to="/auth/login" className="gw-nav__login">{content.loginLabel || 'Login'}</Link>
            <MagneticButton variant="primary" size="sm" to="/auth/register">
              {content.ctaLabel || 'Get Started'}
              <ChevronRight size={16} strokeWidth={2.5} />
            </MagneticButton>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
