import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { websiteApi } from '../../common/api/client.js';
import { WebsiteHeader } from './WebsiteHeader.jsx';

export function LegalPage({ type }) {
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const path = type === 'terms' ? '/cms/terms/terms-and-conditions' : '/cms/privacy/privacy-policy';
    websiteApi.get(path).then((res) => setDoc(res.data[0])).catch(() => {});
  }, [type]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <WebsiteHeader />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        {doc ? (
          <div dangerouslySetInnerHTML={{ __html: doc.content }} />
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        )}
        <Link to="/" style={{ display: 'inline-block', marginTop: '32px', color: 'var(--color-primary)' }}>← Back to GymWeek</Link>
      </main>
    </div>
  );
}
