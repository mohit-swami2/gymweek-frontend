export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export const PPL_FOCUS_OPTIONS = [
  { value: 'Push', label: 'Push — Chest, Shoulders, Triceps' },
  { value: 'Pull', label: 'Pull — Back, Biceps' },
  { value: 'Legs', label: 'Legs — Quads, Hamstrings, Glutes' },
];

export const SPLIT_OPTIONS = [
  {
    id: 'ppl',
    label: 'Push / Pull / Legs',
    description: '6-day rotation — Push, Pull, Legs twice per week',
    days: 6,
    accent: '#3b82f6',
    preview: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
  },
  {
    id: 'single_muscle',
    label: 'Single Muscle',
    description: 'One primary muscle group per training day',
    days: 5,
    accent: '#a855f7',
    preview: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
  },
  {
    id: 'double_muscle',
    label: 'Double Muscle',
    description: 'Pair two muscle groups each session',
    days: 4,
    accent: '#f59e0b',
    preview: ['Chest + Tri', 'Back + Bi', 'Legs', 'Shoulders + Arms'],
  },
  // upper_lower, bodybuilding, strength, custom — hidden for now
];

/** Active split types shown in the planner UI */
export const ACTIVE_SPLIT_OPTIONS = SPLIT_OPTIONS.filter((o) => ['ppl', 'single_muscle', 'double_muscle'].includes(o.id));

/** Strength-focused groups for day configuration pickers */
export function getPlannerMuscles(muscleGroups = []) {
  return muscleGroups.filter((m) => !['cardio'].includes(m.slug));
}

