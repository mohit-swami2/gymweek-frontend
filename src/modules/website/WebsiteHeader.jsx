import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LANDING_ASSETS } from './landingAssets.js';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Devices' },
  { href: '#contact', label: 'Contact' },
  { href: '/terms', label: 'Terms', isRoute: true },
];

export function WebsiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`landing-header${scrolled ? ' landing-header--scrolled' : ''}`}>
      <div className="landing-header__inner">
        <Link to="/" className="landing-header__logo-link">
          <img
            src={LANDING_ASSETS.logo}
            alt="GymWeek"
            className="landing-header__logo-img"
            draggable={false}
          />
        </Link>
        <nav className="landing-header__nav">
          {NAV_LINKS.map((link) =>
            link.isRoute ? (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ) : (
              <a key={link.href} href={link.href}>{link.label}</a>
            )
          )}
          <div className="landing-header__auth">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/auth/login" className="landing-header__login">Login</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/auth/register" className="landing-header__cta">Sign Up</Link>
            </motion.div>
          </div>
        </nav>
      </div>
    </header>
  );
}
