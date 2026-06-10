export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export const SPLIT_OPTIONS = [
  {
    id: 'ppl',
    label: 'Push / Pull / Legs',
    description: '6-day rotation — Push, Pull, Legs twice per week',
    days: 6,
  },
  {
    id: 'single_muscle',
    label: 'Single Muscle',
    description: 'One primary muscle group per training day',
    days: 5,
  },
  {
    id: 'double_muscle',
    label: 'Double Muscle',
    description: 'Pair two muscle groups each session',
    days: 4,
  },
];

const tpl = (entries) =>
  DAY_KEYS.map((dayOfWeek) => {
    const match = entries.find((e) => e.day === dayOfWeek);
    return {
      dayOfWeek,
      focus: match?.focus || '',
      isRestDay: match?.rest ?? true,
      plannedExercises: [],
    };
  });

export const SPLIT_TEMPLATES = {
  ppl: tpl([
    { day: 'monday', focus: 'Push', rest: false },
    { day: 'tuesday', focus: 'Pull', rest: false },
    { day: 'wednesday', focus: 'Legs', rest: false },
    { day: 'thursday', focus: 'Push', rest: false },
    { day: 'friday', focus: 'Pull', rest: false },
    { day: 'saturday', focus: 'Legs', rest: false },
    { day: 'sunday', focus: 'Rest & Recovery', rest: true },
  ]),
  single_muscle: tpl([
    { day: 'monday', focus: 'Chest', rest: false },
    { day: 'tuesday', focus: 'Back', rest: false },
    { day: 'wednesday', focus: 'Legs', rest: false },
    { day: 'thursday', focus: 'Shoulders', rest: false },
    { day: 'friday', focus: 'Arms', rest: false },
    { day: 'saturday', focus: 'Rest', rest: true },
    { day: 'sunday', focus: 'Rest', rest: true },
  ]),
  double_muscle: tpl([
    { day: 'monday', focus: 'Chest & Triceps', rest: false },
    { day: 'tuesday', focus: 'Back & Biceps', rest: false },
    { day: 'wednesday', focus: 'Legs', rest: false },
    { day: 'thursday', focus: 'Shoulders & Arms', rest: false },
    { day: 'friday', focus: 'Rest', rest: true },
    { day: 'saturday', focus: 'Rest', rest: true },
    { day: 'sunday', focus: 'Rest', rest: true },
  ]),
};

export function getSplitLabel(splitType) {
  return SPLIT_OPTIONS.find((s) => s.id === splitType)?.label || 'Custom';
}

const muscleSlug = (ex) => {
  const mg = ex.muscleGroup?.slug || ex.muscleGroup?.name
    || ex.muscleGroupData?.slug || ex.muscleGroupData?.name || '';
  return String(mg).toLowerCase();
};

const MUSCLE_FOCUS_MAP = {
  chest: 'chest',
  back: 'back',
  legs: 'legs',
  leg: 'legs',
  shoulders: 'shoulders',
  shoulder: 'shoulders',
  arms: 'arms',
  arm: 'arms',
  triceps: 'arms',
  tricep: 'arms',
  biceps: 'arms',
  bicep: 'arms',
  core: 'core',
  cardio: 'cardio',
};

function resolveMuscleTargets(focus) {
  const tokens = focus.split(/[&+,/]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const targets = new Set();
  for (const token of tokens) {
    const match = Object.entries(MUSCLE_FOCUS_MAP).find(([key]) => token.includes(key));
    if (match) targets.add(match[1]);
  }
  return [...targets];
}

/** Filter exercises strictly by muscle group / movement for the selected day focus */
export function filterExercisesForDay(exercises, day, splitType) {
  if (day.isRestDay || !day.focus) return [];

  const focus = day.focus.toLowerCase();
  if (focus.includes('rest')) return [];

  if (splitType === 'single_muscle') {
    const targets = resolveMuscleTargets(focus);
    if (targets.length === 1) {
      return exercises.filter((ex) => muscleSlug(ex) === targets[0]);
    }
    if (targets.length > 1) {
      return exercises.filter((ex) => targets.includes(muscleSlug(ex)));
    }
  }

  if (splitType === 'double_muscle') {
    const targets = resolveMuscleTargets(focus);
    if (targets.length) {
      return exercises.filter((ex) => targets.includes(muscleSlug(ex)));
    }
  }

  if (splitType === 'ppl') {
    if (focus.includes('push')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return (ex.movementType === 'push' && m !== 'back' && m !== 'legs')
          || ['chest', 'shoulders'].includes(m)
          || (m === 'arms' && ex.movementType !== 'pull');
      });
    }
    if (focus.includes('pull')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return ex.movementType === 'pull' || m === 'back'
          || (m === 'arms' && ex.movementType !== 'push');
      });
    }
    if (focus.includes('leg')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return m === 'legs' || ['squat', 'hinge', 'carry'].includes(ex.movementType);
      });
    }
  }

  const fallbackTargets = resolveMuscleTargets(focus);
  if (fallbackTargets.length) {
    return exercises.filter((ex) => fallbackTargets.includes(muscleSlug(ex)));
  }

  return [];
}
