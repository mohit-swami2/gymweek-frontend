import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '../../common/api/client.js';
import { DataTable } from '../../common/components/DataTable.jsx';
import { Pagination } from '../../common/components/Pagination.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';

const STATUS_OPTIONS = ['pending', 'in_progress', 'fulfilled'];

export function ContactsManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');

  const fetchContacts = async () => {
    try {
      const res = await adminApi.get('/contacts', { params: { page, limit: 10 } });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchContacts(); }, [page]);

  const handleSelect = (row) => { setSelected(row); setNotes(row.adminNotes || ''); setStatus(row.status); };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await adminApi.patch(`/contacts/${selected._id}`, { status, adminNotes: notes });
      toast.success('Contact updated');
      setSelected(null);
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
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem', marginBottom: '24px' }}>Contact Inquiries</h1>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '24px' }}>
        <div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
              { key: 'actions', label: '', render: (r) => <button type="button" className="btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}>Delete</button> },
            ]}
            data={items}
            onRowClick={handleSelect}
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
        {selected && (
          <div className="card" style={{ position: 'sticky', top: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>{selected.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{selected.message}</p>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginBottom: '12px' }}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Admin Notes</label>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ marginBottom: '12px' }} />
            <button type="button" className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
