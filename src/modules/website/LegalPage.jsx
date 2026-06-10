import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { websiteApi } from '../../common/api/client.js';
import { WebsiteHeader } from './WebsiteHeader.jsx';
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

export function LegalPage({ type }) {
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const path = type === 'terms' ? '/cms/terms/terms-and-conditions' : '/cms/privacy/privacy-policy';
    websiteApi.get(path).then((res) => setDoc(res.data[0])).catch(() => {});
  }, [type]);

  return (
    <div className="landing-page">
      <LandingBackground />
      <WebsiteHeader />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 2 }}>
        {doc ? (
          <div
            className="gw-glass"
            style={{ padding: '40px 36px', lineHeight: 1.7, color: '#cfcfcf' }}
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        ) : (
          <p style={{ color: '#a0a0a0' }}>Loading...</p>
        )}
        <Link to="/" style={{ display: 'inline-block', marginTop: '32px', color: '#b6ff3b' }}>← Back to GymWeek</Link>
      </main>
    </div>
  );
}
