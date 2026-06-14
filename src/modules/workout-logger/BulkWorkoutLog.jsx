import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, SkipForward, Copy, Save, ChevronDown, ChevronUp, MessageSquare, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { ComparisonPanel } from './ComparisonPanel.jsx';
import './bulk-log.css';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function dayKeyForDate(d = new Date()) {
  const idx = d.getDay();
  return DAY_KEYS[idx === 0 ? 6 : idx - 1];
}

export function BulkWorkoutLog({ session: initialSession, onSessionChange }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [comparison, setComparison] = useState(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [workoutNote, setWorkoutNote] = useState(initialSession?.overallNote || '');
  const [expandedEx, setExpandedEx] = useState(0);
  const [mood, setMood] = useState('good');

  useEffect(() => {
    if (initialSession) setSession(initialSession);
  }, [initialSession]);

  const persist = useCallback(async (nextSession, note = workoutNote) => {
    setSaving(true);
    try {
      const res = await fitnessApi.logSession(nextSession._id, {
        exerciseLogs: nextSession.exerciseLogs,
        overallNote: note,
        mood,
      });
      const updated = res.data[0];
      setSession(updated);
      onSessionChange?.(updated);
      return updated;
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [workoutNote, mood, onSessionChange]);

  const updateSet = (exIndex, setIndex, field, value) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    exerciseLogs[exIndex].setLogs[setIndex] = {
      ...exerciseLogs[exIndex].setLogs[setIndex],
      [field]: value,
    };
    setSession({ ...session, exerciseLogs });
  };

  const completeAllSets = (exIndex) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    exerciseLogs[exIndex].skipped = false;
    exerciseLogs[exIndex].setLogs = exerciseLogs[exIndex].setLogs.map((s) => ({
      ...s,
      completed: true,
      skipped: false,
      actualWeight: s.actualWeight ?? s.targetWeight ?? 0,
      actualReps: s.actualReps ?? s.targetReps ?? 0,
    }));
    const next = { ...session, exerciseLogs };
    setSession(next);
    persist(next);
  };

  const skipExercise = (exIndex) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    exerciseLogs[exIndex].skipped = true;
    exerciseLogs[exIndex].setLogs = exerciseLogs[exIndex].setLogs.map((s) => ({
      ...s,
      completed: false,
      skipped: true,
    }));
    const next = { ...session, exerciseLogs };
    setSession(next);
    persist(next);
  };

  const toggleSetComplete = (exIndex, setIndex) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    const set = exerciseLogs[exIndex].setLogs[setIndex];
    set.completed = !set.completed;
    set.skipped = false;
    if (set.completed) {
      set.actualWeight = set.actualWeight ?? set.targetWeight ?? 0;
      set.actualReps = set.actualReps ?? set.targetReps ?? 0;
    }
    exerciseLogs[exIndex].skipped = false;
    const next = { ...session, exerciseLogs };
    setSession(next);
    persist(next);
  };

  const skipSet = (exIndex, setIndex) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    const set = exerciseLogs[exIndex].setLogs[setIndex];
    set.skipped = true;
    set.completed = false;
    const next = { ...session, exerciseLogs };
    setSession(next);
    persist(next);
  };

  const updateExerciseNote = (exIndex, note) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    exerciseLogs[exIndex].note = note;
    setSession({ ...session, exerciseLogs });
  };

  const updateSetNote = (exIndex, setIndex, note) => {
    const exerciseLogs = JSON.parse(JSON.stringify(session.exerciseLogs));
    exerciseLogs[exIndex].setLogs[setIndex].note = note;
    setSession({ ...session, exerciseLogs });
  };

  const handleSaveDraft = async () => {
    await persist(session, workoutNote);
    toast.success('Progress saved — come back anytime');
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await fitnessApi.logSession(session._id, { exerciseLogs: session.exerciseLogs, overallNote: workoutNote, mood });
      const res = await fitnessApi.finishSession(session._id, { overallNote: workoutNote, mood });
      const result = res.data[0];
      if (result.newPRs?.length) toast.success(`New PR! ${result.newPRs.length} record(s)`);
      if (result.badgesEarned?.length) toast.success(`Badge: ${result.badgesEarned.map((b) => b.name).join(', ')}`);
      setComparison(result.comparison);
      setSession(result.session);
      toast.success('Workout logged successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinishing(false);
    }
  };

  if (!session) return null;

  if (session.status === 'completed' && comparison) {
    return (
      <div className="bulk-log">
        <ComparisonPanel comparison={comparison} />
        <div className="bulk-log__actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/history')}>View History</button>
          <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>
      </div>
    );
  }

  const logs = session.exerciseLogs || [];

  return (
    <div className="bulk-log">
      <header className="bulk-log__header">
        <div>
          <span className="bulk-log__badge">POST-WORKOUT LOG</span>
          <h1>{session.dayOfWeek?.toUpperCase()} WORKOUT</h1>
          <p>Log what you actually did at the gym — no phone needed during training</p>
        </div>
        <div className="bulk-log__header-actions">
          <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
      </header>

      <div className="bulk-log__workout-note card">
        <label><MessageSquare size={14} /> Workout note</label>
        <textarea
          value={workoutNote}
          onChange={(e) => setWorkoutNote(e.target.value)}
          placeholder="e.g. Energy was low today…"
          rows={2}
        />
      </div>

      {logs.map((ex, exIndex) => {
        const name = ex.exerciseId?.name || `Exercise ${exIndex + 1}`;
        const open = expandedEx === exIndex;
        const skipped = ex.skipped;

        return (
          <motion.div
            key={exIndex}
            className={`bulk-log__exercise card${skipped ? ' bulk-log__exercise--skipped' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button type="button" className="bulk-log__exercise-toggle" onClick={() => setExpandedEx(open ? -1 : exIndex)}>
              <div>
                <strong>{name}</strong>
                <span>{ex.setLogs?.length || 0} planned sets</span>
              </div>
              {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {open && (
              <div className="bulk-log__exercise-body">
                <div className="bulk-log__quick-actions">
                  <button type="button" className="btn-primary btn-sm" onClick={() => completeAllSets(exIndex)}>
                    <Check size={14} /> Complete all as planned
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => skipExercise(exIndex)}>
                    <SkipForward size={14} /> Skip exercise
                  </button>
                </div>

                <label className="bulk-log__note-label">Exercise note</label>
                <input
                  type="text"
                  value={ex.note || ''}
                  onChange={(e) => updateExerciseNote(exIndex, e.target.value)}
                  onBlur={() => persist(session)}
                  placeholder="e.g. Shoulder pain started here"
                />

                {(ex.setLogs || []).map((set, setIndex) => (
                  <div key={setIndex} className={`bulk-log__set${set.skipped ? ' bulk-log__set--skipped' : ''}${set.completed ? ' bulk-log__set--done' : ''}`}>
                    <div className="bulk-log__set-head">
                      <strong>Set {set.setIndex}</strong>
                      <span className="bulk-log__planned">
                        Planned: {set.targetWeight ?? 0}kg × {set.targetReps ?? 0}
                      </span>
                    </div>
                    <div className="bulk-log__set-inputs">
                      <label>
                        Weight (kg)
                        <input
                          type="number"
                          min="0"
                          value={set.actualWeight ?? ''}
                          onChange={(e) => updateSet(exIndex, setIndex, 'actualWeight', Number(e.target.value))}
                          onBlur={() => persist(session)}
                          disabled={set.skipped}
                        />
                      </label>
                      <label>
                        Reps
                        <input
                          type="number"
                          min="0"
                          value={set.actualReps ?? ''}
                          onChange={(e) => updateSet(exIndex, setIndex, 'actualReps', Number(e.target.value))}
                          onBlur={() => persist(session)}
                          disabled={set.skipped}
                        />
                      </label>
                    </div>
                    <input
                      className="bulk-log__set-note"
                      type="text"
                      value={set.note || ''}
                      placeholder="Set note…"
                      onChange={(e) => updateSetNote(exIndex, setIndex, e.target.value)}
                      onBlur={() => persist(session)}
                    />
                    <div className="bulk-log__set-actions">
                      <button type="button" className={set.completed ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => toggleSetComplete(exIndex, setIndex)}>
                        {set.completed ? 'Completed' : 'Mark done'}
                      </button>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => skipSet(exIndex, setIndex)}>Skip set</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}

      <div className="bulk-log__mood card">
        <label>How did it feel?</label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          {['terrible', 'bad', 'ok', 'good', 'great'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <button type="button" className="btn-primary bulk-log__finish" onClick={handleFinish} disabled={finishing}>
        <BarChart3 size={16} /> {finishing ? 'Saving workout…' : 'Save & Compare Planned vs Actual'}
      </button>
    </div>
  );
}

export { dayKeyForDate, DAY_KEYS };
