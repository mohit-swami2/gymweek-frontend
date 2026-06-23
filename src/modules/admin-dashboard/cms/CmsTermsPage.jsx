import { CmsCrudPage } from '../../../common/components/CmsCrudPage.jsx';
import { termsApi } from '../../../common/api/cmsApi.js';
import { HtmlPreview } from '../../../common/components/PreviewPanel.jsx';

export function CmsTermsPage() {
  return (
    <CmsCrudPage
      title="Terms & Conditions"
      api={termsApi}
      emptyForm={{ title: 'Terms and Conditions', slug: 'terms-and-conditions', content: '<h1>Terms</h1><p>Content here...</p>', version: '1.0', status: 'draft' }}
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
            Preview: /terms — as visitors will see it
          </div>
          <HtmlPreview html={form.content} />
        </div>
      )}
    />
  );
}
