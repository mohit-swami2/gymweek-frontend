import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Dumbbell, Play, CheckCircle2, History } from 'lucide-react';
import { WorkoutLogSkeleton } from './WorkoutLogSkeleton.jsx';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { ExerciseMedia, getExerciseMediaUrls } from './ExerciseMedia.jsx';
import { DAY_KEYS } from './BulkWorkoutLog.jsx';
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

export function LiveWorkoutLog({ plan: planProp, onRequestWeekSelect }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(location.state?.session || null);
  const [plan, setPlan] = useState(planProp);
  const [sessionLoading, setSessionLoading] = useState(!location.state?.session);
  const [dayFocus, setDayFocus] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const timerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (planProp) setPlan(planProp);
  }, [planProp]);

  useEffect(() => {
    if (location.state?.session) setSession(location.state.session);
  }, [location.state?.session]);

  useEffect(() => {
    if (session) {
      setSessionLoading(false);
      return undefined;
    }
    setSessionLoading(true);
    fitnessApi.getTodaySession()
      .then((res) => { if (res.data[0]) setSession(res.data[0]); })
      .finally(() => setSessionLoading(false));
    return undefined;
  }, [session]);

  useEffect(() => {
    if (!session?.dayOfWeek || !plan) return;
    const day = plan.days?.find((d) => d.dayOfWeek === session.dayOfWeek);
    setDayFocus(day?.focus || '');
  }, [session?.dayOfWeek, plan]);

  useEffect(() => {
    setSummaryLoading(true);
    fitnessApi.getTodaySessionSummary()
      .then((res) => { setSessionSummary(res.data[0]); })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
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
    // Immutably update nested logs — avoid mutating React state in place.
    const exerciseLogs = session.exerciseLogs.map((ex, i) => {
      if (i !== exIndex) return ex;
      const setLogs = (ex.setLogs || []).map((s, j) => {
        if (j !== setIndex) return s;
        const next = { ...s, completed: !s.completed };
        if (next.completed && !next.actualWeight) next.actualWeight = next.targetWeight;
        if (next.completed && !next.actualReps) next.actualReps = next.targetReps;
        return next;
      });
      return { ...ex, setLogs };
    });
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

  const handleStartSession = async () => {
    if (!plan?._id) {
      onRequestWeekSelect?.();
      return;
    }
    try {
      const today = new Date();
      const dayIndex = today.getDay();
      const dayOfWeek = DAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];
      const res = await fitnessApi.startSession({ planId: plan._id, dayOfWeek });
      setSession(res.data[0]);
      setElapsed(0);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStartNextSession = async () => {
    try {
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

  if (sessionLoading || summaryLoading) {
    return <WorkoutLogSkeleton />;
  }

  if (!session) {
    const todayKey = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayPlan = plan?.days?.find((d) => d.dayOfWeek === todayKey);
    const todayCompleted = sessionSummary?.sessions?.find(
      (s) => s.status === 'completed' && s.dayOfWeek === todayKey,
    );
    const canStartToday = todayPlan && !todayPlan.isRestDay && todayPlan.plannedExercises?.length && !todayCompleted;

    if (todayCompleted) {
      return (
        <div className="workout-log-panel">
          <motion.div className="workout-log__empty card workout-log__empty--session workout-log__empty--done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CheckCircle2 class='make-it-mid' size={48} color="var(--color-primary)" />
            <h2 style={{textAlign: 'center'}}>Today&apos;s workout done</h2>
            <p style={{textAlign: 'center'}}>
              You already logged {todayCompleted.dayOfWeek}&apos;s session
              {todayCompleted.totalVolume ? ` · ${todayCompleted.totalVolume.toLocaleString()} kg` : ''}.
              Live tracking isn&apos;t needed unless you want another session.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/history')}>
                <History size={14} /> View history
              </button>
              <button type="button" className="btn-secondary" onClick={onRequestWeekSelect}>
                <Play size={14} /> Different day
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="workout-log-panel">
        <motion.div className="workout-log__empty card workout-log__empty--session" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dumbbell size={48} color="var(--color-primary)" />
          <h2>Live tracking</h2>
          <p>
            {canStartToday
              ? `Start ${todayPlan.focus || 'today\'s'} workout with timer`
              : 'Pick a configured week and workout day to start live tracking.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {canStartToday && (
              <button type="button" className="btn-primary" onClick={handleStartSession}>
                <Play size={14} /> Start Today
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onRequestWeekSelect}>
              <Play size={14} /> Select Week & Day
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (session.status === 'completed') {
    const nextNum = sessionSummary?.nextSessionNumber || (session.sessionNumber || 1) + 1;
    return (
      <div className="workout-log-panel">
        <div className="workout-log__complete card">
          <h2>WORKOUT COMPLETE</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Session {session.sessionNumber || 1} · {session.totalVolume?.toLocaleString()} kg · {session.durationMinutes} min
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button type="button" className="btn-primary" onClick={handleStartNextSession}>
              <Play size={14} /> Session {nextNum}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-log-panel">
      <div className="workout-log__hero">
        <div>
          <span className="workout-log__session-badge">LIVE · SESSION {session.sessionNumber || 1}</span>
          <h1 className="workout-log__title">{dayFocus || 'Today\'s Workout'}</h1>
          <p className="workout-log__subtitle">Tap each set when completed</p>
        </div>
        <div className="workout-log__timer">
          <div className="workout-log__timer-value">
            {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
          </div>
          <div className="workout-log__timer-meta">{totalVolume.toLocaleString()} kg</div>
        </div>
      </div>

      <div className="workout-log__progress">
        <div className="workout-log__progress-label"><span>Progress</span><span>{progress.done} / {progress.total}</span></div>
        <div className="workout-log__progress-bar"><div className="workout-log__progress-fill" style={{ width: `${progress.pct}%` }} /></div>
      </div>

      {activeExercise && (
        <div className="workout-log__now card">
          <div className="workout-log__now-label">Up now</div>
          <div className="workout-log__now-body">
            <ExerciseMedia exercise={activeExercise} alt={activeExercise.name} variant="hero" />
            <div className="workout-log__now-meta">
              <h2>{activeExercise.name}</h2>
              <span className="workout-log__muscle-tag">{muscleLabel(activeExercise)}</span>
            </div>
          </div>
        </div>
      )}

      {logs.map((ex, exIndex) => {
        const exercise = ex.exerciseId;
        const name = exercise?.name || `Exercise ${exIndex + 1}`;
        const { done, total, complete } = exerciseProgress(ex.setLogs);
        const isActive = exIndex === activeExIndex;
        return (
          <div key={exIndex} ref={isActive ? activeRef : null} className={`workout-log__exercise${isActive ? ' workout-log__exercise--active' : ''}${complete ? ' workout-log__exercise--done' : ''}`}>
            <div className="workout-log__exercise-head">
              <div className="workout-log__exercise-head-text">
                <div className="workout-log__exercise-name">{name}</div>
                <span className="workout-log__set-count">{done}/{total} sets</span>
              </div>
            </div>
            {(ex.setLogs || []).map((set, setIndex) => (
              <button key={setIndex} type="button" className={`workout-log__set${set.completed ? ' workout-log__set--done' : ''}`} onClick={() => toggleSet(exIndex, setIndex)}>
                <div className="workout-log__set-target">
                  <strong>Set {set.setIndex}</strong>
                  <span>{set.targetWeight ?? 0} kg × {set.targetReps ?? 0}</span>
                </div>
                <span className="workout-log__set-check">{set.completed && <Check size={18} strokeWidth={3} />}</span>
              </button>
            ))}
          </div>
        );
      })}

      <button type="button" className="btn-primary workout-log__finish" onClick={handleFinish} disabled={finishing}>
        {finishing ? 'Finishing…' : 'Finish Workout'}
      </button>
    </div>
  );
}
