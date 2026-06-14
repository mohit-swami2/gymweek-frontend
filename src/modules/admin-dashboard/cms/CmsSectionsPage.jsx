import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Code2, Layout, Eye } from 'lucide-react';
import { Modal } from '../../../common/components/Modal.jsx';
import { toast } from 'sonner';
import { sectionsApi, testimonialsApi } from '../../../common/api/cmsApi.js';
import { CmsSectionEditor } from '../../cms/CmsSectionEditor.jsx';
import { SectionPreview } from '../../cms/SectionPreview.jsx';
import {
  CMS_PAGES,
  SECTION_DEFINITIONS,
  sectionFromForm,
  formFromSection,
} from '../../cms/sectionRegistry.js';
import { invalidateCmsCache } from '../../website/hooks/useWebsiteCms.js';
import '../../website/landing.css';

export function CmsSectionsPage() {
  const [items, setItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState(formFromSection(null));
  const [showJson, setShowJson] = useState(false);
  const [pageFilter, setPageFilter] = useState('all');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await sectionsApi.list({ page: 1, limit: 100 });
      setItems(res.data || []);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await testimonialsApi.list({ page: 1, limit: 20, status: 'published' });
      setTestimonials(res.data || []);
    } catch {
      setTestimonials([]);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchTestimonials();
  }, [fetchItems, fetchTestimonials]);

  const selectSection = (row) => {
    const def = SECTION_DEFINITIONS[row.sectionKey];
    if (def?.managedElsewhere) return;
    setSelectedKey(row.sectionKey);
    setForm(formFromSection(row));
    setShowJson(false);
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    try {
      let payload = sectionFromForm(form);
      if (showJson && typeof form.content === 'string') {
        payload.content = JSON.parse(form.content);
      }
      await sectionsApi.upsertByKey(selectedKey, payload);
      invalidateCmsCache();
      toast.success('Section saved — changes are live on the website');
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const groupedSections = useMemo(() => {
    const map = {};
    CMS_PAGES.forEach((page) => {
      map[page.id] = { ...page, rows: [] };
    });
    items.forEach((item) => {
      const def = SECTION_DEFINITIONS[item.sectionKey];
      const pageId = def?.page || 'other';
      if (!map[pageId]) map[pageId] = { id: pageId, label: 'Other', rows: [] };
      map[pageId].rows.push(item);
    });
    return Object.values(map).filter((p) => p.rows.length > 0 || p.sections?.length);
  }, [items]);

  const filteredPages = pageFilter === 'all'
    ? groupedSections
    : groupedSections.filter((p) => p.id === pageFilter);

  const previewContent = selectedKey ? (
    <SectionPreview sectionKey={selectedKey} form={form} testimonials={testimonials} />
  ) : null;

  return (
    <div className="admin-page-root">
      <div className="admin-page cms-sections-page">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Website Content</h1>
            <p className="cms-sections-page__desc">
              Control all public page text. Each card maps a page to its editable CMS sections.
            </p>
          </div>
        </div>

        <div className="admin-page__body cms-sections-page__body">
          <div className="cms-sections-page__map">
            {CMS_PAGES.map((page) => (
              <div key={page.id} className="card cms-sections-page__map-card">
                <div className="cms-sections-page__map-card-head">
                  <div>
                    <div className="cms-sections-page__map-title">{page.label}</div>
                    <div className="cms-sections-page__map-path">{page.path}</div>
                  </div>
                  {page.path.startsWith('/') && page.path !== '—' && (
                    <a href={page.path} target="_blank" rel="noreferrer" className="cms-sections-page__ext">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                {page.managedElsewhere ? (
                  <div className="cms-sections-page__links">
                    {Object.entries(page.adminRoutes || {}).map(([key, route]) => (
                      <Link key={key} to={route}>
                        → {key === '_items' ? 'Manage items' : SECTION_DEFINITIONS[key]?.label || key}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ul className="cms-sections-page__section-list">
                    {page.sections.map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          className={selectedKey === key ? 'cms-sections-page__section-btn--active' : ''}
                          onClick={() => {
                            const row = items.find((i) => i.sectionKey === key);
                            if (row) selectSection(row);
                            setPageFilter(page.id);
                          }}
                        >
                          {SECTION_DEFINITIONS[key]?.label || key}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="cms-sections-page__filters">
            <button type="button" className={pageFilter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setPageFilter('all')}>
              All sections
            </button>
            {CMS_PAGES.filter((p) => !p.managedElsewhere).map((p) => (
              <button key={p.id} type="button" className={pageFilter === p.id ? 'btn-primary' : 'btn-secondary'} onClick={() => setPageFilter(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="cms-sections-page__workspace">
            <div className="card cms-sections-page__sidebar">
              {filteredPages.map((page) => (
                <div key={page.id}>
                  <div className="cms-sections-page__sidebar-group">{page.label}</div>
                  {page.rows.map((row) => {
                    const def = SECTION_DEFINITIONS[row.sectionKey];
                    return (
                      <button
                        key={row.sectionKey}
                        type="button"
                        className={`cms-sections-page__sidebar-item${selectedKey === row.sectionKey ? ' cms-sections-page__sidebar-item--active' : ''}`}
                        onClick={() => selectSection(row)}
                      >
                        <div className="cms-sections-page__sidebar-label">{def?.label || row.sectionKey}</div>
                        <div className="cms-sections-page__sidebar-meta">{row.sectionKey} · {row.status}</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="cms-sections-page__editor">
              {selectedKey ? (
                <div className="card cms-sections-page__editor-card cms-sections-page__editor-card--sticky">
                  <div className="cms-sections-page__editor-head">
                    <div>
                      <h3>{SECTION_DEFINITIONS[selectedKey]?.label || selectedKey}</h3>
                      <code>{selectedKey}</code>
                    </div>
                    <div className="cms-sections-page__editor-modes">
                      <button type="button" className={showJson ? 'btn-secondary' : 'btn-icon'} onClick={() => setShowJson(false)} title="Visual editor">
                        <Layout size={14} /> Visual
                      </button>
                      <button type="button" className={showJson ? 'btn-icon' : 'btn-secondary'} onClick={() => setShowJson(true)} title="JSON editor">
                        <Code2 size={14} /> JSON
                      </button>
                    </div>
                  </div>

                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="cms-sections-page__status">
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>

                  <div className="cms-sections-page__editor-scroll">
                    <CmsSectionEditor sectionKey={selectedKey} form={form} onChange={setForm} showJson={showJson} />
                  </div>

                  <div className="cms-sections-page__editor-actions admin-form__actions">
                    <button type="button" className="btn-primary" onClick={handleSave}>
                      Save & Publish
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Eye size={14} style={{ marginRight: 6 }} />
                      Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card cms-sections-page__empty">
                  Select a section from the page map or sidebar to edit its content.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showPreviewModal && !!selectedKey}
        onClose={() => setShowPreviewModal(false)}
        title={`Preview — ${SECTION_DEFINITIONS[selectedKey]?.label || selectedKey || ''}`}
        size="xl"
        backdrop="blue"
      >
        <p className="admin-preview-hint">
          Live preview of your current editor values (unsaved changes included).
        </p>
        <div className="cms-preview-modal__frame">
          <div className="cms-preview-modal__viewport">
            {previewContent}
          </div>
        </div>
      </Modal>
    </div>
  );
}
