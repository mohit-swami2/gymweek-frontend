/**
 * Maps every public-facing page/section to CMS sectionKey + editable fields.
 * Used by admin editor and website components.
 */
export const CMS_PAGES = [
  {
    id: 'landing',
    label: 'Landing Page',
    path: '/',
    sections: ['site_navbar', 'hero_section', 'features', 'testimonials_section', 'contact_section', 'site_footer'],
  },
  {
    id: 'auth',
    label: 'Auth Pages',
    path: '/auth/login',
    sections: ['auth_login', 'auth_register', 'auth_forgot_password', 'auth_reset_password'],
  },
  {
    id: 'legal',
    label: 'Legal Pages',
    path: '/terms',
    sections: ['legal_terms', 'legal_privacy'],
    managedElsewhere: true,
    adminRoutes: {
      legal_terms: '/admin/cms/terms',
      legal_privacy: '/admin/cms/privacy',
    },
  },
  {
    id: 'testimonials',
    label: 'Testimonials (carousel items)',
    path: '/#testimonials',
    sections: [],
    managedElsewhere: true,
    adminRoutes: { _items: '/admin/cms/testimonials' },
  },
  {
    id: 'emails',
    label: 'Email Templates',
    path: '—',
    sections: [],
    managedElsewhere: true,
    adminRoutes: { _items: '/admin/cms/email-templates' },
  },
];

