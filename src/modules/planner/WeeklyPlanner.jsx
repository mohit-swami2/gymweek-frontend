import { useEffect, useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export function WeeklyPlanner() {
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fitnessApi.getCurrentPlan(),
      fitnessApi.getExercises({ limit: 50 }),
    ]).then(([planRes, exRes]) => {
      setPlan(planRes.data[0]);
      setExercises(exRes.data);
    }).catch((err) => toast.error(err.message));
  }, []);

  const updateDay = (dayIndex, updates) => {
    const days = [...plan.days];
    days[dayIndex] = { ...days[dayIndex], ...updates };
    setPlan({ ...plan, days });
  };

  const addExercise = (dayIndex, exerciseId) => {
    const ex = exercises.find((e) => e._id === exerciseId);
    if (!ex) return;
    const days = [...plan.days];
    const day = { ...days[dayIndex] };
    day.plannedExercises = [...(day.plannedExercises || []), {
      exerciseId: ex._id,
      orderIndex: (day.plannedExercises?.length || 0),
      restSeconds: 90,
      sets: [{ setIndex: 1, setType: 'normal', targetWeight: 0, targetReps: 10 }],
    }];
    day.isRestDay = false;
    days[dayIndex] = day;
    setPlan({ ...plan, days });
  };

  const removeExercise = (dayIndex, exIndex) => {
    const days = [...plan.days];
    days[dayIndex].plannedExercises = days[dayIndex].plannedExercises.filter((_, i) => i !== exIndex);
    setPlan({ ...plan, days });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.updatePlan(plan._id, { days: plan.days });
      setPlan(res.data[0]);
      toast.success('Plan saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!plan) return <div style={{ padding: '24px' }}>Loading planner...</div>;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem' }}>Weekly Planner</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{plan.weekLabel}</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {plan.days.map((day, dayIndex) => (
          <div key={day.dayOfWeek} className="card" style={{ minHeight: '180px', padding: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              {DAY_LABELS[day.dayOfWeek]}
            </div>
            <input
              placeholder="Focus (e.g. Push Day)"
              value={day.focus || ''}
              onChange={(e) => updateDay(dayIndex, { focus: e.target.value })}
              style={{ fontSize: '0.8rem', marginBottom: '8px', padding: '6px 8px' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              <input type="checkbox" checked={day.isRestDay} onChange={(e) => updateDay(dayIndex, { isRestDay: e.target.checked })} />
              Rest day
            </label>
            {!day.isRestDay && (day.plannedExercises || []).map((pe, exIndex) => (
              <div key={exIndex} style={{
                background: 'var(--color-background)', border: '1px solid var(--color-primary)',
                borderRadius: '8px', padding: '8px', marginBottom: '6px', fontSize: '0.75rem', position: 'relative',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)', paddingRight: '20px' }}>
                  {exercises.find((e) => e._id === pe.exerciseId || e._id === pe.exerciseId?._id)?.name || 'Exercise'}
                </div>
                <button type="button" onClick={() => removeExercise(dayIndex, exIndex)} style={{
                  position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
                }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {!day.isRestDay && (
              <select onChange={(e) => { if (e.target.value) { addExercise(dayIndex, e.target.value); e.target.value = ''; } }} style={{ fontSize: '0.75rem', padding: '6px', marginTop: '4px' }}>
                <option value="">+ Add exercise</option>
                {exercises.map((ex) => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
