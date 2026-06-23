import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from './DataTable.jsx';
import { Modal } from './Modal.jsx';
import { AdminPageShell } from '../../modules/admin-dashboard/AdminPageShell.jsx';
import { HtmlPreview } from './PreviewPanel.jsx';
import { RichTextEditor } from './RichTextEditor.jsx';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
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
      closeModal();
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

  const openPreview = (row) => {
    if (row) {
      setForm({ ...row });
    }
    setPreviewOpen(true);
  };

  const previewContent = renderPreview
    ? renderPreview(form)
    : previewType === 'html'
      ? <HtmlPreview html={form.content} />
      : <pre className="admin-preview-json">{JSON.stringify(form, null, 2)}</pre>;

  const actionCol = {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <div className="admin-table-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-icon" onClick={() => openPreview(row)} title="Preview">
          <Eye size={12} />
        </button>
        <button type="button" className="btn-icon" onClick={() => openEdit(row)} title="Edit">
          <Pencil size={12} />
        </button>
        <button type="button" className="btn-danger" onClick={() => handleDelete(row)} title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    ),
  };

  const filters = (
    <div className="users-filters-grid users-filters-grid--wide">
      <div className="users-filters-grid__search">
        <label htmlFor={`${title}-search`}>Search</label>
        <input
          id={`${title}-search`}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
        />
      </div>
      <div className="users-filters-grid__action">
        <label aria-hidden="true">&nbsp;</label>
        <button type="button" className="btn-secondary" onClick={() => { setPage(1); fetchItems(); }} style={{ width: '100%' }}>
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-page-root">
      <AdminPageShell
        title={title}
        actions={(
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 4 }} />
            Add New
          </button>
        )}
        filters={filters}
        loading={loading}
        meta={meta}
        onPageChange={setPage}
      >
        <DataTable columns={[...columns, actionCol]} data={items} onRowClick={openEdit} compact />
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit — ${title}` : `Create — ${title}`}
        size="lg"
        backdrop="blue"
      >
        <div className="admin-form">
          {formFields.map((field) => (
            <div key={field.name} className="admin-form__field">
              <label htmlFor={`cms-${field.name}`}>{field.label}</label>
              {field.type === 'richtext' ? (
                <RichTextEditor
                  value={form[field.name] || ''}
                  onChange={(html) => setForm({ ...form, [field.name]: html })}
                  minHeight={(field.rows || 12) * 22}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`cms-${field.name}`}
                  rows={field.rows || 6}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              ) : field.type === 'select' ? (
                <select
                  id={`cms-${field.name}`}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                >
                  {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  id={`cms-${field.name}`}
                  type={field.type || 'text'}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    [field.name]: field.type === 'number' ? +e.target.value : e.target.value,
                  })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="admin-form__actions">
          <button type="button" className="btn-secondary" onClick={() => setPreviewOpen(true)}>
            <Eye size={14} style={{ marginRight: 4 }} />
            Preview
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`${title} Preview`}
        size="xl"
        backdrop="blue"
      >
        <p className="admin-preview-hint">Live preview of the current content.</p>
        <div className="cms-preview-modal__frame cms-preview-modal__frame--document">
          {previewContent}
        </div>
      </Modal>
    </div>
  );
}

export { StatusBadge };
