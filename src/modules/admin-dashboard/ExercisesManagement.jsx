import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { exercisesApi, uploadAdminFile } from '../../common/api/cmsApi.js';
import { API_BASE_URL } from '../../config/api.js';
import { DataTable } from '../../common/components/DataTable.jsx';
import { StatusBadge } from '../../common/components/StatusBadge.jsx';
import { Modal } from '../../common/components/Modal.jsx';
import { AdminPageShell } from './AdminPageShell.jsx';
import { ExerciseMedia } from '../workout-logger/ExerciseMedia.jsx';
import '../workout-logger/workout-log.css';

const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band'];
const MOVEMENT_TYPES = ['push', 'pull', 'squat', 'hinge', 'carry', 'isolation', 'compound'];

const EMPTY_FORM = {
  name: '',
  slug: '',
  muscleGroup: '',
  secondaryMuscles: '',
  equipmentType: 'barbell',
  movementType: 'compound',
  instructions: '',
  videoUrl: '',
  gifUrl: '',
  isActive: true,
};

const mediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL;
  return `${base}${url}`;
};

const exerciseImageSrc = (ex) => mediaUrl(ex?.mediaPreviewUrls?.[0] || ex?.mediaPreviewUrl || ex?.gifUrl);

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

export function ExercisesManagement() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    exercisesApi.getMuscleGroups()
      .then((res) => setMuscleGroups(res.data))
      .catch(() => toast.error('Failed to load muscle groups'));
  }, []);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: search || undefined };
      if (muscleFilter) params.muscleGroup = muscleFilter;
      if (equipmentFilter) params.equipmentType = equipmentFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      const res = await exercisesApi.list(params);
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, muscleFilter, equipmentFilter, statusFilter]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const previewExercise = useMemo(() => {
    const resolveUrls = (ex, preview) => {
      if (preview) return [mediaUrl(preview)];
      if (ex?.mediaPreviewUrls?.length) return ex.mediaPreviewUrls;
      if (ex?.mediaPreviewUrl) return [ex.mediaPreviewUrl];
      if (ex?.mediaUrls?.length) return ex.mediaUrls.map((u) => mediaUrl(u));
      if (ex?.gifUrl) return [mediaUrl(ex.gifUrl)];
      if (form.gifUrl) return [mediaUrl(form.gifUrl)];
      return [];
    };

    const urls = resolveUrls(editing, previewUrl);
    return {
      _id: editing?._id || 'preview',
      name: form.name || editing?.name || 'Exercise',
      mediaPreviewUrls: urls,
      mediaPreviewUrl: urls[0],
      gifUrl: urls[0],
      mediaUrls: editing?.mediaUrls,
    };
  }, [previewUrl, form.gifUrl, form.name, editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPreviewUrl('');
    setModalOpen(true);
  };

  const openEdit = async (ex) => {
    setModalOpen(true);
    setEditing(ex);
    setPreviewUrl(ex.mediaPreviewUrls?.[0] || ex.mediaPreviewUrl || mediaUrl(ex.gifUrl));
    setForm({
      name: ex.name || '',
      slug: ex.slug || '',
      muscleGroup: ex.muscleGroup?._id || ex.muscleGroup || ex.muscleGroupData?._id || '',
      secondaryMuscles: (ex.secondaryMuscles || []).join(', '),
      equipmentType: ex.equipmentType || 'barbell',
      movementType: ex.movementType || 'compound',
      instructions: ex.instructions || '',
      videoUrl: ex.videoUrl || '',
      gifUrl: ex.gifUrl || '',
      isActive: ex.isActive !== false,
    });

    try {
      const res = await exercisesApi.get(ex._id);
      const fresh = res.data?.[0];
      if (!fresh) return;
      setEditing(fresh);
      setPreviewUrl(fresh.mediaPreviewUrls?.[0] || fresh.mediaPreviewUrl || mediaUrl(fresh.gifUrl));
      setForm({
        name: fresh.name || '',
        slug: fresh.slug || '',
        muscleGroup: fresh.muscleGroup?._id || fresh.muscleGroup || fresh.muscleGroupData?._id || '',
        secondaryMuscles: (fresh.secondaryMuscles || []).join(', '),
        equipmentType: fresh.equipmentType || 'barbell',
        movementType: fresh.movementType || 'compound',
        instructions: fresh.instructions || '',
        videoUrl: fresh.videoUrl || '',
        gifUrl: fresh.gifUrl || '',
        isActive: fresh.isActive !== false,
      });
    } catch {
      /* keep row data */
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setPreviewUrl('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadAdminFile(file, 'exercises');
      setForm((f) => ({ ...f, gifUrl: result.url }));
      setPreviewUrl(result.mediaPreviewUrl || result.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.muscleGroup) {
      toast.error('Name and muscle group are required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      equipmentType: form.equipmentType,
      movementType: form.movementType,
      instructions: form.instructions.trim() || undefined,
      videoUrl: form.videoUrl.trim() || undefined,
      gifUrl: form.gifUrl.trim() || undefined,
      isActive: form.isActive,
      secondaryMuscles: form.secondaryMuscles
        ? form.secondaryMuscles.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    setSaving(true);
    try {
      if (editing) {
        await exercisesApi.update(editing._id, payload);
        toast.success('Exercise updated');
      } else {
        await exercisesApi.create(payload);
        toast.success('Exercise created');
      }
      closeModal();
      fetchExercises();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ex, e) => {
    e?.stopPropagation();
    if (!confirm(`Delete "${ex.name}"?`)) return;
    try {
      await exercisesApi.remove(ex._id);
      toast.success('Exercise deleted');
      if (editing?._id === ex._id) closeModal();
      fetchExercises();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const muscleName = (r) => r.muscleGroupData?.name || r.muscleGroup?.name || '—';

  const columns = [
    {
      key: 'gifUrl',
      label: 'Image',
      render: (r) => (
        r.gifUrl ? (
          <img
            src={exerciseImageSrc(r)}
            alt={r.name}
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, background: 'var(--color-border)' }}
          />
        ) : (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>—</span>
        )
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'muscleGroup', label: 'Muscle', render: (r) => muscleName(r) },
    { key: 'equipmentType', label: 'Equipment' },
    { key: 'movementType', label: 'Movement' },
    {
      key: 'isActive',
      label: 'Status',
      render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn-icon" onClick={() => openEdit(r)} title="Edit">
            <Pencil size={12} />
          </button>
          <button type="button" className="btn-danger" onClick={(e) => handleDelete(r, e)} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  const filters = (
      <div className="users-filters-grid users-filters-grid--wide">
        <div className="users-filters-grid__search">
          <label htmlFor="ex-search">Search</label>
          <input
            id="ex-search"
            placeholder="Name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchExercises()}
          />
        </div>
        <div>
          <label htmlFor="ex-muscle">Muscle group</label>
          <select id="ex-muscle" value={muscleFilter} onChange={(e) => { setMuscleFilter(e.target.value); setPage(1); }}>
            <option value="">All muscles</option>
            {muscleGroups.map((mg) => (
              <option key={mg._id} value={mg.slug}>{mg.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ex-equipment">Equipment</label>
          <select id="ex-equipment" value={equipmentFilter} onChange={(e) => { setEquipmentFilter(e.target.value); setPage(1); }}>
            <option value="">All equipment</option>
            {EQUIPMENT_TYPES.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ex-status">Status</label>
          <select id="ex-status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="users-filters-grid__action">
          <label aria-hidden="true">&nbsp;</label>
          <button type="button" className="btn-secondary" onClick={() => { setPage(1); fetchExercises(); }} style={{ width: '100%' }}>
            Apply
          </button>
        </div>
      </div>
  );

  const modalFooter = (
    <div className="exercise-modal__actions">
      <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Exercise'}
      </button>
      {editing && (
        <button type="button" className="btn-danger" onClick={(e) => handleDelete(editing, e)}>
          Delete Exercise
        </button>
      )}
    </div>
  );

  return (
    <div className="admin-page-root">
      <AdminPageShell
        title="Exercises"
        actions={(
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Add Exercise
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
        title={editing ? 'View Exercise' : 'Add Exercise'}
        size="2xl"
        backdrop="blue"
        scrollBody
        footer={modalFooter}
      >
        <div className="exercise-modal">
          <div className="exercise-modal__preview">
            <label style={labelStyle}>Preview</label>
            <div className="exercise-modal__media">
              <ExerciseMedia exercise={previewExercise} alt={form.name || 'Exercise'} variant="picker-full" autoPlay />
            </div>
            {editing?.mediaPreviewUrls?.length > 1 && (
              <p className="exercise-modal__frames">{editing.mediaPreviewUrls.length} animation frames</p>
            )}
          </div>

          <div className="exercise-modal__form">
            <label style={labelStyle}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Bench Press"
              style={{ marginBottom: 12 }}
            />

            <label style={labelStyle}>Slug (optional)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="bench-press"
              style={{ marginBottom: 12 }}
            />

            <label style={labelStyle}>Muscle group</label>
            <select
              value={form.muscleGroup}
              onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
              style={{ marginBottom: 12 }}
            >
              <option value="">Select muscle group</option>
              {muscleGroups.map((mg) => (
                <option key={mg._id} value={mg._id}>{mg.name}</option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Equipment</label>
                <select value={form.equipmentType} onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}>
                  {EQUIPMENT_TYPES.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Movement</label>
                <select value={form.movementType} onChange={(e) => setForm({ ...form, movementType: e.target.value })}>
                  {MOVEMENT_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <label style={labelStyle}>Secondary muscles (comma-separated)</label>
            <input
              value={form.secondaryMuscles}
              onChange={(e) => setForm({ ...form, secondaryMuscles: e.target.value })}
              placeholder="triceps, shoulders"
              style={{ marginBottom: 12 }}
            />

            <label style={labelStyle}>Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={4}
              style={{ marginBottom: 12, width: '100%', resize: 'vertical' }}
            />

            <label style={labelStyle}>Video URL</label>
            <input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://..."
              style={{ marginBottom: 12 }}
            />

            <label style={labelStyle}>Image URL</label>
            <input
              value={form.gifUrl}
              onChange={(e) => setForm({ ...form, gifUrl: e.target.value })}
              placeholder="/uploads-gymweek/exercises/..."
              style={{ marginBottom: 8 }}
            />
            <label className="btn-secondary exercise-modal__upload">
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={uploading} />
            </label>

            <ToggleField
              label="Active"
              hint="Visible in the exercise library"
              checked={form.isActive}
              onChange={(isActive) => setForm({ ...form, isActive })}
            />
          </div>
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
