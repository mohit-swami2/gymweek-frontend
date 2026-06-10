import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../common/api/client.js';

export function CmsManagement() {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', content: '' });
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      const res = await apiClient.get('/cms/sections');
      setSections(res.data.sections || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);

  const handleSelect = (section) => {
    setSelected(section);
    setForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: JSON.stringify(section.content, null, 2),
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      let content;
      try {
        content = JSON.parse(form.content);
      } catch {
        toast.error('Content must be valid JSON');
        return;
      }
      await apiClient.put(`/cms/sections/${selected.sectionKey}`, {
        title: form.title,
        subtitle: form.subtitle,
        content,
        isActive: true,
      });
      toast.success('Section updated');
      fetchSections();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>CMS Pages</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map((s) => (
            <button
              key={s.sectionKey}
              type="button"
              onClick={() => handleSelect(s)}
              style={{
                padding: '12px 16px', borderRadius: '8px', textAlign: 'left',
                border: '1px solid var(--color-border)',
                background: selected?.sectionKey === s.sectionKey ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selected?.sectionKey === s.sectionKey ? '#fff' : 'var(--color-text)',
                cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              <div style={{ fontWeight: 600 }}>{s.sectionKey}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.title}</div>
            </button>
          ))}
        </div>
        {selected && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '12px', padding: '24px',
          }}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" style={inputStyle} />
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" style={{ ...inputStyle, marginTop: '12px' }} />
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '16px', display: 'block' }}>Content (JSON)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={16}
              style={{ ...inputStyle, marginTop: '4px', fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
            />
            <button type="button" onClick={handleSave} style={{ ...primaryBtn, marginTop: '16px' }}>Save Section</button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)',
};

const primaryBtn = {
  padding: '10px 20px', borderRadius: '8px', border: 'none',
  background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer',
};
