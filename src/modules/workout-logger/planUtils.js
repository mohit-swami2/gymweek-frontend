import { DAY_KEYS } from '../../common/utils/dateUtils.js';

export function hasConfiguredPlan(plan) {
  if (!plan?.days?.length) return false;
  return plan.days.some((d) => !d.isRestDay && (d.plannedExercises?.length || 0) > 0);
}

export function getWorkoutDays(plan) {
  return (plan?.days || []).filter((d) => !d.isRestDay && (d.plannedExercises?.length || 0) > 0);
}

export function countWorkoutDays(plan) {
  return getWorkoutDays(plan).length;
}

export function getDateForPlanDay(weekStart, dayOfWeek) {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const dayIndex = DAY_KEYS.indexOf(dayOfWeek);
  const d = new Date(start);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().slice(0, 10);
}

export function dayKeyForDate(d = new Date()) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const idx = date.getDay();
  return DAY_KEYS[idx === 0 ? 6 : idx - 1];
}

export function filterConfiguredPlans(plans = []) {
  return plans.filter(hasConfiguredPlan).sort(
    (a, b) => new Date(b.weekStart) - new Date(a.weekStart)
  );
}
