import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, Dumbbell, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../common/components/Modal.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { formatWeekRange, isCurrentWeek } from '../../common/utils/dateUtils.js';
import { getSplitLabel } from '../planner/splitTemplates.js';
import {
  countWorkoutDays,
  filterConfiguredPlans,
  getDateForPlanDay,
  getWorkoutDays,
} from './planUtils.js';
import './week-select-modal.css';

const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export function SelectWeekModal({ open, onClose, onConfirm, title = 'Select workout week', confirmLabel = 'Continue' }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [step, setStep] = useState('week');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggedDays, setLoggedDays] = useState(new Set());

  useEffect(() => {
    if (!open) return;
    setStep('week');
    setSelectedPlan(null);
    setSelectedDay(null);
    setLoggedDays(new Set());
    setLoading(true);
    fitnessApi.getPlans()
      .then((res) => setPlans(filterConfiguredPlans(res.data || [])))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [open]);

  const workoutDays = selectedPlan ? getWorkoutDays(selectedPlan) : [];

  useEffect(() => {
    if (!selectedPlan || step !== 'day') return;
    const start = new Date(selectedPlan.weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    fitnessApi.getSessions({
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      status: 'completed',
      limit: 20,
      loggingMode: 'bulk',
    })
      .then((res) => {
        const planId = String(selectedPlan._id);
        const days = new Set(
          (res.data || [])
            .filter((s) => String(s.planId?._id || s.planId) === planId)
            .map((s) => s.dayOfWeek)
        );
        setLoggedDays(days);
      })
      .catch(() => setLoggedDays(new Set()));
  }, [selectedPlan, step]);

  const handleConfirm = async () => {
    if (!selectedPlan || !selectedDay) return;
    setSubmitting(true);
    try {
      await onConfirm({
        plan: selectedPlan,
        dayOfWeek: selectedDay.dayOfWeek,
        sessionDate: getDateForPlanDay(selectedPlan.weekStart, selectedDay.dayOfWeek),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = step === 'day' ? (
    <>
      <button type="button" className="btn-secondary" onClick={() => { setStep('week'); setSelectedDay(null); }}>
        <ChevronLeft size={14} /> Back
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={!selectedDay || submitting}
        onClick={handleConfirm}
      >
        {submitting ? 'Loading…' : confirmLabel} <ArrowRight size={14} />
      </button>
    </>
  ) : null;

  return (
    <Modal open={open} onClose={onClose} title={title} size="md" scrollBody footer={footer}>
      <div className="week-select">
        {loading ? (
          <div className="week-select__loading">Loading configured weeks…</div>
        ) : plans.length === 0 ? (
          <div className="week-select__empty">
            <CalendarDays size={40} color="var(--color-primary)" />
            <p>No configured weeks yet. Add exercises in the weekly planner first.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 'week' ? (
              <motion.div
                key="week"
                className="week-select__list"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
              >
                <p className="week-select__hint">Only weeks with planned workouts are shown.</p>
                {plans.map((plan, i) => {
                  const current = isCurrentWeek(plan.weekStart);
                  return (
                    <motion.button
                      key={plan._id}
                      type="button"
                      className={`week-select__card${current ? ' week-select__card--current' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setSelectedPlan(plan);
                        const days = getWorkoutDays(plan);
                        if (days.length === 1) {
                          setSelectedDay(days[0]);
                          setStep('day');
                        } else {
                          setSelectedDay(null);
                          setStep('day');
                        }
                      }}
                    >
                      <div className="week-select__card-main">
                        <strong>{plan.weekLabel || formatWeekRange(plan.weekStart)}</strong>
                        {current && <span className="week-select__badge">This week</span>}
                      </div>
                      <div className="week-select__card-meta">
                        {plan.splitType && <span>{getSplitLabel(plan.splitType)}</span>}
                        <span>{countWorkoutDays(plan)} workout day{countWorkoutDays(plan) === 1 ? '' : 's'}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="day"
                className="week-select__days"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <p className="week-select__hint">
                  {selectedPlan?.weekLabel || formatWeekRange(selectedPlan?.weekStart)} — pick a workout day
                </p>
                <div className="week-select__day-grid">
                  {workoutDays.map((day, i) => (
                    <motion.button
                      key={day.dayOfWeek}
                      type="button"
                      className={`week-select__day${selectedDay?.dayOfWeek === day.dayOfWeek ? ' week-select__day--active' : ''}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="week-select__day-label">{DAY_LABELS[day.dayOfWeek]}</span>
                      <Dumbbell size={16} />
                      <strong>{day.focus || 'Workout'}</strong>
                      <span>{day.plannedExercises?.length || 0} exercises</span>
                      {loggedDays.has(day.dayOfWeek) && (
                        <span className="week-select__logged">
                          <CheckCircle2 size={12} /> Logged — tap to edit
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Modal>
  );
}
