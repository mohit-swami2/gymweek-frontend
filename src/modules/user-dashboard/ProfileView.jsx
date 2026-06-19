import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dumbbell, Trophy, Flame } from 'lucide-react';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ProfileSkeleton } from './ProfileSkeleton.jsx';
import './profile.css';

const GOALS = [
  { id: 'strength', label: 'Strength' },
  { id: 'muscle', label: 'Muscle' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'weightLoss', label: 'Weight loss' },
  { id: 'general', label: 'General fitness' },
];

export function ProfileView() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.updateProfile(form);
      setProfile(res.data[0]);
      updateUser(res.data[0]);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profile</h1>

      <div className="card">
        <div className="profile-hero">
          <div className="profile-hero__avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="profile-hero__name">{form.displayName || form.name || user?.name}</h2>
            <p className="profile-hero__email">{user?.email}</p>
          </div>
        </div>

        {stats && (
          <div className="profile-stats">
            {[
              { label: 'Workouts', value: stats.totalWorkouts, icon: Flame },
              { label: 'Volume', value: `${(stats.totalVolume / 1000).toFixed(0)}K kg`, icon: Dumbbell },
              { label: 'PRs', value: stats.prCount, icon: Trophy },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="profile-stat">
                <Icon size={14} color="var(--color-accent)" style={{ marginBottom: 4 }} />
                <div className="profile-stat__label">{label}</div>
                <div className="profile-stat__value">{value}</div>
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
          <div key={key} className="profile-form__field">
            <label>{label}</label>
            <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}

        <div className="profile-form__field">
          <label>Fitness Goal</label>
          <div className="profile-form__goal-grid">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`profile-form__goal-option${form.fitnessGoal === g.id ? ' profile-form__goal-option--active' : ''}`}
                onClick={() => setForm({ ...form, fitnessGoal: g.id })}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
