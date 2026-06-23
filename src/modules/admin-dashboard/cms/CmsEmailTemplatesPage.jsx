import { CmsCrudPage } from '../../../common/components/CmsCrudPage.jsx';
import { emailTemplatesApi } from '../../../common/api/cmsApi.js';
import { HtmlPreview } from '../../../common/components/PreviewPanel.jsx';

export function CmsEmailTemplatesPage() {
  return (
    <CmsCrudPage
      title="Email Templates"
      api={emailTemplatesApi}
      emptyForm={{ key: '', name: '', subject: '', body: '<p>Hello {{name}}</p>', status: 'draft' }}
      columns={[
        { key: 'key', label: 'Key' },
        { key: 'name', label: 'Name' },
        { key: 'subject', label: 'Subject' },
        { key: 'status', label: 'Status' },
      ]}
      formFields={[
        { name: 'key', label: 'Template Key' },
        { name: 'name', label: 'Display Name' },
        { name: 'subject', label: 'Email Subject' },
        { name: 'body', label: 'Email Body (use {{placeholders}})', type: 'richtext', rows: 12 },
        { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
      ]}
      renderPreview={(form) => <HtmlPreview html={form.body?.replace(/\{\{name\}\}/g, 'Alex').replace(/\{\{resetUrl\}\}/g, '#').replace(/\{\{dashboardUrl\}\}/g, '/dashboard')} />}
    />
  );
}
