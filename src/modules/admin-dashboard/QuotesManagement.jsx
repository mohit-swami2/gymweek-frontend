import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Quote } from 'lucide-react';
import { adminApi } from '../../common/api/client.js';
import { DataTable } from '../../common/components/DataTable.jsx';
import { Modal } from '../../common/components/Modal.jsx';
import { AdminPageShell } from './AdminPageShell.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';
import './quotes.css';

const CATEGORIES = ['motivation', 'discipline', 'strength', 'recovery', 'general'];
const EMPTY_FORM = { text: '', author: '', category: 'motivation', isActive: true };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function QuotesManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder,
        activeOnly: 'false',
        search: search || undefined,
        category: category || undefined,
        isActive: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined,
      };
      const res = await adminApi.get('/quotes', { params });
      setItems(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, statusFilter, sortOrder]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      text: row.text,
      author: row.author || '',
      category: row.category || 'motivation',
      isActive: row.isActive !== false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.text?.trim()) {
      toast.error('Quote text is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.patch(`/quotes/${editing._id}`, form);
        toast.success('Quote updated');
      } else {
        await adminApi.post('/quotes', form);
        toast.success('Quote created');
      }
      closeModal();
      fetchQuotes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row, e) => {
    e?.stopPropagation?.();
    if (!confirm('Delete this quote?')) return;
    try {
      await adminApi.delete(`/quotes/${row._id}`);
      toast.success('Quote deleted');
      fetchQuotes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'text',
      label: 'Quote',
      render: (row) => (
        <div className="quotes-table__text">
          <Quote size={14} className="quotes-table__icon" aria-hidden />
          <span>&ldquo;{row.text}&rdquo;</span>
        </div>
      ),
    },
    { key: 'author', label: 'Author' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="quotes-table__cat">{row.category}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <StatusBadge status={row.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      label: 'Added',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="quotes-table__actions" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn-icon" title="Edit quote" onClick={() => openEdit(row)}>
            <Pencil size={15} />
          </button>
          <button type="button" className="btn-icon btn-icon--danger" title="Delete quote" onClick={(e) => handleDelete(row, e)}>
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-root">
      <AdminPageShell
        title="Motivational Quotes"
        loading={loading}
        meta={meta}
        onPageChange={setPage}
        actions={(
          <button type="button" className="btn-primary quotes-page__create" onClick={openCreate}>
            <Plus size={16} /> Add Quote
          </button>
        )}
        filters={(
          <div className="quotes-filters">
            <input
              type="search"
              placeholder="Search quotes or authors…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        )}
      >
        <p className="quotes-page__hint">
          Used on workout sheets, check-ins, and exports. {meta.total ?? 0} quotes in library.
        </p>
        <DataTable
          compact
          columns={columns}
          data={items}
          onRowClick={openEdit}
          emptyMessage="No quotes match your filters"
        />
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Quote' : 'Add Quote'}
        size="md"
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Quote'}
            </button>
          </>
        )}
      >
        <div className="quotes-form">
          <label>
            Quote
            <textarea
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Discipline beats motivation."
              maxLength={500}
            />
          </label>
          <label>
            Author
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Unknown"
              maxLength={120}
            />
          </label>
          <label>
            Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="quotes-form__toggle">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active — visible on sheets and check-ins
          </label>
        </div>
      </Modal>
    </div>
  );
}
