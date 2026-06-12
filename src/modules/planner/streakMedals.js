export const STREAK_MEDALS = [
  { min: 0, name: 'Rookie', tier: 'none', color: '#6b7280', accent: '#9ca3af' },
  { min: 3, name: 'Committed', tier: 'bronze', color: '#b87333', accent: '#e8a85c' },
  { min: 7, name: 'Warrior', tier: 'silver', color: '#a8b4c4', accent: '#e8eef5' },
  { min: 30, name: 'Conqueror', tier: 'gold', color: '#f5c518', accent: '#fff4b0' },
  { min: 100, name: 'Legend', tier: 'legend', color: '#a78bfa', accent: '#e9d5ff' },
];

export function getCurrentMedal(streak) {
  const sorted = [...STREAK_MEDALS].sort((a, b) => b.min - a.min);
  return sorted.find((m) => streak >= m.min) || STREAK_MEDALS[0];
}

export function getNextMedal(streak) {
  return STREAK_MEDALS.find((m) => m.min > streak) || null;
}
