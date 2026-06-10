export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const MAX_WEEK_OFFSET = 14;

export function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekStartByOffset(offset = 0) {
  const monday = getMondayOfWeek();
  monday.setDate(monday.getDate() + offset * 7);
  return monday;
}

export function getTodayDayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export function isCurrentWeek(weekStart) {
  const current = getMondayOfWeek().getTime();
  return getMondayOfWeek(new Date(weekStart)).getTime() === current;
}

export function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

export function getDayStatus(dayIndex, weekStart) {
  if (!isCurrentWeek(weekStart)) {
    return { isPast: false, isMissed: false, isEditable: true };
  }
  const todayIndex = getTodayDayIndex();
  if (dayIndex < todayIndex) {
    return { isPast: true, isMissed: true, isEditable: false };
  }
  return { isPast: false, isMissed: false, isEditable: true };
}