export function getMuscleName(slug, muscleGroups = []) {
  if (!slug) return '';
  return muscleGroups.find((m) => m.slug === slug)?.name
    || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function buildDayFocus(splitType, { pplFocus, primaryMuscle, secondaryMuscle }, muscleGroups = []) {
  if (splitType === 'ppl') return pplFocus || 'Push';
  if (splitType === 'single_muscle') return getMuscleName(primaryMuscle, muscleGroups);
  const a = getMuscleName(primaryMuscle, muscleGroups);
  const b = getMuscleName(secondaryMuscle, muscleGroups);
  if (a && b) return `${a} & ${b}`;
  return a || b || '';
}

function slugFromFocusToken(token, muscleGroups) {
  const t = token.trim().toLowerCase();
  const byName = muscleGroups.find((m) => m.name.toLowerCase() === t || m.slug === t);
  if (byName) return byName.slug;
  const mapped = MUSCLE_FOCUS_MAP[t];
  if (mapped) return mapped;
  return muscleGroups.find((m) => m.slug.includes(t) || t.includes(m.slug))?.slug || '';
}

/** Hydrate muscle picker fields from saved day + split type */
export function hydrateDayMuscles(day, splitType, muscleGroups = []) {
  if (day.isRestDay) return { ...day };

  if (day.primaryMuscle || day.pplFocus) return { ...day };

  const focus = day.focus || '';
  if (splitType === 'ppl') {
    const match = PPL_FOCUS_OPTIONS.find((o) => focus.toLowerCase().includes(o.value.toLowerCase()));
    const pplFocus = match?.value || focus || 'Push';
    return { ...day, pplFocus, focus: pplFocus };
  }

  if (splitType === 'single_muscle') {
    const primaryMuscle = slugFromFocusToken(focus, muscleGroups);
    return { ...day, primaryMuscle, primarySets: day.primarySets ?? 3 };
  }

  if (splitType === 'double_muscle') {
    const parts = focus.split('&').map((s) => s.trim()).filter(Boolean);
    const primaryMuscle = slugFromFocusToken(parts[0] || '', muscleGroups);
    const secondaryMuscle = slugFromFocusToken(parts[1] || '', muscleGroups);
    return {
      ...day,
      primaryMuscle,
      secondaryMuscle,
      primarySets: day.primarySets ?? 3,
      secondarySets: day.secondarySets ?? 3,
      focus: buildDayFocus('double_muscle', { primaryMuscle, secondaryMuscle }, muscleGroups) || focus,
    };
  }

  return { ...day };
}

export function enrichTemplateDays(splitId, muscleGroups = []) {
  const template = SPLIT_TEMPLATES[splitId] || SPLIT_TEMPLATES.custom;
  return template.map((d) => hydrateDayMuscles({ ...d, plannedExercises: [] }, splitId, muscleGroups));
}

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
  upper_lower: tpl([
    { day: 'monday', focus: 'Upper A', rest: false },
    { day: 'tuesday', focus: 'Lower A', rest: false },
    { day: 'wednesday', focus: 'Rest', rest: true },
    { day: 'thursday', focus: 'Upper B', rest: false },
    { day: 'friday', focus: 'Lower B', rest: false },
    { day: 'saturday', focus: 'Rest', rest: true },
    { day: 'sunday', focus: 'Rest', rest: true },
  ]),
  bodybuilding: tpl([
    { day: 'monday', focus: 'Chest', rest: false },
    { day: 'tuesday', focus: 'Back', rest: false },
    { day: 'wednesday', focus: 'Shoulders', rest: false },
    { day: 'thursday', focus: 'Arms', rest: false },
    { day: 'friday', focus: 'Legs', rest: false },
    { day: 'saturday', focus: 'Rest', rest: true },
    { day: 'sunday', focus: 'Rest', rest: true },
  ]),
  strength: tpl([
    { day: 'monday', focus: 'Squat Day', rest: false },
    { day: 'tuesday', focus: 'Rest', rest: true },
    { day: 'wednesday', focus: 'Bench Day', rest: false },
    { day: 'thursday', focus: 'Rest', rest: true },
    { day: 'friday', focus: 'Deadlift Day', rest: false },
    { day: 'saturday', focus: 'Rest', rest: true },
    { day: 'sunday', focus: 'Rest', rest: true },
  ]),
  custom: tpl([
    { day: 'monday', focus: 'Day 1', rest: false },
    { day: 'tuesday', focus: 'Day 2', rest: false },
    { day: 'wednesday', focus: 'Day 3', rest: false },
    { day: 'thursday', focus: 'Day 4', rest: false },
    { day: 'friday', focus: 'Day 5', rest: false },
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

function buildPlannedExerciseEntry(exercise, setCount = 3) {
  return {
    exerciseId: exercise._id,
    orderIndex: 0,
    restSeconds: 90,
    sets: Array.from({ length: Math.max(1, setCount) }, (_, i) => ({
      setIndex: i + 1,
      setType: 'normal',
      targetWeight: 0,
      targetReps: 10,
    })),
  };
}

/** Exercises are chosen manually on the sets screen — no auto-fill */
export function autoPopulateDayExercises() {
  return [];
}

/** Filter exercises strictly by muscle group / movement for the selected day focus */
export function filterExercisesForDay(exercises, day, splitType) {
  if (day.isRestDay) return [];

  const focus = (day.focus || '').toLowerCase();
  const pplFocus = (day.pplFocus || day.focus || '').toLowerCase();
  if (focus.includes('rest') && !day.primaryMuscle && !day.pplFocus) return [];

  if (splitType === 'single_muscle' && day.primaryMuscle) {
    return exercises.filter((ex) => muscleSlug(ex) === day.primaryMuscle);
  }

  if (splitType === 'double_muscle' && (day.primaryMuscle || day.secondaryMuscle)) {
    const slugs = [day.primaryMuscle, day.secondaryMuscle].filter(Boolean);
    return exercises.filter((ex) => slugs.includes(muscleSlug(ex)));
  }

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
    if (pplFocus.includes('push')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return (ex.movementType === 'push' && m !== 'back' && m !== 'legs')
          || ['chest', 'shoulders'].includes(m)
          || (m === 'arms' && ex.movementType !== 'pull');
      });
    }
    if (pplFocus.includes('pull')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return ex.movementType === 'pull' || m === 'back'
          || (m === 'arms' && ex.movementType !== 'push');
      });
    }
    if (pplFocus.includes('leg')) {
      return exercises.filter((ex) => {
        const m = muscleSlug(ex);
        return m === 'legs' || ['squat', 'hinge', 'carry'].includes(ex.movementType);
      });
    }
  }

  if (!focus && !day.pplFocus) return [];

  const fallbackTargets = resolveMuscleTargets(focus);
  if (fallbackTargets.length) {
    return exercises.filter((ex) => fallbackTargets.includes(muscleSlug(ex)));
  }

  return [];
}
