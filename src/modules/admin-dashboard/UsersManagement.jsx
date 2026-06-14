import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogIn, Trash2, Ban, Plus, Pencil } from 'lucide-react';
import { usersApi } from '../../common/api/cmsApi.js';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { DataTable } from '../../common/components/DataTable.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';
import { Modal } from '../../common/components/Modal.jsx';
import { AdminPageShell } from './AdminPageShell.jsx';
import { PasswordInput } from '../../common/components/PasswordInput.jsx';
import { CopyableText } from '../../common/components/CopyableText.jsx';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  isActive: true,
  isRestricted: false,
};

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <label className="toggle-field">
      <span className="toggle-field__text">
        <span className="toggle-field__label">{label}</span>
        {hint && <span className="toggle-field__hint">{hint}</span>}
      </span>
      <span className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-switch__track">
          <span className="toggle-switch__thumb" />
        </span>
      </span>
    </label>
  );
}

export function UsersManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { impersonateUser } = useAdminAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: search || undefined };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      const res = await usersApi.list(params);
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      isRestricted: Boolean(user.isRestricted),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!editing && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await usersApi.update(editing._id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
          isRestricted: form.isRestricted,
        });
        toast.success('User updated');
      } else {
        await usersApi.create({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
          isRestricted: form.isRestricted,
        });
        toast.success('User created');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImpersonate = async (user) => {
    try {
      await impersonateUser(user._id);
      toast.success(`Logged in as ${user.name} — no password needed`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleRestrict = async (user, e) => {
    e?.stopPropagation();
    try {
      await usersApi.update(user._id, { isRestricted: !user.isRestricted });
      toast.success(user.isRestricted ? 'User unrestricted' : 'User restricted');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (user, e) => {
    e?.stopPropagation();
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await usersApi.remove(user._id);
      toast.success('User deleted');
      if (editing?._id === user._id) closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <CopyableText value={r.name} /> },
    { key: 'email', label: 'Email', render: (r) => <CopyableText value={r.email} /> },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge status={r.isRestricted ? 'restricted' : r.isActive ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn-icon" onClick={() => openEdit(r)} title="Edit user">
            <Pencil size={12} />
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            onClick={() => handleImpersonate(r)}
            title="One-click login as this user"
          >
            <LogIn size={12} />
          </button>
          <button type="button" className="btn-icon" onClick={(e) => handleToggleRestrict(r, e)} title={r.isRestricted ? 'Unrestrict' : 'Restrict'}>
            <Ban size={12} />
          </button>
          <button type="button" className="btn-danger" onClick={(e) => handleDelete(r, e)} title="Delete user">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  const filters = (
      <div className="users-filters-grid">
        <div className="users-filters-grid__search">
          <label htmlFor="users-search">Search</label>
          <input
            id="users-search"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>
        <div>
          <label htmlFor="users-role">Role</label>
          <select id="users-role" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="users-status">Status</label>
          <select id="users-status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="users-filters-grid__action">
          <label aria-hidden="true">&nbsp;</label>
          <button type="button" className="btn-secondary" onClick={() => { setPage(1); fetchUsers(); }} style={{ width: '100%' }}>
            Apply
          </button>
        </div>
      </div>
  );

  return (
    <div className="admin-page-root">
      <AdminPageShell
        title="Users"
        actions={(
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Add User
          </button>
        )}
        filters={filters}
        loading={loading}
        meta={meta}
        onPageChange={setPage}
      >
        <DataTable columns={columns} data={items} onRowClick={openEdit} compact />
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit User' : 'Add New User'}
        size="sm"
        backdrop="blue"
      >
        <label style={labelStyle}>Full name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Doe"
          style={{ marginBottom: 12 }}
        />

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="jane@example.com"
          style={{ marginBottom: 12 }}
        />

        {!editing && (
          <>
            <label style={labelStyle}>Password</label>
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
              minLength={6}
              style={{ marginBottom: 12 }}
            />
          </>
        )}

        <label style={labelStyle}>Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={{ marginBottom: 16 }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <ToggleField
          label="Active account"
          hint="User can sign in when active"
          checked={form.isActive}
          onChange={(isActive) => setForm({ ...form, isActive })}
        />
        <ToggleField
          label="Restricted"
          hint="Blocks login even if active"
          checked={form.isRestricted}
          onChange={(isRestricted) => setForm({ ...form, isRestricted })}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create User'}
          </button>
          {editing && (
            <>
              <button type="button" className="btn-secondary" onClick={() => handleImpersonate(editing)} style={{ width: '100%' }}>
                <LogIn size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Login as User
              </button>
              <button type="button" className="btn-danger" onClick={(e) => handleDelete(editing, e)} style={{ width: '100%' }}>
                Delete User
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--color-text-muted)',
  marginBottom: 4,
};
