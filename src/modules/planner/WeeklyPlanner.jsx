import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, ArrowLeft, ChevronRight, Plus, Calendar, Sparkles, Trash2, Pencil, ChevronUp, ChevronDown, Copy, Bookmark, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { Modal } from '../../common/components/Modal.jsx';
import { CelebrationModal } from '../../common/components/CelebrationModal.jsx';
import {
  getMondayOfWeek,
  getWeekStartByOffset,
  formatWeekRange,
  getDayStatus,
  isCurrentWeek,
  MAX_WEEK_OFFSET,
  DAY_KEYS,
} from '../../common/utils/dateUtils.js';
import {
  SPLIT_OPTIONS,
  DAY_LABELS,
  getSplitLabel,
  filterExercisesForDay,
  autoPopulateDayExercises,
  enrichTemplateDays,
  hydrateDayMuscles,
  buildDayFocus,
  getPlannerMuscles,
} from './splitTemplates.js';
import { DayMusclePicker } from './DayMusclePicker.jsx';
import { ConfigureWeekHeader } from './ConfigureWeekHeader.jsx';
import { ExercisePickerModal } from './ExercisePickerModal.jsx';
import { ExerciseMedia } from '../workout-logger/ExerciseMedia.jsx';
import { PlannerSkeleton } from './PlannerSkeleton.jsx';
import { PlanPreviewModal } from './PlanPreviewModal.jsx';
import '../workout-logger/workout-log.css';
import './planner.css';

function countTrainingDays(plan) {
  return plan?.days?.filter((d) => !d.isRestDay && d.plannedExercises?.length > 0).length || 0;
}

