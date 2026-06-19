import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, SkipForward, Save, BarChart3, Pencil, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { ComparisonPanel } from './ComparisonPanel.jsx';
import {
  buildExerciseLogsFromSimple,
  deriveSimpleEntries,
  plannedSummary,
} from './bulkLogState.js';
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
  const [mood, setMood] = useState(initialSession?.mood || 'good');
  const [entries, setEntries] = useState(() => deriveSimpleEntries(initialSession?.exerciseLogs));

  const isEditing = session?.status === 'completed' && !comparison;

  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setWorkoutNote(initialSession.overallNote || '');
      setMood(initialSession.mood || 'good');
      setEntries(deriveSimpleEntries(initialSession.exerciseLogs));
    }
  }, [initialSession]);

  const buildPayload = () => ({
    exerciseLogs: buildExerciseLogsFromSimple(session.exerciseLogs, entries),
    overallNote: workoutNote,
    mood,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.logSession(session._id, buildPayload());
      const updated = res.data[0];
      setSession(updated);
      onSessionChange?.(updated);
      toast.success('Progress saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await fitnessApi.logSession(session._id, buildPayload());
      const res = await fitnessApi.finishSession(session._id, { overallNote: workoutNote, mood });
      const result = res.data[0];
      if (result.newPRs?.length) toast.success(`New PR! ${result.newPRs.length} record(s)`);
      if (result.badgesEarned?.length) toast.success(`Badge: ${result.badgesEarned.map((b) => b.name).join(', ')}`);
      setComparison(result.comparison);
      setSession(result.session);
      onSessionChange?.(result.session);
      toast.success(isEditing ? 'Workout updated' : 'Workout logged');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinishing(false);
    }
  };

  const updateEntry = (index, patch) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const markAllAsPlanned = () => {
    setEntries((prev) => prev.map((e) => (
      e.skipped
        ? e
        : { doneAsPlanned: true, adherencePercent: 100, note: e.note, skipped: false }
    )));
  };

  const completedCount = useMemo(
    () => entries.filter((e) => !e.skipped && (e.doneAsPlanned || e.adherencePercent > 0)).length,
    [entries]
  );

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
          <span className="bulk-log__badge">{isEditing ? 'EDIT LOG' : 'POST-WORKOUT LOG'}</span>
          <h1>{session.dayOfWeek?.toUpperCase()} WORKOUT</h1>
          <p>
            {isEditing
              ? 'Update this workout — changes replace your previous log'
              : 'Check off exercises as planned, or note what was different'}
          </p>
        </div>
        <div className="bulk-log__header-actions">
          <button type="button" className="btn-secondary btn-sm" onClick={markAllAsPlanned}>
            <Check size={14} /> All as planned
          </button>
          <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {isEditing && (
        <div className="bulk-log__edit-banner card">
          <Pencil size={16} />
          <span>Already logged — you&apos;re editing this session</span>
        </div>
      )}

      <div className="bulk-log__progress card">
        <strong>{completedCount}</strong>
        <span> of {logs.length} exercises marked</span>
      </div>

      <div className="bulk-log__workout-note card">
        <label>Workout note (optional)</label>
        <textarea
          value={workoutNote}
          onChange={(e) => setWorkoutNote(e.target.value)}
          placeholder="How did the session feel overall?"
          rows={2}
        />
      </div>

      <div className="bulk-log__simple-list">
        {logs.map((ex, exIndex) => {
          const name = ex.exerciseId?.name || `Exercise ${exIndex + 1}`;
          const entry = entries[exIndex] || { doneAsPlanned: true, adherencePercent: 100, note: '', skipped: false };

          return (
            <motion.div
              key={ex.exerciseId?._id || exIndex}
              className={`bulk-log__simple card${entry.skipped ? ' bulk-log__simple--skipped' : ''}${entry.doneAsPlanned && !entry.skipped ? ' bulk-log__simple--done' : ''}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exIndex * 0.02 }}
            >
              <div className="bulk-log__simple-head">
                <div>
                  <strong>{name}</strong>
                  <span>{plannedSummary(ex)}</span>
                </div>
                {entry.skipped ? (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => updateEntry(exIndex, { skipped: false, doneAsPlanned: true, adherencePercent: 100 })}
                  >
                    <RotateCcw size={14} /> Undo skip
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => updateEntry(exIndex, { skipped: true, doneAsPlanned: false, adherencePercent: 0 })}
                  >
                    <SkipForward size={14} /> Skip
                  </button>
                )}
              </div>

              {!entry.skipped && (
                <div className="bulk-log__simple-body">
                  <label className="bulk-log__check-row">
                    <input
                      type="checkbox"
                      checked={entry.doneAsPlanned}
                      onChange={(e) => updateEntry(exIndex, {
                        doneAsPlanned: e.target.checked,
                        adherencePercent: e.target.checked ? 100 : (entry.adherencePercent || 80),
                      })}
                    />
                    <span>Completed as planned</span>
                  </label>

                  {!entry.doneAsPlanned && (
                    <div className="bulk-log__simple-variance">
                      <label>
                        % completed
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={entry.adherencePercent}
                          onChange={(e) => updateEntry(exIndex, { adherencePercent: Number(e.target.value) })}
                        />
                      </label>
                      <label>
                        Note
                        <input
                          type="text"
                          value={entry.note}
                          placeholder="e.g. Dropped weight on last 2 sets"
                          onChange={(e) => updateEntry(exIndex, { note: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="bulk-log__mood card">
        <label>How did it feel?</label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          {['terrible', 'bad', 'ok', 'good', 'great'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <button type="button" className="btn-primary bulk-log__finish" onClick={handleFinish} disabled={finishing}>
        <BarChart3 size={16} />
        {finishing ? 'Saving…' : isEditing ? 'Update Workout' : 'Save Workout'}
      </button>
    </div>
  );
}

export { dayKeyForDate, DAY_KEYS };
