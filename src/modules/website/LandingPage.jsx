import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { GridBackground } from './effects/GridBackground.jsx';
import { ParticleField } from './effects/ParticleField.jsx';
import { MouseSpotlight } from './effects/MouseSpotlight.jsx';
import { Navbar } from './Navbar.jsx';
import { Hero } from './Hero.jsx';
import { Features } from './Features.jsx';
import { Testimonials } from './Testimonials.jsx';
import { Contact } from './Contact.jsx';
import { Footer } from './Footer.jsx';
import { LandingSkeleton } from './LandingSkeleton.jsx';
import { PageLoader } from './PageLoader.jsx';
import { RevealSection } from './RevealSection.jsx';
import { scrollToSection } from './navUtils.js';
import './landing.css';

const MIN_LOADER_MS = 380;

export function LandingPage() {
  const [cms, setCms] = useState({ sections: [], testimonials: [] });
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(8);
  const [effectsOn, setEffectsOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('gw-public-site');
    return () => document.documentElement.classList.remove('gw-public-site');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const tick = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 11));
    }, 160);

    Promise.all([
      websiteApi.get('/cms/sections'),
      websiteApi.get('/cms/testimonials'),
    ])
      .then(([sectionsRes, testimonialsRes]) => {
        if (cancelled) return;
        setCms({ sections: sectionsRes.data, testimonials: testimonialsRes.data });
        setProgress(100);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load page content');
      })
      .finally(() => {
        if (cancelled) return;
        const elapsed = performance.now() - started;
        const wait = Math.max(0, MIN_LOADER_MS - elapsed);
        window.setTimeout(() => {
          if (!cancelled) setReady(true);
        }, wait);
        window.clearInterval(tick);
      });

    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    let idleId;
    let timeoutId;
    const enable = () => { if (!cancelled) setEffectsOn(true); };
    if (window.requestIdleCallback) {
      idleId = window.requestIdleCallback(enable, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(enable, 500);
    }
    return () => {
      cancelled = true;
      if (idleId != null) window.cancelIdleCallback(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [ready]);

  const getSection = (key) => cms.sections?.find((s) => s.sectionKey === key);
  const meta = getSection('site_meta')?.content || {};
  const loaderLabel = meta.loaderLabel || 'Loading';

  useEffect(() => {
    if (meta.pageTitle) {
      document.title = meta.pageTitle;
    }
  }, [meta.pageTitle]);

  useEffect(() => {
    if (!ready || !window.location.hash) return undefined;
    const hash = window.location.hash;
    const timer = window.setTimeout(() => scrollToSection(hash), 100);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <div className={`landing-page${ready ? ' landing-page--ready' : ''}`}>
      <GridBackground />
      <div className="landing-page__effects" aria-hidden="true">
        <ParticleField enabled={effectsOn} />
      </div>
      <MouseSpotlight enabled={effectsOn} />

      <AnimatePresence>
        {!ready && (
          <PageLoader key="loader" progress={progress} label={loaderLabel} />
        )}
      </AnimatePresence>

      <div className="landing-page__content">
        <Navbar section={getSection('site_navbar')} />

        {!ready ? (
          <LandingSkeleton />
        ) : (
          <motion.div
            className="landing-page__main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Hero section={getSection('hero_section')} />
            <RevealSection>
              <Features section={getSection('features')} />
            </RevealSection>
            <RevealSection delay={80}>
              <Testimonials
                testimonials={cms.testimonials || []}
                title={getSection('testimonials_section')?.title}
              />
            </RevealSection>
            <RevealSection delay={120}>
              <Contact section={getSection('contact_section')} />
            </RevealSection>
            <Footer section={getSection('site_footer')} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
