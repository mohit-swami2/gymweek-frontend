import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';

export function WorkoutLog() {
  const location = useLocation();
  const [session, setSession] = useState(location.state?.session || null);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!session) {
      fitnessApi.getTodaySession().then((res) => {
        if (res.data[0]) setSession(res.data[0]);
      });
    }
  }, [session]);

  useEffect(() => {
    if (session?.status === 'inProgress') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session?.status]);

  const toggleSet = async (exIndex, setIndex) => {
    const exerciseLogs = [...session.exerciseLogs];
    const set = { ...exerciseLogs[exIndex].setLogs[setIndex] };
    set.completed = !set.completed;
    exerciseLogs[exIndex].setLogs[setIndex] = set;
    const updated = { ...session, exerciseLogs };
    setSession(updated);
    try {
      const res = await fitnessApi.logSession(session._id, { exerciseLogs });
      setSession(res.data[0]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateSet = async (exIndex, setIndex, field, value) => {
    const exerciseLogs = [...session.exerciseLogs];
    exerciseLogs[exIndex].setLogs[setIndex] = { ...exerciseLogs[exIndex].setLogs[setIndex], [field]: +value };
    setSession({ ...session, exerciseLogs });
  };

  const saveSets = async () => {
    try {
      const res = await fitnessApi.logSession(session._id, { exerciseLogs: session.exerciseLogs });
      setSession(res.data[0]);
      toast.success('Sets saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await fitnessApi.logSession(session._id, { exerciseLogs: session.exerciseLogs });
      const res = await fitnessApi.finishSession(session._id, { mood: 'good' });
      const result = res.data[0];
      if (result.newPRs?.length) toast.success(`New PR! ${result.newPRs.length} record(s) broken!`);
      if (result.badgesEarned?.length) toast.success(`Badge earned: ${result.badgesEarned.map((b) => b.name).join(', ')}`);
      toast.success('Workout complete!');
      setSession(result.session);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinishing(false);
    }
  };

  const totalVolume = (session?.exerciseLogs || []).reduce((sum, ex) =>
    sum + ex.setLogs.filter((s) => s.completed).reduce((s, set) => s + (set.actualWeight || 0) * (set.actualReps || 0), 0), 0);

  if (!session) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>No active workout session.</p>
        <p style={{ fontSize: '0.9rem' }}>Go to Dashboard and tap Start Workout.</p>
      </div>
    );
  }

  if (session.status === 'completed') {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>WORKOUT COMPLETE</h2>
        <p style={{ marginTop: '12px', color: 'var(--color-text-muted)' }}>
          Volume: {session.totalVolume?.toLocaleString()} kg · Duration: {session.durationMinutes} min
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem' }}>Workout Log</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Live session</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.5rem', color: 'var(--color-primary)' }}>
            {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Volume: {totalVolume.toLocaleString()} kg</div>
        </div>
      </div>

      {(session.exerciseLogs || []).map((ex, exIndex) => (
        <div key={exIndex} className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, marginBottom: '16px' }}>
            {ex.exerciseId?.name || `Exercise ${exIndex + 1}`}
          </div>
          {(ex.setLogs || []).map((set, setIndex) => (
            <div key={setIndex} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 40px', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Set {set.setIndex}</span>
              <input type="number" value={set.actualWeight ?? set.targetWeight ?? ''} onChange={(e) => updateSet(exIndex, setIndex, 'actualWeight', e.target.value)} onBlur={saveSets} />
              <input type="number" value={set.actualReps ?? set.targetReps ?? ''} onChange={(e) => updateSet(exIndex, setIndex, 'actualReps', e.target.value)} onBlur={saveSets} />
              <button type="button" onClick={() => toggleSet(exIndex, setIndex)} style={{
                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                background: set.completed ? 'var(--color-primary)' : 'var(--color-background)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={16} color={set.completed ? '#080808' : 'var(--color-text-muted)'} />
              </button>
            </div>
          ))}
        </div>
      ))}

      <button type="button" className="btn-primary" onClick={handleFinish} disabled={finishing} style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
        {finishing ? 'Finishing...' : 'Finish Workout'}
      </button>
    </div>
  );
}
