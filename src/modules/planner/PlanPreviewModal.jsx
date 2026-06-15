import { motion } from 'framer-motion';
import { Calendar, Dumbbell, Moon } from 'lucide-react';
import { Modal } from '../../common/components/Modal.jsx';
import { DAY_LABELS, getSplitLabel } from './splitTemplates.js';
import { formatWeekRange } from '../../common/utils/dateUtils.js';
import './plan-preview.css';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function PlanPreviewModal({ open, onClose, plan }) {
  if (!plan) return null;

  const days = DAY_ORDER.map((key) => plan.days?.find((d) => d.dayOfWeek === key) || { dayOfWeek: key, isRestDay: true, plannedExercises: [] });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Weekly plan preview"
      size="lg"
      scrollBody
      footer={<button type="button" className="btn-primary" onClick={onClose}>Close</button>}
    >
      <div className="plan-preview">
        <header className="plan-preview__head">
          <div>
            <span className="plan-preview__eyebrow"><Calendar size={14} /> {plan.weekLabel || formatWeekRange(plan.weekStart)}</span>
            <h2>{plan.splitType ? getSplitLabel(plan.splitType) : 'Custom split'}</h2>
          </div>
          <div className="plan-preview__summary">
            <strong>{days.filter((d) => !d.isRestDay && d.plannedExercises?.length).length}</strong>
            <span>training days</span>
          </div>
        </header>

        <div className="plan-preview__grid">
          {days.map((day, i) => {
            const label = DAY_LABELS[day.dayOfWeek] || day.dayOfWeek;
            const exercises = day.plannedExercises || [];
            const isRest = day.isRestDay || !exercises.length;

            return (
              <motion.article
                key={day.dayOfWeek}
                className={`plan-preview__day${isRest ? ' plan-preview__day--rest' : ''}`}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="plan-preview__day-head">
                  <span className="plan-preview__day-label">{label}</span>
                  {isRest ? (
                    <span className="plan-preview__rest"><Moon size={14} /> Rest</span>
                  ) : (
                    <span className="plan-preview__focus">{day.focus || 'Workout'}</span>
                  )}
                </div>

                {!isRest && (
                  <ul className="plan-preview__exercises">
                    {exercises.map((pe, exIdx) => (
                      <motion.li
                        key={pe.exerciseId?._id || pe.exerciseId || exIdx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 + exIdx * 0.03 }}
                      >
                        <Dumbbell size={12} />
                        <span className="plan-preview__ex-name">{pe.exerciseId?.name || 'Exercise'}</span>
                        <span className="plan-preview__ex-sets">
                          {pe.sets?.length || 0}× {pe.sets?.[0]?.targetWeight ?? 0}kg · {pe.sets?.[0]?.targetReps ?? 0}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
