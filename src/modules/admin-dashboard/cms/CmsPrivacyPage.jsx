import { CmsCrudPage } from '../../../common/components/CmsCrudPage.jsx';
import { privacyApi } from '../../../common/api/cmsApi.js';
import { HtmlPreview } from '../../../common/components/PreviewPanel.jsx';

export function CmsPrivacyPage() {
  return (
    <CmsCrudPage
      title="Privacy Policy"
      api={privacyApi}
      emptyForm={{ title: 'Privacy Policy', slug: 'privacy-policy', content: '<h1>Privacy Policy</h1><p>Content here...</p>', version: '1.0', status: 'draft' }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'version', label: 'Version' },
        { key: 'status', label: 'Status' },
      ]}
      formFields={[
        { name: 'title', label: 'Title' },
        { name: 'slug', label: 'URL Slug' },
        { name: 'version', label: 'Version' },
        { name: 'content', label: 'Content', type: 'richtext', rows: 16 },
        { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
      ]}
      renderPreview={(form) => (
        <div>
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Preview: /privacy — as visitors will see it
          </div>
          <HtmlPreview html={form.content} />
        </div>
      )}
    />
  );
}
