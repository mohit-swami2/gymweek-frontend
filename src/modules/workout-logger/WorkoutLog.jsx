import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Dumbbell, Play } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { ExerciseMedia, getExerciseMediaUrls } from './ExerciseMedia.jsx';
import './workout-log.css';

function muscleLabel(ex) {
  const mg = ex?.muscleGroup?.name || ex?.muscleGroupData?.name || ex?.muscleGroup?.slug;
  return mg ? String(mg) : 'General';
}

function exerciseProgress(setLogs) {
  const total = setLogs?.length || 0;
  const done = (setLogs || []).filter((s) => s.completed).length;
  return { total, done, complete: total > 0 && done === total };
}

export function WorkoutLog() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(location.state?.session || null);
  const [dayFocus, setDayFocus] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const timerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (!session) {
      fitnessApi.getTodaySession().then((res) => {
        if (res.data[0]) setSession(res.data[0]);
      });
    }
  }, [session]);

  useEffect(() => {
    if (!session?.dayOfWeek) return;
    fitnessApi.getCurrentPlan().then((res) => {
      const plan = res.data[0];
      const day = plan?.days?.find((d) => d.dayOfWeek === session.dayOfWeek);
      setDayFocus(day?.focus || '');
    }).catch(() => {});
  }, [session?.dayOfWeek]);

  useEffect(() => {
    fitnessApi.getTodaySessionSummary().then((res) => {
      setSessionSummary(res.data[0]);
    }).catch(() => {});
  }, [session?.status, session?.sessionNumber]);

  useEffect(() => {
    if (session?.status === 'inProgress') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session?.status]);

  const logs = session?.exerciseLogs || [];

  const activeExIndex = useMemo(() => {
    const idx = logs.findIndex((ex) => !exerciseProgress(ex.setLogs).complete);
    return idx === -1 ? Math.max(0, logs.length - 1) : idx;
  }, [logs]);

  const activeExercise = logs[activeExIndex]?.exerciseId;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeExIndex]);

  const progress = useMemo(() => {
    let total = 0;
    let done = 0;
    logs.forEach((ex) => {
      (ex.setLogs || []).forEach((s) => {
        total += 1;
        if (s.completed) done += 1;
      });
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [logs]);

  const totalVolume = logs.reduce((sum, ex) =>
    sum + ex.setLogs.filter((s) => s.completed).reduce((s, set) => s + (set.actualWeight || 0) * (set.actualReps || 0), 0), 0);

  const toggleSet = async (exIndex, setIndex) => {
    const exerciseLogs = [...session.exerciseLogs];
    const set = { ...exerciseLogs[exIndex].setLogs[setIndex] };
    set.completed = !set.completed;
    if (set.completed && !set.actualWeight) set.actualWeight = set.targetWeight;
    if (set.completed && !set.actualReps) set.actualReps = set.targetReps;
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
      const summaryRes = await fitnessApi.getTodaySessionSummary();
      setSessionSummary(summaryRes.data[0]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinishing(false);
    }
  };

  const handleStartNextSession = async () => {
    try {
      const planRes = await fitnessApi.getCurrentPlan();
      const plan = planRes.data[0];
      const dayOfWeek = session?.dayOfWeek;
      const res = await fitnessApi.startSession({ planId: plan?._id, dayOfWeek });
      setSession(res.data[0]);
      setElapsed(0);
      const summaryRes = await fitnessApi.getTodaySessionSummary();
      setSessionSummary(summaryRes.data[0]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!session) {
    return (
      <div className="workout-log">
        <div className="workout-log__empty card">
          <Dumbbell size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>No active workout session.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (session.status === 'completed') {
    const nextNum = sessionSummary?.nextSessionNumber || (session.sessionNumber || 1) + 1;
    return (
      <div className="workout-log">
        <div className="workout-log__complete card">
          <h2>WORKOUT COMPLETE</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Session {session.sessionNumber || 1} · Volume: {session.totalVolume?.toLocaleString()} kg · {session.durationMinutes} min
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button type="button" className="btn-primary" onClick={handleStartNextSession} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Play size={14} /> Session {nextNum}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-log">
      <div className="workout-log__hero">
        <div>
          <span className="workout-log__session-badge">SESSION {session.sessionNumber || 1}</span>
          <h1 className="workout-log__title">{dayFocus || 'Today\'s Workout'}</h1>
          <p className="workout-log__subtitle">Tap each set when completed — demo updates as you progress</p>
        </div>
        <div className="workout-log__timer">
          <div className="workout-log__timer-value">
            {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
          </div>
          <div className="workout-log__timer-meta">{totalVolume.toLocaleString()} kg logged</div>
        </div>
      </div>

      <div className="workout-log__progress">
        <div className="workout-log__progress-label">
          <span>Progress</span>
          <span>{progress.done} / {progress.total} sets</span>
        </div>
        <div className="workout-log__progress-bar">
          <div className="workout-log__progress-fill" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>

      {activeExercise && (
        <div className="workout-log__now card">
          <div className="workout-log__now-label">Up now</div>
          <div className="workout-log__now-body">
            <ExerciseMedia exercise={activeExercise} alt={activeExercise.name} variant="hero" />
            <div className="workout-log__now-meta">
              <h2>{activeExercise.name}</h2>
              <span className="workout-log__muscle-tag">{muscleLabel(activeExercise)}</span>
              {getExerciseMediaUrls(activeExercise).length > 1 && (
                <p className="workout-log__frame-hint">
                  {getExerciseMediaUrls(activeExercise).length} demo frames · auto-cycling
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {logs.map((ex, exIndex) => {
        const exercise = ex.exerciseId;
        const name = exercise?.name || `Exercise ${exIndex + 1}`;
        const { done, total, complete } = exerciseProgress(ex.setLogs);
        const isActive = exIndex === activeExIndex;
        const hasMedia = getExerciseMediaUrls(exercise).length > 0;

        return (
          <div
            key={exIndex}
            ref={isActive ? activeRef : null}
            className={`workout-log__exercise${isActive ? ' workout-log__exercise--active' : ''}${complete ? ' workout-log__exercise--done' : ''}`}
          >
            <div className="workout-log__exercise-head">
              {hasMedia && !isActive && (
                <ExerciseMedia exercise={exercise} alt={name} variant="thumb" autoPlay={false} />
              )}
              <div className="workout-log__exercise-head-text">
                <div className="workout-log__exercise-name">{name}</div>
                <div className="workout-log__exercise-meta">
                  <span className="workout-log__muscle-tag">{muscleLabel(exercise)}</span>
                  <span className="workout-log__set-count">{done}/{total} sets</span>
                </div>
              </div>
            </div>
            {(ex.setLogs || []).map((set, setIndex) => (
              <button
                key={setIndex}
                type="button"
                className={`workout-log__set${set.completed ? ' workout-log__set--done' : ''}`}
                onClick={() => toggleSet(exIndex, setIndex)}
              >
                <div className="workout-log__set-target">
                  <strong>Set {set.setIndex}</strong>
                  <span>Target: {set.targetWeight ?? 0} kg × {set.targetReps ?? 0} reps</span>
                </div>
                <span className="workout-log__set-check">
                  {set.completed && <Check size={18} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
        );
      })}

      <button type="button" className="btn-primary workout-log__finish" onClick={handleFinish} disabled={finishing}>
        {finishing ? 'Finishing...' : 'Finish Workout'}
      </button>
    </div>
  );
}
