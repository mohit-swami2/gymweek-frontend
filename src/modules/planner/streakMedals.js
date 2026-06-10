export const STREAK_MEDALS = [
  { min: 0, name: 'Rookie', tier: 'none', emoji: '🏅', color: '#6b6b6b' },
  { min: 3, name: 'Committed', tier: 'bronze', emoji: '🥉', color: '#cd7f32' },
  { min: 7, name: 'Warrior', tier: 'silver', emoji: '🥈', color: '#c0c0c0' },
  { min: 30, name: 'Champion', tier: 'gold', emoji: '🥇', color: '#ffd700' },
  { min: 100, name: 'Legend', tier: 'platinum', emoji: '💎', color: '#a78bfa' },
];

export function getCurrentMedal(streak) {
  const sorted = [...STREAK_MEDALS].sort((a, b) => b.min - a.min);
  return sorted.find((m) => streak >= m.min) || STREAK_MEDALS[0];
}

export function getNextMedal(streak) {
  return STREAK_MEDALS.find((m) => m.min > streak) || null;
}
