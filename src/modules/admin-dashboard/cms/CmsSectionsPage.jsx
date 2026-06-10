import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { sectionsApi } from '../../../common/api/cmsApi.js';
import { DataTable } from '../../../common/components/DataTable.jsx';
import { Pagination } from '../../../common/components/Pagination.jsx';
import { PreviewPanel } from '../../../common/components/PreviewPanel.jsx';
import { HeroSection } from '../../website/HeroSection.jsx';
import { AboutSection } from '../../website/AboutSection.jsx';

export function CmsSectionsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', content: '{}', status: 'published' });

  const fetchItems = useCallback(async () => {
    try {
      const res = await sectionsApi.list({ page, limit: 10 });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const selectRow = (row) => {
    setSelected(row);
    setForm({ title: row.title, subtitle: row.subtitle || '', content: JSON.stringify(row.content, null, 2), status: row.status });
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      let content;
      try { content = JSON.parse(form.content); } catch { toast.error('Invalid JSON'); return; }
      await sectionsApi.upsertByKey(selected.sectionKey, { title: form.title, subtitle: form.subtitle, content, status: form.status, isActive: true });
      toast.success('Section updated');
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  };

  let previewContent;
  try {
    const content = JSON.parse(form.content);
    if (selected?.sectionKey === 'hero_section') previewContent = <HeroSection section={{ ...selected, title: form.title, subtitle: form.subtitle, content }} />;
    else if (selected?.sectionKey === 'about_us') previewContent = <AboutSection section={{ title: form.title, subtitle: form.subtitle, content }} />;
    else previewContent = <pre style={{ padding: '16px', fontSize: '0.8rem' }}>{JSON.stringify(content, null, 2)}</pre>;
  } catch {
    previewContent = <p style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Invalid JSON</p>;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem', marginBottom: '24px' }}>Page Sections</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <DataTable
            columns={[
              { key: 'sectionKey', label: 'Key' },
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status' },
            ]}
            data={items}
            onRowClick={selectRow}
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
        <div>
          {selected && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '16px' }}>Edit: {selected.sectionKey}</h3>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" style={{ marginBottom: '10px' }} />
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" style={{ marginBottom: '10px' }} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ marginBottom: '10px' }}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
              <button type="button" className="btn-primary" onClick={handleSave} style={{ marginTop: '12px' }}>Save & Preview</button>
            </div>
          )}
          <PreviewPanel title="Website Section Preview" panel="website">{previewContent || <p style={{ padding: '16px' }}>Select a section</p>}</PreviewPanel>
        </div>
      </div>
    </div>
  );
}
