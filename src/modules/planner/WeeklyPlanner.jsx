import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, ArrowLeft, ChevronRight, Plus, Calendar, Edit3 } from 'lucide-react';
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
  SPLIT_TEMPLATES,
  DAY_LABELS,
  getSplitLabel,
  filterExercisesForDay,
} from './splitTemplates.js';
import './planner.css';

function countTrainingDays(plan) {
  return plan?.days?.filter((d) => !d.isRestDay && d.plannedExercises?.length > 0).length || 0;
}

export function WeeklyPlanner() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('list');
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [draftDays, setDraftDays] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveQuote, setSaveQuote] = useState(null);

  const loadPlansList = useCallback(() => {
    return fitnessApi.getPlans({ limit: 100 }).then((res) => setPlansList(res.data || []));
  }, []);

  const loadExercises = useCallback(() => {
    return fitnessApi.getExercises({ limit: 100 }).then((res) => setExercises(res.data || []));
  }, []);

  useEffect(() => {
    Promise.all([loadPlansList(), loadExercises()])
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [loadPlansList, loadExercises]);

  const openPlanForWeek = async (offset, { createIfMissing = true } = {}) => {
    setLoading(true);
    try {
      const weekStart = getWeekStartByOffset(offset).toISOString();
      const res = await fitnessApi.getPlanForWeek(weekStart, createIfMissing);
      const p = res.data[0];
      if (!p) {
        toast.error('No plan for this week. Create a new one.');
        return;
      }
      setPlan(p);
      setWeekOffset(offset);
      if (p.splitType) {
        setSelectedSplit(p.splitType);
        setStep('plan');
      } else {
        setStep('split');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
      setStep('split');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startCustomize = (splitId) => {
    setSelectedSplit(splitId);
    setDraftDays(SPLIT_TEMPLATES[splitId].map((d) => ({ ...d, plannedExercises: [] })));
    setStep('customize');
  };

  const applySplit = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.updatePlan(plan._id, {
        splitType: selectedSplit,
        days: draftDays,
      });
      setPlan(res.data[0]);
      setStep('plan');
      toast.success('Split applied to your week!');
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
    days[dayIndex] = { ...days[dayIndex], ...updates };
    if (updates.isRestDay) days[dayIndex].plannedExercises = [];
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
    days[dayIndex].plannedExercises = days[dayIndex].plannedExercises.filter((_, i) => i !== exIndex);
    setPlan({ ...plan, days });
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
    const sets = days[dayIndex].plannedExercises[exIndex].sets || [];
    sets.push({ setIndex: sets.length + 1, setType: 'normal', targetWeight: 0, targetReps: 10 });
    days[dayIndex].plannedExercises[exIndex].sets = sets;
    setPlan({ ...plan, days });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fitnessApi.updatePlan(plan._id, { days: plan.days, splitType: plan.splitType });
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

  if (loading && !plan) {
    return <div className="planner">Loading planner...</div>;
  }

  return (
    <div className="planner">
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
              <button type="button" className="btn-secondary" onClick={() => { setStep('split'); setSelectedSplit(null); }}>
                Change Split
              </button>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Plan'}
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

      {step === 'list' && (
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
                {plansList.map((p) => {
                  const isCurrent = isCurrentWeek(p.weekStart);
                  const isFuture = new Date(p.weekStart) > getWeekStartByOffset(0);
                  return (
                    <tr key={p._id}>
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
                        <button type="button" className="btn-icon" onClick={() => {
                          const offset = Math.round(
                            (getMondayOfWeek(new Date(p.weekStart)).getTime() - getWeekStartByOffset(0).getTime())
                            / (7 * 24 * 60 * 60 * 1000)
                          );
                          openPlanForWeek(offset);
                        }}>
                          <Edit3 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {step === 'split' && (
        <div className="split-step">
          <div className="split-step__intro">
            <h2>Choose Your Training Split</h2>
            <p>Select how you want to structure your week. Exercises are filtered strictly by muscle group for each day.</p>
          </div>
          <div className="split-options">
            {SPLIT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`split-option${selectedSplit === opt.id ? ' split-option--active' : ''}`}
                onClick={() => startCustomize(opt.id)}
              >
                <div className="split-option__label">{opt.label}</div>
                <div className="split-option__desc">{opt.description}</div>
                <div className="split-option__days">{opt.days} training days / week</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'customize' && (
        <div className="split-customize">
          <button type="button" className="btn-secondary" onClick={() => setStep('split')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="split-customize__title">Customize — {getSplitLabel(selectedSplit)}</div>
          <div className="split-customize__grid">
            {draftDays.map((day, i) => {
              const status = isPartialWeek ? getDayStatus(DAY_KEYS.indexOf(day.dayOfWeek), plan?.weekStart) : { isEditable: true };
              return (
                <div key={day.dayOfWeek} className={`split-customize__row${day.isRestDay ? ' split-customize__row--rest' : ''}${status.isMissed ? ' split-customize__row--missed' : ''}`}>
                  <span className="split-customize__day">{DAY_LABELS[day.dayOfWeek]}</span>
                  {status.isMissed ? (
                    <span className="planner-day__missed-label">Missed</span>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Day focus (e.g. Chest)"
                        value={day.focus || ''}
                        disabled={day.isRestDay || !status.isEditable}
                        onChange={(e) => updateDraftDay(i, { focus: e.target.value })}
                      />
                      <label className="split-customize__rest">
                        <input
                          type="checkbox"
                          checked={day.isRestDay}
                          disabled={!status.isEditable}
                          onChange={(e) => updateDraftDay(i, { isRestDay: e.target.checked, focus: e.target.checked ? 'Rest' : day.focus })}
                        />
                        Rest
                      </label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="btn-primary" onClick={applySplit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Apply Split & Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 'plan' && plan && (
        <div className="planner-grid">
          {plan.days.map((day, dayIndex) => {
            const dayKeyIndex = DAY_KEYS.indexOf(day.dayOfWeek);
            const status = isPartialWeek ? getDayStatus(dayKeyIndex, plan.weekStart) : { isEditable: true, isMissed: false };
            const dayExercises = filterExercisesForDay(exercises, day, plan.splitType);

            if (status.isMissed) {
              return (
                <div key={day.dayOfWeek} className="card planner-day planner-day--missed">
                  <div className="planner-day__label">{DAY_LABELS[day.dayOfWeek]}</div>
                  <div className="planner-day__missed-overlay">
                    <span>Missed</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{day.focus || '—'}</div>
                </div>
              );
            }

            return (
              <div key={day.dayOfWeek} className={`card planner-day${day.isRestDay ? ' planner-day--rest' : ''}`}>
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        <input type="checkbox" checked={day.isRestDay} onChange={(e) => updateDay(dayIndex, { isRestDay: e.target.checked })} disabled={!status.isEditable} />
                        Rest
                      </label>
                    </div>
                    <input
                      className="planner-day__focus-input"
                      value={day.focus || ''}
                      onChange={(e) => updateDay(dayIndex, { focus: e.target.value })}
                      disabled={!status.isEditable}
                      style={{ fontSize: '0.85rem', marginBottom: '10px', padding: '8px 10px', width: '100%' }}
                    />
                    {(day.plannedExercises || []).map((pe, exIndex) => {
                      const ex = exercises.find((e) => e._id === pe.exerciseId || e._id === pe.exerciseId?._id);
                      return (
                        <div key={exIndex} className="planner-exercise">
                          <button type="button" className="planner-exercise__remove" onClick={() => removeExercise(dayIndex, exIndex)} disabled={!status.isEditable}>
                            <X size={12} />
                          </button>
                          <div className="planner-exercise__name">{ex?.name || 'Exercise'}</div>
                          <div className="planner-exercise__sets">
                            {(pe.sets || []).map((set, setIndex) => (
                              <div key={setIndex} className="planner-set-row">
                                <input type="number" placeholder="kg" value={set.targetWeight || ''} disabled={!status.isEditable} onChange={(e) => updateSet(dayIndex, exIndex, setIndex, 'targetWeight', e.target.value)} />
                                <input type="number" placeholder="reps" value={set.targetReps || ''} disabled={!status.isEditable} onChange={(e) => updateSet(dayIndex, exIndex, setIndex, 'targetReps', e.target.value)} />
                              </div>
                            ))}
                            {status.isEditable && (
                              <button type="button" className="btn-icon" onClick={() => addSet(dayIndex, exIndex)} style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                                + Add set
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {status.isEditable && (
                      <select
                        onChange={(e) => { if (e.target.value) { addExercise(dayIndex, e.target.value); e.target.value = ''; } }}
                        style={{ marginTop: 'auto' }}
                      >
                        <option value="">+ Add exercise ({dayExercises.length} for {day.focus})</option>
                        {dayExercises.map((ex) => (
                          <option key={ex._id} value={ex._id}>{ex.name}</option>
                        ))}
                      </select>
                    )}
                    {dayExercises.length === 0 && status.isEditable && (
                      <p className="planner-day__no-exercises">No exercises match &ldquo;{day.focus}&rdquo; — adjust focus or split.</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
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
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value !== '') {
                handleWeekSelect(Number(e.target.value));
                e.target.value = '';
              }
            }}
          >
            <option value="">Select week (up to {MAX_WEEK_OFFSET} weeks ahead)...</option>
            {Array.from({ length: MAX_WEEK_OFFSET + 1 }, (_, i) => i).map((offset) => (
              <option key={offset} value={offset}>
                {offset === 0 ? 'Current week' : offset === 1 ? 'Next week' : `Week +${offset}`} — {formatWeekRange(getWeekStartByOffset(offset))}
              </option>
            ))}
          </select>
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
    </div>
  );
}
