import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { WebsiteHeader } from './WebsiteHeader.jsx';
import { HeroSection } from './HeroSection.jsx';
import { AboutSection } from './AboutSection.jsx';
import { TestimonialsCarousel } from './TestimonialsCarousel.jsx';
import { ContactForm } from './ContactForm.jsx';
import './landing.css';

function LandingBackground() {
  return (
    <div className="landing-page__bg" aria-hidden="true">
      <div className="landing-page__bg-layer1" />
      <div className="landing-page__bg-layer2" />
      <div className="landing-page__bg-layer3" />
      <div className="landing-page__bg-noise" />
    </div>
  );
}

export function LandingPage() {
  const [cms, setCms] = useState({ sections: [], testimonials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      websiteApi.get('/cms/sections'),
      websiteApi.get('/cms/testimonials'),
    ]).then(([sectionsRes, testimonialsRes]) => {
      setCms({ sections: sectionsRes.data, testimonials: testimonialsRes.data });
    }).catch(() => toast.error('Failed to load page content'))
      .finally(() => setLoading(false));
  }, []);

  const getSection = (key) => cms.sections?.find((s) => s.sectionKey === key);

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="landing-loading__spinner" />
        <span style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Loading GymWeek...</span>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <LandingBackground />
      <WebsiteHeader />
      <main className="landing-main">
        <HeroSection section={getSection('hero_section')} />
        <AboutSection section={getSection('about_us')} features={getSection('features')} />
        <section className="bottom-section">
          <motion.div
            className="bottom-section__inner"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <TestimonialsCarousel
              testimonials={cms.testimonials || []}
              title={getSection('testimonials')?.title}
            />
            <ContactForm section={getSection('contact_section')} />
          </motion.div>
        </section>
      </main>
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} GymWeek. All rights reserved.</p>
        <div className="landing-footer__links">
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Sign Up</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/admin/login">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
