import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { WebsiteHeader } from './WebsiteHeader.jsx';
import { HeroSection } from './HeroSection.jsx';
import { AboutSection } from './AboutSection.jsx';
import { TestimonialsCarousel } from './TestimonialsCarousel.jsx';
import { ContactForm } from './ContactForm.jsx';
import { SocialAuth } from './SocialAuth.jsx';

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
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading GymWeek...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <WebsiteHeader />
      <main>
        <HeroSection section={getSection('hero_section')} />
        <AboutSection section={getSection('about_us')} features={getSection('features')} />
        <TestimonialsCarousel testimonials={cms.testimonials || []} />
        <section id="contact" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '12px' }}>Get in Touch</h2>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px' }}>Questions? We respond within 24 hours.</p>
              <SocialAuth />
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px 24px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        <p>&copy; {new Date().getFullYear()} GymWeek. All rights reserved.</p>
        <div style={{ marginTop: '8px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
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
