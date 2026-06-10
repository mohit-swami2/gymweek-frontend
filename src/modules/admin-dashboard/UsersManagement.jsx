import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogIn, Trash2, Ban } from 'lucide-react';
import { adminApi } from '../../common/api/client.js';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { DataTable } from '../../common/components/DataTable.jsx';
import { Pagination } from '../../common/components/Pagination.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';

export function UsersManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { impersonateUser } = useAdminAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/users', { params: { page, limit: 10, search } });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleImpersonate = async (user) => {
    try {
      await impersonateUser(user._id);
      toast.success(`Logged in as ${user.name} — no password needed`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleRestrict = async (user) => {
    try {
      await adminApi.patch(`/users/${user._id}`, { isRestricted: !user.isRestricted });
      toast.success('User updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    try {
      await adminApi.delete(`/users/${user._id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.isRestricted ? 'restricted' : r.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleImpersonate(r)} title="One-click login as this user">
            <LogIn size={12} style={{ marginRight: 4 }} /> Login as User
          </button>
          <button type="button" className="btn-icon" onClick={() => handleToggleRestrict(r)}><Ban size={12} /></button>
          <button type="button" className="btn-danger" onClick={() => handleDelete(r)}><Trash2 size={12} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem', marginBottom: '24px' }}>Users</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} style={{ flex: 1 }} />
        <button type="button" className="btn-primary" onClick={fetchUsers}>Search</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <DataTable columns={columns} data={items} />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
