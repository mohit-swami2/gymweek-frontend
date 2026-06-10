import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function ProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fitnessApi.getProfile(), fitnessApi.getStats()])
      .then(([profRes, statsRes]) => {
        setProfile(profRes.data[0]);
        setStats(statsRes.data[0]);
        setForm({
          name: profRes.data[0]?.name,
          displayName: profRes.data[0]?.displayName,
          age: profRes.data[0]?.age,
          height: profRes.data[0]?.height,
          weight: profRes.data[0]?.weight,
          fitnessGoal: profRes.data[0]?.fitnessGoal || 'general',
        });
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.updateProfile(form);
      setProfile(res.data[0]);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div style={{ padding: '24px' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '32px' }}>Profile</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 900, color: '#080808', marginBottom: '20px',
        }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Workouts', value: stats.totalWorkouts },
              { label: 'Volume', value: `${(stats.totalVolume / 1000).toFixed(0)}K kg` },
              { label: 'PRs', value: stats.prCount },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px', background: 'var(--color-background)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'displayName', label: 'Display Name', type: 'text' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'height', label: 'Height (cm)', type: 'number' },
          { key: 'weight', label: 'Weight (kg)', type: 'number' },
        ].map(({ key, label, type }) => (
          <div key={key} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
            <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Fitness Goal</label>
          <select value={form.fitnessGoal} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}>
            {['strength', 'muscle', 'endurance', 'weightLoss', 'general'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