export const SECTION_DEFINITIONS = {
  site_navbar: {
    label: 'Navigation Bar',
    page: 'landing',
    component: 'Navbar',
    description: 'Top navigation — brand, links, login & CTA.',
    fields: [
      { key: 'title', label: 'Internal title', type: 'text', help: 'Admin reference only' },
      { key: 'content.brandName', label: 'Brand name', type: 'text' },
      { key: 'content.loginLabel', label: 'Login button', type: 'text' },
      { key: 'content.ctaLabel', label: 'Get started button', type: 'text' },
      { key: 'content.links', label: 'Nav links', type: 'linkList' },
    ],
    preview: 'navbar',
    defaults: {
      title: 'Navigation',
      content: {
        brandName: 'GYMWEEK',
        loginLabel: 'Login',
        ctaLabel: 'Get Started',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Testimonials', href: '#testimonials' },
          { label: 'Contact', href: '#contact' },
          { label: 'Terms', href: '/terms' },
        ],
      },
    },
  },
  hero_section: {
    label: 'Hero',
    page: 'landing',
    component: 'Hero',
    description: 'Main headline, badge, CTAs, stats, and floating dashboards.',
    fields: [
      { key: 'title', label: 'Headline (script font)', type: 'text' },
      { key: 'subtitle', label: 'Tagline', type: 'textarea' },
      { key: 'content.badge', label: 'Top badge text', type: 'text' },
      { key: 'content.ctaPrimary', label: 'Primary CTA', type: 'text' },
      { key: 'content.ctaSecondary', label: 'Secondary CTA', type: 'text' },
      { key: 'content.stats', label: 'Stats row', type: 'statList' },
      { key: 'content.dashboardLeft.title', label: 'Left dashboard — title', type: 'text' },
      { key: 'content.dashboardLeft.value', label: 'Left dashboard — value', type: 'text' },
      { key: 'content.dashboardLeft.delta', label: 'Left dashboard — delta', type: 'text' },
      { key: 'content.dashboardRight.title', label: 'Right dashboard — title', type: 'text' },
      { key: 'content.dashboardRight.value', label: 'Right dashboard — value', type: 'text' },
      { key: 'content.dashboardRight.delta', label: 'Right dashboard — delta', type: 'text' },
    ],
    preview: 'hero',
  },
  features: {
    label: 'Features',
    page: 'landing',
    component: 'Features',
    description: 'Three feature cards with titles, badges, and descriptions.',
    fields: [
      { key: 'title', label: 'Section title (before highlight)', type: 'text' },
      { key: 'content.titleHighlight', label: 'Highlighted title part', type: 'text' },
      { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
      { key: 'content.items', label: 'Feature cards', type: 'featureList' },
      { key: 'content.chartFootLabel', label: 'Chart footer label', type: 'text' },
      { key: 'content.chartFootDelta', label: 'Chart footer delta', type: 'text' },
    ],
    preview: 'features',
  },
  testimonials_section: {
    label: 'Testimonials Header',
    page: 'landing',
    component: 'Testimonials',
    description: 'Section title above the carousel. Individual quotes are managed under Testimonials.',
    fields: [
      { key: 'title', label: 'Section title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle (optional)', type: 'textarea' },
    ],
    preview: 'testimonials',
  },
  contact_section: {
    label: 'Contact',
    page: 'landing',
    component: 'Contact',
    description: 'Contact form labels and copy.',
    fields: [
      { key: 'title', label: 'Section title', type: 'text' },
      { key: 'subtitle', label: 'Description', type: 'textarea' },
      { key: 'content.note', label: 'Trust note', type: 'text' },
      { key: 'content.ctaLabel', label: 'Submit button', type: 'text' },
      { key: 'content.terminalLabel', label: 'Form terminal label', type: 'text' },
      { key: 'content.liveLabel', label: 'Live indicator', type: 'text' },
      { key: 'content.fields.name', label: 'Name field label', type: 'text' },
      { key: 'content.fields.email', label: 'Email field label', type: 'text' },
      { key: 'content.fields.subject', label: 'Subject field label', type: 'text' },
      { key: 'content.fields.message', label: 'Message field label', type: 'text' },
      { key: 'content.successToast', label: 'Success toast message', type: 'text' },
    ],
    preview: 'contact',
  },
  site_footer: {
    label: 'Footer',
    page: 'landing',
    component: 'Footer',
    description: 'Footer brand, links, and copyright.',
    preview: 'footer',
    fields: [
      { key: 'title', label: 'Internal title', type: 'text' },
      { key: 'content.brandName', label: 'Brand name', type: 'text' },
      { key: 'content.copyright', label: 'Copyright text', type: 'text' },
      { key: 'content.links', label: 'Footer links', type: 'linkList' },
    ],
    preview: 'footer',
  },
  auth_login: {
    label: 'Login Page',
    page: 'auth',
    component: 'LoginPage',
    fields: [
      { key: 'title', label: 'Page title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'content.emailPlaceholder', label: 'Email placeholder', type: 'text' },
      { key: 'content.passwordPlaceholder', label: 'Password placeholder', type: 'text' },
      { key: 'content.submitLabel', label: 'Submit button', type: 'text' },
      { key: 'content.submitLoading', label: 'Loading state', type: 'text' },
      { key: 'content.forgotLink', label: 'Forgot password link', type: 'text' },
      { key: 'content.registerLink', label: 'Create account link', type: 'text' },
      { key: 'content.adminLink', label: 'Admin login link', type: 'text' },
    ],
  },
  auth_register: {
    label: 'Register Page',
    page: 'auth',
    component: 'RegisterPage',
    fields: [
      { key: 'title', label: 'Page title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'content.namePlaceholder', label: 'Name placeholder', type: 'text' },
      { key: 'content.emailPlaceholder', label: 'Email placeholder', type: 'text' },
      { key: 'content.passwordPlaceholder', label: 'Password placeholder', type: 'text' },
      { key: 'content.submitLabel', label: 'Submit button', type: 'text' },
      { key: 'content.submitLoading', label: 'Loading state', type: 'text' },
      { key: 'content.loginPrompt', label: 'Sign-in prompt', type: 'text' },
      { key: 'content.loginLink', label: 'Sign-in link text', type: 'text' },
      { key: 'content.adminLink', label: 'Admin login link', type: 'text' },
    ],
  },
  auth_forgot_password: {
    label: 'Forgot Password',
    page: 'auth',
    component: 'ForgotPasswordPage',
    fields: [
      { key: 'title', label: 'Page title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'content.emailPlaceholder', label: 'Email placeholder', type: 'text' },
      { key: 'content.submitLabel', label: 'Submit button', type: 'text' },
      { key: 'content.submitLoading', label: 'Loading state', type: 'text' },
      { key: 'content.backLink', label: 'Back to login link', type: 'text' },
    ],
  },
  auth_reset_password: {
    label: 'Reset Password',
    page: 'auth',
    component: 'ResetPasswordPage',
    fields: [
      { key: 'title', label: 'Page title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'content.passwordPlaceholder', label: 'Password placeholder', type: 'text' },
      { key: 'content.confirmPlaceholder', label: 'Confirm placeholder', type: 'text' },
      { key: 'content.submitLabel', label: 'Submit button', type: 'text' },
      { key: 'content.submitLoading', label: 'Loading state', type: 'text' },
      { key: 'content.backLink', label: 'Back to login link', type: 'text' },
    ],
  },
  site_meta: {
    label: 'Site Meta & Loader',
    page: 'landing',
    component: 'LandingPage',
    description: 'Browser title and loading screen text.',
    fields: [
      { key: 'content.pageTitle', label: 'Browser tab title', type: 'text' },
      { key: 'content.loaderLabel', label: 'Loading screen text', type: 'text' },
    ],
  },
  legal_terms: {
    label: 'Terms & Conditions',
    page: 'legal',
    managedElsewhere: true,
    adminRoute: '/admin/cms/terms',
  },
  legal_privacy: {
    label: 'Privacy Policy',
    page: 'legal',
    managedElsewhere: true,
    adminRoute: '/admin/cms/privacy',
  },
};

/** Get nested value from object by dot path */
export function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/** Set nested value on object by dot path (immutable) */
export function setByPath(obj, path, value) {
  const keys = path.split('.');
  const root = { ...obj };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

/** Build section object from flat form for save */
export function sectionFromForm(form) {
  let content = {};
  try {
    content = typeof form.content === 'string' ? JSON.parse(form.content) : (form.content || {});
  } catch {
    content = {};
  }
  return {
    title: form.title,
    subtitle: form.subtitle || '',
    content,
    status: form.status,
    isActive: true,
  };
}

export function formFromSection(section) {
  if (!section) return { title: '', subtitle: '', content: '{}', status: 'published' };
  return {
    title: section.title || '',
    subtitle: section.subtitle || '',
    content: section.content || {},
    status: section.status || 'published',
  };
}
