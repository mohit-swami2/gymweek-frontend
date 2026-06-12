import { useId } from 'react';

const TIERS = {
  bronze: ({ id, earned, active }) => (
    <svg viewBox="0 0 120 140" className="streak-medal-svg" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bronze`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0c080" />
          <stop offset="45%" stopColor="#cd7f32" />
          <stop offset="100%" stopColor="#8b4513" />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M38 8 L28 38 L8 42 L22 58 L18 82 L38 70 L58 82 L54 58 L68 42 L48 38 Z" fill={`url(#${id}-bronze)`} opacity={earned ? 1 : 0.35} />
      <circle cx="60" cy="72" r="34" fill={`url(#${id}-bronze)`} stroke={earned ? '#f0c080' : '#555'} strokeWidth="2" />
      <circle cx="60" cy="72" r="34" fill={`url(#${id}-shine)`} />
      <polygon points="60,52 66,68 82,68 69,78 74,94 60,84 46,94 51,78 38,68 54,68" fill={earned ? '#fff8e8' : '#888'} opacity="0.9" />
      <path d="M42 106 Q60 118 78 106 L82 132 Q60 126 38 132 Z" fill="#9a3412" opacity={earned ? 0.9 : 0.3} />
      {active && <circle cx="60" cy="72" r="42" className="streak-medal-svg__pulse" fill="none" stroke="#cd7f32" strokeWidth="2" />}
    </svg>
  ),

  silver: ({ id, earned, active }) => (
    <svg viewBox="0 0 120 140" className="streak-medal-svg" aria-hidden>
      <defs>
        <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#c0c8d4" />
          <stop offset="100%" stopColor="#6b7a8f" />
        </linearGradient>
      </defs>
      <path d="M34 6 L30 34 L10 40 L26 54 L20 78 L40 66 L60 78 L54 54 L70 40 L50 34 Z" fill={`url(#${id}-silver)`} opacity={earned ? 1 : 0.35} />
      <polygon points="60,38 88,52 88,88 60,102 32,88 32,52" fill={`url(#${id}-silver)`} stroke={earned ? '#e8eef5' : '#666'} strokeWidth="2" />
      <path d="M60 48 L68 72 L92 72 L72 86 L80 110 L60 96 L40 110 L48 86 L28 72 L52 72 Z" fill={earned ? '#1e293b' : '#555'} />
      <path d="M40 108 Q60 120 80 108 L84 134 Q60 128 36 134 Z" fill="#475569" opacity={earned ? 0.85 : 0.3} />
      {active && <circle cx="60" cy="70" r="44" className="streak-medal-svg__pulse" fill="none" stroke="#c0c8d4" strokeWidth="2" />}
    </svg>
  ),

  gold: ({ id, earned, active }) => (
    <svg viewBox="0 0 120 150" className="streak-medal-svg streak-medal-svg--conqueror" aria-hidden>
      <defs>
        <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={`${id}-gold-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 28 L30 8 L40 28 L60 20 L80 28 L90 8 L100 28 L108 48 L100 68 L108 88 L90 108 L60 100 L30 108 L12 88 L20 68 L12 48 Z" fill={`url(#${id}-gold)`} opacity={earned ? 0.95 : 0.25} className="streak-medal-svg__wings" />
      <ellipse cx="60" cy="118" rx="38" ry="8" fill="#000" opacity={earned ? 0.25 : 0.1} />
      <path d="M36 52 L36 108 Q60 128 84 108 L84 52 Q60 42 36 52 Z" fill={`url(#${id}-gold)`} stroke={earned ? '#fff4b0' : '#666'} strokeWidth="2" />
      <path d="M36 52 L60 42 L84 52 L84 62 Q60 54 36 62 Z" fill={earned ? '#fef08a' : '#888'} />
      <rect x="48" y="38" width="24" height="14" rx="4" fill={`url(#${id}-gold)`} stroke={earned ? '#fff4b0' : '#666'} />
      <path d="M44 108 L44 96 Q60 104 76 96 L76 108" fill="none" stroke={earned ? '#b45309' : '#555'} strokeWidth="2" />
      <rect x="38" y="70" width="44" height="28" rx="4" fill={`url(#${id}-gold-shine)`} opacity={earned ? 0.5 : 0.15} />
      {earned && <text x="60" y="90" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7c2d12" fontFamily="Barlow Condensed, sans-serif">1</text>}
      {active && <ellipse cx="60" cy="90" rx="50" ry="58" className="streak-medal-svg__pulse-gold" fill="none" stroke="#ffd700" strokeWidth="2" />}
    </svg>
  ),

  legend: ({ id, earned, active }) => (
    <svg viewBox="0 0 120 160" className="streak-medal-svg streak-medal-svg--legend" aria-hidden>
      <defs>
        <linearGradient id={`${id}-legend`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="30%" stopColor="#a78bfa" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id={`${id}-crown`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {earned && (
        <>
          <circle cx="60" cy="80" r="52" fill="#a78bfa" opacity="0.15" className="streak-medal-svg__aura" />
          <circle cx="24" cy="40" r="3" fill="#e9d5ff" className="streak-medal-svg__spark" />
          <circle cx="96" cy="36" r="2" fill="#c4b5fd" className="streak-medal-svg__spark streak-medal-svg__spark--d2" />
          <circle cx="88" cy="100" r="2.5" fill="#f0abfc" className="streak-medal-svg__spark streak-medal-svg__spark--d3" />
        </>
      )}
      <path d="M28 34 L36 18 L44 30 L52 14 L60 26 L68 14 L76 30 L84 18 L92 34 L88 42 L32 42 Z" fill={`url(#${id}-crown)`} opacity={earned ? 1 : 0.3} filter={earned ? `url(#${id}-glow)` : undefined} />
      <ellipse cx="60" cy="130" rx="40" ry="9" fill="#000" opacity={earned ? 0.3 : 0.1} />
      <path d="M32 48 L32 118 Q60 140 88 118 L88 48 Q60 36 32 48 Z" fill={`url(#${id}-legend)`} stroke={earned ? '#e9d5ff' : '#666'} strokeWidth="2.5" filter={earned ? `url(#${id}-glow)` : undefined} />
      <path d="M32 48 L60 38 L88 48 L88 58 Q60 48 32 58 Z" fill={earned ? '#c4b5fd' : '#888'} />
      <path d="M48 38 L52 28 L60 34 L68 28 L72 38" fill="none" stroke={earned ? '#fde68a' : '#555'} strokeWidth="2" />
      <polygon points="60,62 66,78 84,78 69,88 74,106 60,96 46,106 51,88 36,78 54,78" fill={earned ? '#fef08a' : '#666'} />
      <path d="M40 118 L40 104 Q60 114 80 104 L80 118" fill="none" stroke={earned ? '#312e81' : '#555'} strokeWidth="2" />
      {active && <ellipse cx="60" cy="88" rx="54" ry="62" className="streak-medal-svg__pulse-legend" fill="none" stroke="#a78bfa" strokeWidth="2.5" />}
    </svg>
  ),

  none: ({ id, earned }) => (
    <svg viewBox="0 0 120 120" className="streak-medal-svg" aria-hidden>
      <circle cx="60" cy="60" r="40" fill="#374151" stroke="#6b7280" strokeWidth="2" opacity={earned ? 1 : 0.4} />
      <text x="60" y="68" textAnchor="middle" fontSize="14" fill="#9ca3af" fontWeight="700">?</text>
    </svg>
  ),
};

export function StreakMedalBadge({ tier = 'bronze', earned = false, active = false, size = 'md', label }) {
  const uid = useId().replace(/:/g, '');
  const id = `medal-${tier}-${uid}`;
  const Render = TIERS[tier] || TIERS.bronze;

  return (
    <div
      className={[
        'streak-medal-badge',
        `streak-medal-badge--${tier}`,
        `streak-medal-badge--${size}`,
        earned ? 'streak-medal-badge--earned' : 'streak-medal-badge--locked',
        active ? 'streak-medal-badge--active' : '',
      ].filter(Boolean).join(' ')}
      title={label}
    >
      <div className="streak-medal-badge__glow" aria-hidden />
      <div className="streak-medal-badge__icon">
        <Render id={id} earned={earned} active={active} />
      </div>
      {label && <span className="streak-medal-badge__label">{label}</span>}
    </div>
  );
}