const STEP_MOTION = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export function WeeklyPlanner() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('list');
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [draftDays, setDraftDays] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveQuote, setSaveQuote] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [pickerDayIndex, setPickerDayIndex] = useState(null);
  const [activePlanDay, setActivePlanDay] = useState(0);
  const [hoverWeekOffset, setHoverWeekOffset] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);

  const loadPlansList = useCallback(() => {
    return fitnessApi.getPlans({ limit: 100 }).then((res) => setPlansList(res.data || []));
  }, []);

  const loadExercises = useCallback(() => {
    return fitnessApi.getAllExercises({ sortBy: 'name', sortOrder: 'asc' }).then(setExercises);
  }, []);

  const loadMuscleGroups = useCallback(() => {
    return fitnessApi.getMuscleGroups().then((res) => setMuscleGroups(res.data || []));
  }, []);

  useEffect(() => {
    Promise.all([loadPlansList(), loadExercises(), loadMuscleGroups()])
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [loadPlansList, loadExercises, loadMuscleGroups]);

  useEffect(() => {
    if (!plan?.splitType || !muscleGroups.length) return;
    setPlan((p) => (p ? hydratePlanDays(p, p.splitType) : p));
  }, [muscleGroups]);

  const hydratePlanDays = (p, splitType) => ({
    ...p,
    days: (p.days || []).map((d) => hydrateDayMuscles(d, splitType || p.splitType, getPlannerMuscles(muscleGroups))),
  });

  const openPlanForWeek = async (offset, { createIfMissing = true, editing = true } = {}) => {
    setLoading(true);
    try {
      const weekStart = getWeekStartByOffset(offset).toISOString();
      const res = await fitnessApi.getPlanForWeek(weekStart, createIfMissing);
      const p = res.data[0];
      if (!p) {
        toast.error('No plan for this week. Create a new one.');
        return;
      }
      setPlan(hydratePlanDays(p, p.splitType));
      setWeekOffset(offset);
      if (p.splitType) {
        setSelectedSplit(p.splitType);
        setIsEditingExisting(editing);
        setStep('plan');
      } else {
        setIsEditingExisting(false);
        setStep('split');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, weekLabel) => {
    if (!confirm(`Delete plan for ${weekLabel}? This cannot be undone.`)) return;
    try {
      await fitnessApi.deletePlan(planId);
      toast.success('Plan deleted');
      if (plan?._id === planId) {
        setPlan(null);
        setStep('list');
      }
      loadPlansList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreatePlan = () => setShowWeekModal(true);

  const handleWeekSelect = async (offset) => {
    setShowWeekModal(false);
    setWeekOffset(offset);
    setLoading(true);
    try {
      const weekStart = getWeekStartByOffset(offset).toISOString();
      const existing = await fitnessApi.getPlanForWeek(weekStart, false);
      if (existing.data[0]?.splitType) {
        await openPlanForWeek(offset, { createIfMissing: true });
        return;
      }
      const res = await fitnessApi.getPlanForWeek(weekStart, true);
      setPlan(res.data[0]);
      setSelectedSplit(null);
      setIsEditingExisting(false);
      setStep('split');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startCustomize = (splitId) => {
    setSelectedSplit(splitId);
    setDraftDays(enrichTemplateDays(splitId, plannerMuscles));
    setStep('customize');
  };

  const patchDraftDayMuscles = (index, muscleUpdates) => {
    const days = [...draftDays];
    const merged = { ...days[index], ...muscleUpdates };
    if (!merged.isRestDay) {
      merged.focus = buildDayFocus(selectedSplit, merged, plannerMuscles);
    }
    days[index] = merged;
    setDraftDays(days);
  };

  const applySplit = async () => {
    const days = draftDays.map((d) => {
      const focus = d.isRestDay ? (d.focus || 'Rest') : buildDayFocus(selectedSplit, d, plannerMuscles);
      const day = { ...d, focus };
      if (!d.isRestDay) {
        day.plannedExercises = autoPopulateDayExercises(exercises, day, selectedSplit);
      } else {
        day.plannedExercises = [];
      }
      return day;
    });

    if (days.some((d) => !d.isRestDay && !d.focus)) {
      toast.error('Select muscles for all training days before continuing.');
      return;
    }
    if (selectedSplit === 'double_muscle' && days.some((d) => !d.isRestDay && (!d.primaryMuscle || !d.secondaryMuscle))) {
      toast.error('Select both muscles for each training day.');
      return;
    }
    if (!exercises.length) {
      toast.error('No exercises in library — contact support or re-seed fitness data.');
      return;
    }

    setSaving(true);
    try {
      const res = await fitnessApi.updatePlan(plan._id, {
        splitType: selectedSplit,
        days,
      });
      setPlan(hydratePlanDays(res.data[0], selectedSplit));
      setIsEditingExisting(false);
      setStep('plan');
      const added = days.reduce((n, d) => n + (d.plannedExercises?.length || 0), 0);
      toast.success(added ? `Split applied — ${added} exercises added to your week` : 'Split applied — add exercises from each day card');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateDraftDay = (index, updates) => {
    const days = [...draftDays];
    days[index] = { ...days[index], ...updates };
    if (updates.isRestDay) days[index].plannedExercises = [];
    setDraftDays(days);
  };

  const updateDay = (dayIndex, updates) => {
    const days = [...plan.days];
    const merged = { ...days[dayIndex], ...updates };
    if (merged.isRestDay) merged.plannedExercises = [];
    else if (plan.splitType && (updates.primaryMuscle || updates.secondaryMuscle || updates.pplFocus)) {
      merged.focus = buildDayFocus(plan.splitType, merged, plannerMuscles);
    }
    days[dayIndex] = merged;
    setPlan({ ...plan, days });
  };

  const addExercise = (dayIndex, exerciseId) => {
    const ex = exercises.find((e) => e._id === exerciseId);
    if (!ex) return;
    const days = [...plan.days];
    const day = { ...days[dayIndex] };
    day.plannedExercises = [...(day.plannedExercises || []), {
      exerciseId: ex._id,
      orderIndex: day.plannedExercises?.length || 0,
      restSeconds: 90,
      sets: [{ setIndex: 1, setType: 'normal', targetWeight: 0, targetReps: 10 }],
    }];
    day.isRestDay = false;
    days[dayIndex] = day;
    setPlan({ ...plan, days });
  };

  const removeExercise = (dayIndex, exIndex) => {
    const days = [...plan.days];
    days[dayIndex].plannedExercises = days[dayIndex].plannedExercises.filter((_, i) => i !== exIndex)
      .map((pe, i) => ({ ...pe, orderIndex: i }));
    setPlan({ ...plan, days });
  };

  const moveExercise = (dayIndex, exIndex, direction) => {
    const days = [...plan.days];
    const list = [...days[dayIndex].plannedExercises];
    const target = exIndex + direction;
    if (target < 0 || target >= list.length) return;
    [list[exIndex], list[target]] = [list[target], list[exIndex]];
    days[dayIndex].plannedExercises = list.map((pe, i) => ({ ...pe, orderIndex: i }));
    setPlan({ ...plan, days });
  };

  const duplicateDayTo = async (sourceDayOfWeek, targetDayOfWeek) => {
    try {
      const res = await fitnessApi.duplicateDay(plan._id, { sourceDayOfWeek, targetDayOfWeek });
      setPlan(res.data[0]);
      toast.success('Day duplicated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveTemplate = async () => {
    const name = window.prompt('Template name');
    if (!name?.trim()) return;
    try {
      await fitnessApi.savePlanTemplate(plan._id, name.trim());
      toast.success('Saved as weekly template');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateSet = (dayIndex, exIndex, setIndex, field, value) => {
    const days = [...plan.days];
    const sets = [...days[dayIndex].plannedExercises[exIndex].sets];
    sets[setIndex] = { ...sets[setIndex], [field]: Number(value) || 0 };
    days[dayIndex].plannedExercises[exIndex].sets = sets;
    setPlan({ ...plan, days });
  };

  const addSet = (dayIndex, exIndex) => {
    const days = [...plan.days];
    const sets = [...(days[dayIndex].plannedExercises[exIndex].sets || [])];
    sets.push({ setIndex: sets.length + 1, setType: 'normal', targetWeight: 0, targetReps: 10 });
    days[dayIndex].plannedExercises[exIndex].sets = sets;
    setPlan({ ...plan, days });
  };

  const removeSet = (dayIndex, exIndex, setIndex) => {
    const days = [...plan.days];
    const sets = days[dayIndex].plannedExercises[exIndex].sets || [];
    if (sets.length <= 1) {
      toast.error('Each exercise needs at least one set');
      return;
    }
    const next = sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setIndex: i + 1 }));
    days[dayIndex].plannedExercises[exIndex].sets = next;
    setPlan({ ...plan, days });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = isEditingExisting
        ? { days: plan.days }
        : { days: plan.days, splitType: plan.splitType };
      const res = await fitnessApi.updatePlan(plan._id, payload);
      setPlan(res.data[0]);
      await loadPlansList();
      setSaveQuote({
        text: 'A goal without a plan is just a wish. You just made yours real.',
        author: 'GymWeek',
      });
      setShowSaveModal(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const goToDashboard = () => {
    setShowSaveModal(false);
    navigate('/dashboard');
  };

  const isPartialWeek = isCurrentWeek(plan?.weekStart) && weekOffset === 0;
  const plannerMuscles = getPlannerMuscles(muscleGroups);

  useEffect(() => {
    if (step !== 'plan' || !plan?.days?.length) return;
    const firstEditable = plan.days.findIndex((day) => {
      const status = isPartialWeek
        ? getDayStatus(DAY_KEYS.indexOf(day.dayOfWeek), plan.weekStart)
        : { isMissed: false };
      return !status.isMissed;
    });
    setActivePlanDay(firstEditable >= 0 ? firstEditable : 0);
  }, [step, plan?._id, isPartialWeek]);

  const getPlanDayStatus = (day) => (
    isPartialWeek
      ? getDayStatus(DAY_KEYS.indexOf(day.dayOfWeek), plan?.weekStart)
      : { isEditable: true, isMissed: false }
  );

  const renderPlanDayCard = (day, dayIndex) => {
    const status = getPlanDayStatus(day);
    const dayExercises = filterExercisesForDay(exercises, day, plan.splitType);

    if (status.isMissed) {
      return (
        <div className="card planner-day planner-day--missed planner-day--panel">
          <div className="planner-day__label">{DAY_LABELS[day.dayOfWeek]}</div>
          <div className="planner-day__missed-overlay">
            <span>Missed</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{day.focus || '—'}</div>
        </div>
      );
    }

    return (
      <div className={`card planner-day planner-day--panel${day.isRestDay ? ' planner-day--rest' : ''}`}>
        {day.isRestDay ? (
          <>
            <div className="planner-day__label">{DAY_LABELS[day.dayOfWeek]}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Rest Day</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{day.focus}</div>
          </>
        ) : (
          <>
            <div className="planner-day__head">
              <span className="planner-day__label">{DAY_LABELS[day.dayOfWeek]}</span>
              {!isEditingExisting && status.isEditable && (
                <label className="planner-day__rest-toggle">
                  <input type="checkbox" checked={day.isRestDay} onChange={(e) => updateDay(dayIndex, { isRestDay: e.target.checked })} />
                  Rest
                </label>
              )}
            </div>
            {isEditingExisting ? (
              <div className="planner-day__focus-readonly">
                <span className="planner-day__focus">{day.focus || 'Training day'}</span>
                {plan.splitType === 'double_muscle' && day.primaryMuscle && day.secondaryMuscle && (
                  <span className="planner-day__focus-meta">
                    {day.primarySets ?? 3} + {day.secondarySets ?? 3} sets
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="planner-day__muscle-picker">
                  <DayMusclePicker
                    splitType={plan.splitType}
                    day={day}
                    muscleGroups={plannerMuscles}
                    disabled={!status.isEditable}
                    onChange={(updates) => updateDay(dayIndex, updates)}
                  />
                </div>
                {day.focus && <div className="planner-day__focus">{day.focus}</div>}
              </>
            )}
            <div className="planner-day__exercises">
              <AnimatePresence initial={false}>
                {(day.plannedExercises || []).map((pe, exIndex) => {
                  const ex = exercises.find((e) => e._id === pe.exerciseId || e._id === pe.exerciseId?._id);
                  return (
                    <motion.div
                      key={`${day.dayOfWeek}-ex-${exIndex}`}
                      className="planner-exercise"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <button type="button" className="planner-exercise__remove" onClick={() => removeExercise(dayIndex, exIndex)} disabled={!status.isEditable} title="Remove exercise">
                        <X size={12} />
                      </button>
                      {status.isEditable && (
                        <div className="planner-exercise__reorder">
                          <button type="button" onClick={() => moveExercise(dayIndex, exIndex, -1)} disabled={exIndex === 0} title="Move up"><ChevronUp size={12} /></button>
                          <button type="button" onClick={() => moveExercise(dayIndex, exIndex, 1)} disabled={exIndex === (day.plannedExercises?.length || 0) - 1} title="Move down"><ChevronDown size={12} /></button>
                        </div>
                      )}
                      <div className="planner-exercise__head">
                        {ex && <ExerciseMedia exercise={ex} alt={ex.name} variant="thumb" autoPlay={false} />}
                        <div className="planner-exercise__meta">
                          <div className="planner-exercise__name">{ex?.name || 'Exercise'}</div>
                        </div>
                      </div>
                      <div className="planner-exercise__sets">
                        <AnimatePresence initial={false}>
                          {(pe.sets || []).map((set, setIndex) => (
                            <motion.div
                              key={`set-${setIndex}`}
                              className="planner-set-row"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="planner-set-row__label">Set {set.setIndex}</span>
                              <input type="number" placeholder="kg" value={set.targetWeight || ''} disabled={!status.isEditable} onChange={(e) => updateSet(dayIndex, exIndex, setIndex, 'targetWeight', e.target.value)} />
                              <input type="number" placeholder="reps" value={set.targetReps || ''} disabled={!status.isEditable} onChange={(e) => updateSet(dayIndex, exIndex, setIndex, 'targetReps', e.target.value)} />
                              {status.isEditable && (
                                <button
                                  type="button"
                                  className="planner-set-row__delete"
                                  onClick={() => removeSet(dayIndex, exIndex, setIndex)}
                                  title="Remove set"
                                  aria-label={`Remove set ${set.setIndex}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {status.isEditable && (
                          <motion.button
                            type="button"
                            className="planner-add-set"
                            onClick={() => addSet(dayIndex, exIndex)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus size={12} /> Add set
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {dayExercises.length === 0 && status.isEditable && (
              <p className="planner-day__no-exercises">No exercises match &ldquo;{day.focus}&rdquo; — adjust focus or split.</p>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading && step === 'list' && !plansList.length) {
    return <PlannerSkeleton />;
  }

  if (loading && !plan && step !== 'list') {
    return <PlannerSkeleton />;
  }

  return (
    <div className={`planner${step === 'plan' ? ' planner--plan-step' : ''}`}>
      <div className="planner__header">
        <div>
          <h1 className="planner__title">Weekly Planner</h1>
          {plan && step !== 'list' && (
            <p className="planner__meta">{plan.weekLabel || formatWeekRange(plan.weekStart)}</p>
          )}
          {plan?.splitType && step === 'plan' && (
            <span className="planner__split-badge">{getSplitLabel(plan.splitType)}</span>
          )}
        </div>
        <div className="planner__actions">
          {step !== 'list' && (
            <button type="button" className="btn-secondary" onClick={() => { setStep('list'); setPlan(null); }}>
              All Plans
            </button>
          )}
          {step === 'plan' && (
            <>
              {!isEditingExisting && (
                <button type="button" className="btn-secondary" onClick={() => { setStep('split'); setSelectedSplit(null); setIsEditingExisting(false); }}>
                  Change Split
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setPreviewPlan(plan)}>
                <Eye size={14} /> Full Preview
              </button>
            </>
          )}
          {step === 'list' && (
            <button type="button" className="btn-primary" onClick={handleCreatePlan} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> New Plan
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
      {step === 'list' && (
        <motion.div key="step-list" className="planner-step" {...STEP_MOTION}>
        <div className="plans-table-wrap card">
          <div className="plans-table__head">
            <h2>Your Weekly Plans</h2>
            <span className="plans-table__hint">Plan up to {MAX_WEEK_OFFSET} weeks ahead (~100 days)</span>
          </div>
          {plansList.length === 0 ? (
            <div className="plans-table__empty">
              <Calendar size={32} color="var(--color-text-muted)" />
              <p>No plans yet. Create your first weekly plan.</p>
              <button type="button" className="btn-primary" onClick={handleCreatePlan}>Create Plan</button>
            </div>
          ) : (
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Split</th>
                  <th>Training Days</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {plansList.map((p, rowIdx) => {
                  const isCurrent = isCurrentWeek(p.weekStart);
                  const isFuture = new Date(p.weekStart) > getWeekStartByOffset(0);
                  return (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rowIdx * 0.04 }}
                    >
                      <td>
                        <strong>{p.weekLabel || formatWeekRange(p.weekStart)}</strong>
                      </td>
                      <td>{p.splitType ? getSplitLabel(p.splitType) : '—'}</td>
                      <td>{countTrainingDays(p)} days</td>
                      <td>
                        {isCurrent && <span className="plans-table__badge plans-table__badge--current">Current</span>}
                        {isFuture && !isCurrent && <span className="plans-table__badge plans-table__badge--future">Upcoming</span>}
                        {!isCurrent && !isFuture && <span className="plans-table__badge">Past</span>}
                      </td>
                      <td>
                        <div className="plans-table__actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Preview full week"
                            onClick={() => setPreviewPlan(p)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit exercises & sets"
                            onClick={() => {
                              const offset = Math.round(
                                (getMondayOfWeek(new Date(p.weekStart)).getTime() - getWeekStartByOffset(0).getTime())
                                / (7 * 24 * 60 * 60 * 1000)
                              );
                              openPlanForWeek(offset, { editing: true });
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            title="Delete plan"
                            onClick={() => handleDeletePlan(p._id, p.weekLabel || formatWeekRange(p.weekStart))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        </motion.div>
      )}

      {step === 'split' && (
        <motion.div
          key="step-split"
          className="split-step planner-step"
          {...STEP_MOTION}
        >
          <div className="split-step__intro">
            <h2>Choose Your Training Split</h2>
            <p>Pick a structure — each option shows how your week will flow. Muscles and exercises adapt to your choice.</p>
          </div>
          <div className="split-options">
            {SPLIT_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.id}
                type="button"
                className={`split-option${selectedSplit === opt.id ? ' split-option--active' : ''}`}
                style={{ '--split-accent': opt.accent }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startCustomize(opt.id)}
              >
                <div className="split-option__label">{opt.label}</div>
                <div className="split-option__desc">{opt.description}</div>
                <div className="split-option__days">{opt.days} training days / week</div>
                <div className="split-option__chips">
                  {opt.preview.map((chip) => (
                    <span key={chip} className="split-option__chip">{chip}</span>
                  ))}
                </div>
                <span className="split-option__cta">
                  <Sparkles size={14} /> Configure week <ChevronRight size={14} />
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'customize' && (
        <motion.div
          key="step-customize"
          className="split-customize planner-step"
          {...STEP_MOTION}
        >
          <button type="button" className="btn-secondary configure-back" onClick={() => setStep('split')}>
            <ArrowLeft size={14} /> Back to splits
          </button>

          <ConfigureWeekHeader
            splitLabel={getSplitLabel(selectedSplit)}
            weekLabel={plan?.weekLabel || formatWeekRange(plan?.weekStart)}
          />

          <div className={`planner-week-band planner-week-band--${weekOffset % 2 === 0 ? 'even' : 'odd'}`}>
            <div className="split-customize__grid">
              {draftDays.map((day, i) => {
                const status = isPartialWeek ? getDayStatus(DAY_KEYS.indexOf(day.dayOfWeek), plan?.weekStart) : { isEditable: true, isMissed: false };
                const configured = !day.isRestDay && Boolean(day.focus || day.primaryMuscle || day.pplFocus);
                return (
                  <motion.div
                    key={day.dayOfWeek}
                    className={`split-customize__card${day.isRestDay ? ' split-customize__card--rest' : ''}${status.isMissed ? ' split-customize__card--missed' : ''}${configured ? ' split-customize__card--done' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
                    layout
                  >
                    <div className="split-customize__card-head">
                      <span className="split-customize__day">{DAY_LABELS[day.dayOfWeek]}</span>
                      {configured && !status.isMissed && (
                        <span className="split-customize__done-dot" title="Configured" />
                      )}
                    </div>
                    {status.isMissed ? (
                      <div className="split-customize__missed">
                        <span>Past day</span>
                        <small>Not editable this week</small>
                      </div>
                    ) : (
                      <DayMusclePicker
                        splitType={selectedSplit}
                        day={day}
                        muscleGroups={plannerMuscles}
                        exercises={exercises}
                        disabled={!status.isEditable}
                        showRestToggle
                        onToggleRest={(isRest) => updateDraftDay(i, {
                          isRestDay: isRest,
                          focus: isRest ? 'Rest' : buildDayFocus(selectedSplit, day, plannerMuscles),
                          ...(isRest ? { primaryMuscle: null, secondaryMuscle: null, pplFocus: null } : {}),
                        })}
                        onChange={(updates) => patchDraftDayMuscles(i, updates)}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            className="configure-footer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="configure-footer__hint">
              Next step: we&apos;ll add matching exercises — then you adjust weight & reps.
            </p>
            <motion.button
              type="button"
              className="btn-primary configure-footer__cta"
              onClick={applySplit}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Building your plan...' : 'Add exercises & continue'}
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {step === 'plan' && plan && (() => {
        const activeDay = plan.days[activePlanDay];
        const activeStatus = activeDay ? getPlanDayStatus(activeDay) : { isEditable: false, isMissed: true };
        const activeDayExercises = activeDay
          ? filterExercisesForDay(exercises, activeDay, plan.splitType)
          : [];

        return (
        <motion.div
          key="step-plan"
          className={`planner-week-band planner-week-band--${weekOffset % 2 === 0 ? 'even' : 'odd'} planner-step planner-plan-step`}
          {...STEP_MOTION}
        >
          <div className="planner-week-band__label">
            {plan.weekLabel || formatWeekRange(plan.weekStart)} · {getSplitLabel(plan.splitType)}
          </div>

          <div className="planner-plan-layout">
            <div className="planner-plan-panel">
              <AnimatePresence mode="wait">
                {activeDay && (
                  <motion.div
                    key={activeDay.dayOfWeek}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderPlanDayCard(activeDay, activePlanDay)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav className="planner-plan-days-nav" aria-label="Week days">
              {plan.days.map((day, i) => {
                const status = getPlanDayStatus(day);
                const exerciseCount = day.plannedExercises?.length || 0;
                return (
                  <button
                    key={day.dayOfWeek}
                    type="button"
                    className={[
                      'planner-plan-day-tab',
                      activePlanDay === i ? 'planner-plan-day-tab--active' : '',
                      day.isRestDay ? 'planner-plan-day-tab--rest' : '',
                      status.isMissed ? 'planner-plan-day-tab--missed' : '',
                      exerciseCount > 0 ? 'planner-plan-day-tab--done' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setActivePlanDay(i)}
                  >
                    <span className="planner-plan-day-tab__label">{DAY_LABELS[day.dayOfWeek]}</span>
                    <span className="planner-plan-day-tab__meta">
                      {status.isMissed ? 'Missed' : day.isRestDay ? 'Rest' : day.focus || 'Training'}
                    </span>
                    {!day.isRestDay && !status.isMissed && exerciseCount > 0 && (
                      <span className="planner-plan-day-tab__count">{exerciseCount} ex</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="planner-plan-footer">
            <div className="planner-plan-footer__info">
              <strong>{activeDay ? DAY_LABELS[activeDay.dayOfWeek] : '—'}</strong>
              <span>{activeDay?.focus || 'Select a day'}</span>
            </div>
            <div className="planner-plan-footer__actions">
              {activeStatus.isEditable && activeDayExercises.length > 0 && !activeDay?.isRestDay && (
                <button
                  type="button"
                  className="btn-secondary planner-select-exercises"
                  onClick={() => setPickerDayIndex(activePlanDay)}
                >
                  <Plus size={14} />
                  Select exercises ({activeDayExercises.length})
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={handleSaveTemplate}>
                <Bookmark size={14} /> Template
              </button>
              {activeDay && activeStatus.isEditable && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const target = window.prompt('Duplicate to day (monday, tuesday, …)', 'tuesday');
                    if (target) duplicateDayTo(activeDay.dayOfWeek, target.toLowerCase());
                  }}
                >
                  <Copy size={14} /> Duplicate day
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </motion.div>
        );
      })()}
      </AnimatePresence>

      {pickerDayIndex != null && plan?.days?.[pickerDayIndex] && (
        <ExercisePickerModal
          open
          onClose={() => setPickerDayIndex(null)}
          dayLabel={DAY_LABELS[plan.days[pickerDayIndex].dayOfWeek]}
          focus={plan.days[pickerDayIndex].focus}
          exercises={filterExercisesForDay(exercises, plan.days[pickerDayIndex], plan.splitType)}
          selectedIds={(plan.days[pickerDayIndex].plannedExercises || []).map(
            (pe) => pe.exerciseId?._id || pe.exerciseId
          )}
          onSelect={(exerciseId) => addExercise(pickerDayIndex, exerciseId)}
        />
      )}

      <Modal open={showWeekModal} onClose={() => setShowWeekModal(false)} title="Create Weekly Plan">
        <p className="week-modal__intro">Which week do you want to plan?</p>
        <div className="week-modal__options">
          <button type="button" className="week-modal__option" onClick={() => handleWeekSelect(0)}>
            <Calendar size={20} />
            <div>
              <strong>Current Week</strong>
              <span>{formatWeekRange(getWeekStartByOffset(0))}</span>
              <small>Only remaining days are editable — past days show as missed</small>
            </div>
          </button>
          <button type="button" className="week-modal__option" onClick={() => handleWeekSelect(1)}>
            <Calendar size={20} />
            <div>
              <strong>Next Week</strong>
              <span>{formatWeekRange(getWeekStartByOffset(1))}</span>
              <small>Full week available</small>
            </div>
          </button>
        </div>
        <div className="week-modal__more">
          <label>Or pick a future week</label>
          <div className="week-picker-scroll">
            {Array.from({ length: MAX_WEEK_OFFSET + 1 }, (_, i) => i).map((offset) => {
              const isHovered = hoverWeekOffset === offset;
              return (
                <motion.button
                  key={offset}
                  type="button"
                  className="week-picker-card"
                  onClick={() => handleWeekSelect(offset)}
                  onMouseEnter={() => setHoverWeekOffset(offset)}
                  onMouseLeave={() => setHoverWeekOffset(null)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    borderColor: isHovered ? 'var(--color-primary)' : 'var(--color-border)',
                    boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.25)' : '0 0 0 rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="week-picker-card__badge">
                    {offset === 0 ? 'Current' : offset === 1 ? 'Next' : `+${offset}`}
                  </span>
                  <strong>{formatWeekRange(getWeekStartByOffset(offset))}</strong>
                  <small>{offset === 0 ? 'Remaining days editable' : 'Full week available'}</small>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Modal>

      <CelebrationModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Plan Saved!"
        subtitle="Your week is locked in. Time to execute."
        quote={saveQuote?.text}
        quoteAuthor={saveQuote?.author}
        primaryLabel="Go to Dashboard"
        primaryAction={goToDashboard}
      />

      <PlanPreviewModal
        open={!!previewPlan}
        onClose={() => setPreviewPlan(null)}
        plan={previewPlan}
      />
    </div>
  );
}
