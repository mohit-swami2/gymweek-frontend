import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from './DataTable.jsx';
import { Pagination } from './Pagination.jsx';
import { PreviewPanel, HtmlPreview } from './PreviewPanel.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function CmsCrudPage({
  title,
  api,
  columns,
  formFields,
  renderPreview,
  previewType = 'html',
  emptyForm = {},
}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list({ page, limit: 10, search });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, page, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.update(editing._id, form);
        toast.success('Updated');
      } else {
        await api.create(form);
        toast.success('Created');
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.remove(row._id);
      toast.success('Deleted');
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const actionCol = {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-icon" onClick={() => openEdit(row)}><Pencil size={12} /> Edit</button>
        <button type="button" className="btn-danger" onClick={() => handleDelete(row)}><Trash2 size={12} /></button>
      </div>
    ),
  };

  const previewContent = renderPreview
    ? renderPreview(form)
    : previewType === 'html'
      ? <HtmlPreview html={form.content} />
      : <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(form, null, 2)}</pre>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem' }}>{title}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={14} style={{ marginRight: 4 }} /> {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button type="button" className="btn-primary" onClick={openCreate}><Plus size={14} style={{ marginRight: 4 }} /> Add New</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div>
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchItems()} style={{ marginBottom: '16px' }} />
          {loading ? <p>Loading...</p> : (
            <>
              <DataTable columns={[...columns, actionCol]} data={items} onRowClick={openEdit} />
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          )}
        </div>

        {showPreview && (
          <div>
            {showForm ? (
              <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>{editing ? 'Edit' : 'Create'}</h3>
                {formFields.map((field) => (
                  <div key={field.name} style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea rows={field.rows || 6} value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
                    ) : field.type === 'select' ? (
                      <select value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={field.type || 'text'} value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: field.type === 'number' ? +e.target.value : e.target.value })} />
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
            <PreviewPanel title={`${title} Preview`}>
              {previewContent}
            </PreviewPanel>
          </div>
        )}
      </div>
    </div>
  );
}

export { StatusBadge };
