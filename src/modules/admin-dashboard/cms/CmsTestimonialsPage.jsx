import { CmsCrudPage } from '../../../common/components/CmsCrudPage.jsx';
import { testimonialsApi } from '../../../common/api/cmsApi.js';

export function CmsTestimonialsPage() {
  return (
    <CmsCrudPage
      title="Testimonials"
      api={testimonialsApi}
      emptyForm={{ authorName: '', authorDesignation: '', quote: '', rating: 5, isApproved: false, order: 0, status: 'draft' }}
      columns={[
        { key: 'authorName', label: 'Author' },
        { key: 'rating', label: 'Rating' },
        { key: 'status', label: 'Status' },
        { key: 'quote', label: 'Quote', render: (r) => `${r.quote?.slice(0, 50)}...` },
      ]}
      formFields={[
        { name: 'authorName', label: 'Author Name' },
        { name: 'authorDesignation', label: 'Designation' },
        { name: 'quote', label: 'Quote', type: 'textarea', rows: 4 },
        { name: 'rating', label: 'Rating', type: 'number' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
      ]}
      renderPreview={(form) => (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '16px' }}>&ldquo;{form.quote || 'Your testimonial quote...'}&rdquo;</div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{form.authorName || 'Author'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{form.authorDesignation}</div>
        </div>
      )}
    />
  );
}
