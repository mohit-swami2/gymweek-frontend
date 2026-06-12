import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { websiteApi } from '../../common/api/client.js';
import { useWebsiteCms } from './hooks/useWebsiteCms.js';
import { GridBackground } from './effects/GridBackground.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { GlassCard } from './GlassCard.jsx';
import { MagneticButton } from './MagneticButton.jsx';
import './landing.css';

export function LegalPage({ type }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getSection } = useWebsiteCms();

  const isTerms = type === 'terms';
  const pageTitle = isTerms ? 'Terms & Conditions' : 'Privacy Policy';
  const apiPath = isTerms ? '/cms/terms/terms-and-conditions' : '/cms/privacy/privacy-policy';

  useEffect(() => {
    document.documentElement.classList.add('gw-public-site');
    window.scrollTo(0, 0);
    document.title = `${pageTitle} — GymWeek`;
    return () => document.documentElement.classList.remove('gw-public-site');
  }, [type, pageTitle]);

  useEffect(() => {
    setLoading(true);
    websiteApi.get(apiPath)
      .then((res) => setDoc(res.data[0]))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [apiPath]);

  return (
    <div className="landing-page landing-page--legal">
      <GridBackground />
      <div className="landing-page__content">
        <Navbar section={getSection('site_navbar')} />

        <div className="gw-legal-toolbar">
          <div className="gw-container gw-legal-toolbar__inner">
            <Link to="/" className="gw-legal-back-link">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <span className="gw-legal-breadcrumb__current">{pageTitle}</span>
          </div>
        </div>

        <main className="gw-legal-main gw-container">
          {loading ? (
            <div className="gw-legal-skeleton">
              <div className="gw-skeleton gw-skeleton--legal-title" />
              <div className="gw-skeleton gw-skeleton--legal-line" />
              <div className="gw-skeleton gw-skeleton--legal-line" />
              <div className="gw-skeleton gw-skeleton--legal-line gw-skeleton--legal-line-short" />
            </div>
          ) : doc ? (
            <GlassCard tilt={false} className="gw-legal-card">
              <article className="gw-legal-content">
                <header className="gw-legal-content__head">
                  <h1>{doc.title || pageTitle}</h1>
                  {doc.version && (
                    <span className="gw-legal-content__version">Version {doc.version}</span>
                  )}
                </header>
                <div
                  className="gw-legal-content__body"
                  dangerouslySetInnerHTML={{ __html: doc.content }}
                />
              </article>
            </GlassCard>
          ) : (
            <div className="gw-legal-empty card">
              <p>Unable to load this page. Please try again later.</p>
              <MagneticButton variant="primary" to="/">
                <ArrowLeft size={16} />
                Return Home
              </MagneticButton>
            </div>
          )}

          <div className="gw-legal-footer-actions">
            <Link to={isTerms ? '/privacy' : '/terms'} className="gw-legal-footer-actions__alt">
              View {isTerms ? 'Privacy Policy' : 'Terms & Conditions'} →
            </Link>
          </div>
        </main>

        <Footer section={getSection('site_footer')} />
      </div>
    </div>
  );
}
