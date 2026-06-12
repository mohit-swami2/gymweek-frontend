import { SECTION_DEFINITIONS } from './sectionRegistry.js';
import { AuthSectionPreview } from './AuthSectionPreview.jsx';
import { Navbar } from '../website/Navbar.jsx';
import { Footer } from '../website/Footer.jsx';
import { Hero } from '../website/Hero.jsx';
import { Features } from '../website/Features.jsx';
import { Testimonials } from '../website/Testimonials.jsx';
import { Contact } from '../website/Contact.jsx';
import { PageLoader } from '../website/PageLoader.jsx';

function parseContent(form) {
  if (typeof form.content === 'string') {
    try {
      return JSON.parse(form.content);
    } catch {
      return {};
    }
  }
  return form.content || {};
}

function buildSection(sectionKey, form) {
  return {
    sectionKey,
    title: form.title,
    subtitle: form.subtitle,
    content: parseContent(form),
  };
}

function LandingPreviewWrap({ children }) {
  return (
    <div className="gw-section-preview landing-page cms-preview-embed">
      <div className="landing-page__content">{children}</div>
    </div>
  );
}

function SiteMetaPreview({ content }) {
  const pageTitle = content.pageTitle || 'GymWeek — Fitness Planner';
  const loaderLabel = content.loaderLabel || 'Loading';

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        border: '1px solid var(--gw-border)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--gw-bg-mid)',
      }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.35)',
          borderBottom: '1px solid var(--gw-border)',
        }}
        >
          <span style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </span>
          <span style={{
            flex: 1,
            fontSize: '0.75rem',
            color: 'var(--gw-text-muted)',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 6,
            padding: '4px 10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          >
            {pageTitle}
          </span>
        </div>
        <div style={{ padding: '32px 24px', minHeight: 100, position: 'relative' }}>
          <PageLoader progress={72} label={loaderLabel} />
        </div>
      </div>
      <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--gw-text-muted)', textAlign: 'center' }}>
        Browser tab title and loading bar preview
      </p>
    </div>
  );
}

const AUTH_TYPES = {
  auth_login: 'login',
  auth_register: 'register',
  auth_forgot_password: 'forgot',
  auth_reset_password: 'reset',
};

export function SectionPreview({ sectionKey, form, testimonials = [] }) {
  const section = buildSection(sectionKey, form);

  if (AUTH_TYPES[sectionKey]) {
    return <AuthSectionPreview type={AUTH_TYPES[sectionKey]} section={section} />;
  }

  if (sectionKey === 'site_meta') {
    return (
      <LandingPreviewWrap>
        <SiteMetaPreview content={section.content} />
      </LandingPreviewWrap>
    );
  }

  const preview = SECTION_DEFINITIONS[sectionKey]?.preview || sectionKey;
  let node;

  switch (preview) {
    case 'navbar':
    case 'site_navbar':
      node = <Navbar section={section} />;
      break;
    case 'hero':
    case 'hero_section':
      node = <Hero section={section} />;
      break;
    case 'features':
      node = <Features section={section} />;
      break;
    case 'testimonials':
    case 'testimonials_section':
      node = <Testimonials title={section.title} testimonials={testimonials} />;
      break;
    case 'contact':
    case 'contact_section':
      node = <Contact section={section} />;
      break;
    case 'footer':
    case 'site_footer':
      node = <Footer section={section} />;
      break;
    default:
      return (
        <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          No visual preview available for this section.
        </div>
      );
  }

  return <LandingPreviewWrap>{node}</LandingPreviewWrap>;
}
