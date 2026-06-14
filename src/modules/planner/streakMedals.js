export const STREAK_MEDALS = [
  {
    min: 0,
    name: 'Rookie',
    tier: 'none',
    color: '#6b7280',
    accent: '#9ca3af',
    description: 'Every legend starts somewhere. Show up today.',
    fallbackQuote: 'The only bad workout is the one that did not happen.',
    fallbackAuthor: 'Unknown',
  },
  {
    min: 3,
    name: 'Committed',
    tier: 'bronze',
    color: '#b87333',
    accent: '#e8a85c',
    description: 'Three days of discipline — habits are forming.',
    fallbackQuote: 'Small daily improvements are the key to staggering long-term results.',
    fallbackAuthor: 'Unknown',
  },
  {
    min: 7,
    name: 'Warrior',
    tier: 'silver',
    color: '#a8b4c4',
    accent: '#e8eef5',
    description: 'A full week locked in. You are building real momentum.',
    fallbackQuote: 'Strength does not come from what you can do. It comes from overcoming the things you once thought you could not.',
    fallbackAuthor: 'Rikki Rogers',
  },
  {
    min: 30,
    name: 'Conqueror',
    tier: 'gold',
    color: '#f5c518',
    accent: '#fff4b0',
    description: 'Thirty days of showing up. You have conquered consistency.',
    fallbackQuote: 'Discipline is choosing between what you want now and what you want most.',
    fallbackAuthor: 'Abraham Lincoln',
  },
  {
    min: 100,
    name: 'Legend',
    tier: 'legend',
    color: '#a78bfa',
    accent: '#e9d5ff',
    description: 'One hundred days. You are in rare company — a true gym legend.',
    fallbackQuote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    fallbackAuthor: 'Aristotle',
  },
];

export function getCurrentMedal(streak) {
  const sorted = [...STREAK_MEDALS].sort((a, b) => b.min - a.min);
  return sorted.find((m) => streak >= m.min) || STREAK_MEDALS[0];
}

export function getNextMedal(streak) {
  return STREAK_MEDALS.find((m) => m.min > streak) || null;
}
