import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../common/api/client.js';
import { DataTable } from '../../common/components/DataTable.jsx';

export function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    authorName: '', authorDesignation: '', quote: '', rating: 5, isApproved: false, order: 0,
  });

  const fetchTestimonials = async () => {
    try {
      const res = await apiClient.get('/cms/testimonials');
      setTestimonials(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/cms/testimonials', form);
      toast.success('Testimonial created');
      setShowForm(false);
      setForm({ authorName: '', authorDesignation: '', quote: '', rating: 5, isApproved: false, order: 0 });
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleApproval = async (t) => {
    try {
      await apiClient.patch(`/cms/testimonials/${t._id}`, { isApproved: !t.isApproved });
      toast.success('Updated');
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'authorName', label: 'Author' },
    { key: 'rating', label: 'Rating' },
    { key: 'isApproved', label: 'Approved', render: (r) => r.isApproved ? 'Yes' : 'No' },
    { key: 'quote', label: 'Quote', render: (r) => `${r.quote.slice(0, 60)}...` },
    { key: 'actions', label: 'Actions', render: (r) => (
      <button type="button" onClick={() => toggleApproval(r)} style={actionBtn}>
        {r.isApproved ? 'Revoke' : 'Approve'}
      </button>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Testimonials</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          {showForm ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: '12px', padding: '24px', marginBottom: '24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
        }}>
          <input placeholder="Author Name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required style={inputStyle} />
          <input placeholder="Designation" value={form.authorDesignation} onChange={(e) => setForm({ ...form, authorDesignation: e.target.value })} style={inputStyle} />
          <textarea placeholder="Quote" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required rows={3} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
          <input type="number" min={1} max={5} placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} style={inputStyle} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} />
            Approve immediately
          </label>
          <button type="submit" style={{ ...primaryBtn, gridColumn: '1 / -1' }}>Create</button>
        </form>
      )}

      <DataTable columns={columns} data={testimonials} />
    </div>
  );
}

const inputStyle = {
  padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)',
};

const primaryBtn = {
  padding: '10px 20px', borderRadius: '8px', border: 'none',
  background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer',
};

const actionBtn = {
  padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)',
  background: 'var(--color-surface)', cursor: 'pointer', fontSize: '0.75rem',
};
