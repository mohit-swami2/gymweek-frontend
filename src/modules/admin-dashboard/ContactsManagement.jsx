import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '../../common/api/client.js';
import { DataTable } from '../../common/components/DataTable.jsx';
import { Modal } from '../../common/components/Modal.jsx';
import { AdminPageShell } from './AdminPageShell.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';

const STATUS_OPTIONS = ['pending', 'in_progress', 'fulfilled'];

export function ContactsManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/contacts', { params: { page, limit: 10 } });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, [page]);

  const openDetail = (row) => {
    setSelected(row);
    setNotes(row.adminNotes || '');
    setStatus(row.status);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await adminApi.patch(`/contacts/${selected._id}`, { status, adminNotes: notes });
      toast.success('Contact updated');
      closeModal();
      fetchContacts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await adminApi.delete(`/contacts/${id}`);
      toast.success('Deleted');
      fetchContacts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="admin-page-root">
      <AdminPageShell
        title="Contact Inquiries"
        loading={loading}
        meta={meta}
        onPageChange={setPage}
      >
        <DataTable
          compact
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
                >
                  Delete
                </button>
              ),
            },
          ]}
          data={items}
          onRowClick={openDetail}
        />
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selected ? selected.name : 'Contact inquiry'}
        size="md"
        backdrop="blue"
      >
        {selected && (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              {selected.message}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
              {selected.email}
            </p>
            <div className="admin-form">
              <div className="admin-form__field">
                <label htmlFor="contact-status">Status</label>
                <select id="contact-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="admin-form__field">
                <label htmlFor="contact-notes">Admin notes</label>
                <textarea id="contact-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="admin-form__actions">
              <div style={{ flex: 1 }} />
              <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
