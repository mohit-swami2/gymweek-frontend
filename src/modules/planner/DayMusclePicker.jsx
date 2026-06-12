import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Dumbbell, Minus, Plus, Zap } from 'lucide-react';
import {
  PPL_FOCUS_OPTIONS,
  buildDayFocus,
  getMuscleName,
  filterExercisesForDay,
} from './splitTemplates.js';

const MUSCLE_COLORS = {
  chest: '#f87171',
  back: '#60a5fa',
  legs: '#fbbf24',
  shoulders: '#c084fc',
  arms: '#f472b6',
  core: '#2dd4bf',
};

const PPL_META = {
  Push: { color: '#f87171', hint: 'Chest · Shoulders · Triceps' },
  Pull: { color: '#60a5fa', hint: 'Back · Biceps' },
  Legs: { color: '#fbbf24', hint: 'Quads · Hamstrings · Glutes' },
};

function ExercisePreview({ count, focus, isRest }) {
  if (isRest) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={count}
        className="day-picker__preview"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
      >
        <Zap size={14} />
        {count > 0 ? (
          <span><strong>{count}</strong> exercises will be added{focus ? ` for ${focus}` : ''}</span>
        ) : (
          <span>Pick a muscle to see matching exercises</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function SetStepper({ label, value, onChange, disabled, color }) {
  return (
    <div className="day-picker__set-stepper" style={{ '--muscle-accent': color }}>
      <span className="day-picker__set-stepper-label">{label}</span>
      <div className="day-picker__set-stepper-controls">
        <button type="button" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease sets">
          <Minus size={14} />
        </button>
        <span>{value}</span>
        <button type="button" disabled={disabled || value >= 12} onClick={() => onChange(value + 1)} aria-label="Increase sets">
          <Plus size={14} />
        </button>
      </div>
      <span className="day-picker__set-stepper-hint">sets</span>
    </div>
  );
}

export function DayMusclePicker({
  splitType,
  day,
  muscleGroups,
  exercises = [],
  disabled,
  onChange,
  onToggleRest,
  showRestToggle = false,
}) {
  const previewDay = { ...day, focus: day.focus || buildDayFocus(splitType, day, muscleGroups) };
  const matchCount = day.isRestDay ? 0 : filterExercisesForDay(exercises, previewDay, splitType).length;

  if (day.isRestDay) {
    return (
      <motion.div
        className="day-picker__rest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Moon size={28} strokeWidth={1.5} />
        <p>Recovery day</p>
        {showRestToggle && !disabled && (
          <button type="button" className="day-picker__rest-btn" onClick={() => onToggleRest?.(false)}>
            Make training day
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="day-picker">
      {showRestToggle && !disabled && (
        <button type="button" className="day-picker__mark-rest" onClick={() => onToggleRest?.(true)}>
          <Moon size={12} /> Mark rest
        </button>
      )}

      {splitType === 'ppl' && (
        <div className="day-picker__ppl">
          {PPL_FOCUS_OPTIONS.map((opt) => {
            const active = (day.pplFocus || day.focus || '') === opt.value;
            const meta = PPL_META[opt.value];
            return (
              <motion.button
                key={opt.value}
                type="button"
                disabled={disabled}
                className={`day-picker__ppl-btn${active ? ' day-picker__ppl-btn--active' : ''}`}
                style={{ '--session-color': meta.color }}
                onClick={() => onChange({
                  pplFocus: opt.value,
                  focus: opt.value,
                  primaryMuscle: null,
                  secondaryMuscle: null,
                })}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.97 }}
              >
                <span className="day-picker__ppl-name">{opt.value}</span>
                <span className="day-picker__ppl-hint">{meta.hint}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {splitType === 'single_muscle' && (
        <div className="day-picker__chips">
          {muscleGroups.map((mg) => {
            const active = day.primaryMuscle === mg.slug;
            return (
              <motion.button
                key={mg.slug}
                type="button"
                disabled={disabled}
                className={`day-picker__chip${active ? ' day-picker__chip--active' : ''}`}
                style={{ '--muscle-accent': MUSCLE_COLORS[mg.slug] || 'var(--color-primary)' }}
                onClick={() => onChange({
                  primaryMuscle: mg.slug,
                  secondaryMuscle: null,
                  focus: buildDayFocus('single_muscle', { primaryMuscle: mg.slug }, muscleGroups),
                })}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                layout
              >
                <Dumbbell size={13} />
                {mg.name}
              </motion.button>
            );
          })}
        </div>
      )}

      {splitType === 'double_muscle' && (
        <div className="day-picker__double">
          <div className="day-picker__double-section">
            <span className="day-picker__label">1st muscle</span>
            <div className="day-picker__chips day-picker__chips--compact">
              {muscleGroups.map((mg) => {
                const active = day.primaryMuscle === mg.slug;
                const dimmed = day.secondaryMuscle === mg.slug;
                return (
                  <motion.button
                    key={`p-${mg.slug}`}
                    type="button"
                    disabled={disabled || dimmed}
                    className={`day-picker__chip${active ? ' day-picker__chip--active' : ''}${dimmed ? ' day-picker__chip--dim' : ''}`}
                    style={{ '--muscle-accent': MUSCLE_COLORS[mg.slug] || 'var(--color-primary)' }}
                    onClick={() => {
                      const primaryMuscle = mg.slug;
                      const secondaryMuscle = day.secondaryMuscle === primaryMuscle ? '' : day.secondaryMuscle;
                      onChange({
                        primaryMuscle,
                        secondaryMuscle,
                        focus: buildDayFocus('double_muscle', { primaryMuscle, secondaryMuscle }, muscleGroups),
                      });
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mg.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <AnimatePresence>
            {day.primaryMuscle && (
              <motion.div
                className="day-picker__double-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className="day-picker__label">2nd muscle</span>
                <div className="day-picker__chips day-picker__chips--compact">
                  {muscleGroups.filter((mg) => mg.slug !== day.primaryMuscle).map((mg) => {
                    const active = day.secondaryMuscle === mg.slug;
                    return (
                      <motion.button
                        key={`s-${mg.slug}`}
                        type="button"
                        disabled={disabled}
                        className={`day-picker__chip${active ? ' day-picker__chip--active' : ''}`}
                        style={{ '--muscle-accent': MUSCLE_COLORS[mg.slug] || 'var(--color-primary)' }}
                        onClick={() => onChange({
                          secondaryMuscle: mg.slug,
                          focus: buildDayFocus('double_muscle', { primaryMuscle: day.primaryMuscle, secondaryMuscle: mg.slug }, muscleGroups),
                        })}
                        whileTap={{ scale: 0.95 }}
                      >
                        {mg.name}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {day.primaryMuscle && day.secondaryMuscle && (
              <motion.div
                className="day-picker__sets-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <SetStepper
                  label={getMuscleName(day.primaryMuscle, muscleGroups)}
                  value={day.primarySets ?? 3}
                  disabled={disabled}
                  color={MUSCLE_COLORS[day.primaryMuscle]}
                  onChange={(n) => onChange({ primarySets: n })}
                />
                <SetStepper
                  label={getMuscleName(day.secondaryMuscle, muscleGroups)}
                  value={day.secondarySets ?? 3}
                  disabled={disabled}
                  color={MUSCLE_COLORS[day.secondaryMuscle]}
                  onChange={(n) => onChange({ secondarySets: n })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ExercisePreview count={matchCount} focus={previewDay.focus} isRest={day.isRestDay} />
    </div>
  );
}
