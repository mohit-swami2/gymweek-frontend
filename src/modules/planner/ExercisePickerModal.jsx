import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, Dumbbell, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../common/components/Modal.jsx';
import { ExerciseMedia } from '../workout-logger/ExerciseMedia.jsx';
import '../workout-logger/workout-log.css';

function muscleName(ex) {
  return ex?.muscleGroupData?.name || ex?.muscleGroup?.name || '';
}

function parseInstructionSteps(text) {
  if (!text?.trim()) return [];
  const blocks = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  if (blocks.length > 1) {
    return blocks.map((s) => s.replace(/^\d+[\).\s]+/, ''));
  }
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map((s) => s.replace(/^\d+[\).\s]+/, ''));
  }
  return [text.trim()];
}

function ExerciseDetailPanel({ exercise, added, onAdd }) {
  if (!exercise) {
    return (
      <div className="exercise-picker__detail exercise-picker__detail--empty">
        <Dumbbell size={40} strokeWidth={1.2} />
        <p>Select an exercise to preview the demo and instructions.</p>
      </div>
    );
  }

  const secondary = Array.isArray(exercise.secondaryMuscles)
    ? exercise.secondaryMuscles
    : exercise.secondaryMuscles?.split?.(',').map((s) => s.trim()).filter(Boolean) || [];

  const instructionSteps = parseInstructionSteps(exercise.instructions);

  return (
    <motion.div
      key={exercise._id}
      className="exercise-picker__detail"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="exercise-picker__detail-media">
        <ExerciseMedia exercise={exercise} alt={exercise.name} variant="picker-full" autoPlay />
      </div>

      <div className="exercise-picker__detail-body">
        <h3 className="exercise-picker__detail-name">{exercise.name}</h3>

        <div className="exercise-picker__detail-tags">
          {muscleName(exercise) && <span>{muscleName(exercise)}</span>}
          {exercise.equipmentType && <span>{exercise.equipmentType}</span>}
          {exercise.movementType && <span>{exercise.movementType}</span>}
        </div>

        {secondary.length > 0 && (
          <div className="exercise-picker__detail-row">
            <span className="exercise-picker__detail-label">Secondary</span>
            <span className="exercise-picker__detail-value">{secondary.join(', ')}</span>
          </div>
        )}

        <div className="exercise-picker__detail-instructions">
          <div className="exercise-picker__detail-instructions-head">
            <Info size={13} />
            Instructions
          </div>
          <div className="exercise-picker__detail-instructions-scroll">
            {instructionSteps.length > 0 ? (
              <ol className="exercise-picker__instruction-steps">
                {instructionSteps.map((step, i) => (
                  <li key={`${i}-${step.slice(0, 24)}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="exercise-picker__instruction-empty">
                No written instructions. Watch the demo for form reference.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`exercise-picker__detail-add${added ? ' exercise-picker__detail-add--added' : ''}`}
          onClick={onAdd}
          disabled={added}
        >
          {added ? <><Check size={16} /> Added to plan</> : <><Plus size={16} /> Add to {exercise.name?.split(' ')[0] || 'plan'}</>}
        </button>
      </div>
    </motion.div>
  );
}

export function ExercisePickerModal({
  open,
  onClose,
  dayLabel,
  focus,
  exercises,
  selectedIds = [],
  onSelect,
}) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(null);

  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex) =>
      ex.name?.toLowerCase().includes(q)
      || ex.equipmentType?.toLowerCase().includes(q)
      || ex.movementType?.toLowerCase().includes(q)
    );
  }, [exercises, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setFocused(null);
      return;
    }
    const first = filtered.find((ex) => !selectedSet.has(String(ex._id))) || filtered[0] || null;
    setFocused(first);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!focused && filtered.length) {
      setFocused(filtered[0]);
    }
  }, [filtered, focused]);

  const handleAdd = () => {
    if (!focused || selectedSet.has(String(focused._id))) return;
    onSelect(focused._id);
  };

  const focusedAdded = focused ? selectedSet.has(String(focused._id)) : false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Select exercises — ${dayLabel}`}
      size="2xl"
      backdrop="blue"
    >
      <div className="exercise-picker-modal">
      <p className="exercise-picker__subtitle">
        {exercises.length} exercises for <strong>{focus || 'this day'}</strong>. Pick one to preview, then add it to your plan.
      </p>

      <div className="exercise-picker__layout">
        <div className="exercise-picker__left">
          <div className="exercise-picker__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by name, equipment, or movement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="exercise-picker__empty">No exercises match your search.</p>
          ) : (
            <div className="exercise-picker__list">
              <AnimatePresence mode="popLayout">
                {filtered.map((ex) => {
                  const added = selectedSet.has(String(ex._id));
                  const isFocused = focused?._id === ex._id;
                  return (
                    <motion.button
                      key={ex._id}
                      type="button"
                      layout
                      className={[
                        'exercise-picker__list-item',
                        added ? 'exercise-picker__list-item--added' : '',
                        isFocused ? 'exercise-picker__list-item--focused' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setFocused(ex)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="exercise-picker__list-thumb">
                        <ExerciseMedia exercise={ex} alt={ex.name} variant="thumb" autoPlay={isFocused} />
                      </div>
                      <div className="exercise-picker__list-info">
                        <span className="exercise-picker__list-name">{ex.name}</span>
                        <span className="exercise-picker__list-meta">{muscleName(ex)} · {ex.equipmentType}</span>
                      </div>
                      {added && <Check size={14} className="exercise-picker__list-check" />}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="exercise-picker__right">
          <ExerciseDetailPanel
            exercise={focused}
            added={focusedAdded}
            onAdd={handleAdd}
          />
        </div>
      </div>
      </div>
    </Modal>
  );
}
