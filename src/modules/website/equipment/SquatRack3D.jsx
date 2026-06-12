import { motion } from 'framer-motion';

const ACCENT = '#7eb09a';
const VIOLET = '#9b8ec4';

export function SquatRack3D() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      className="gw-equipment"
    >
      <svg viewBox="0 0 400 380" aria-hidden="true">
        <defs>
          <linearGradient id="sr-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3d48" />
            <stop offset="0.5" stopColor="#22252e" />
            <stop offset="1" stopColor="#12141a" />
          </linearGradient>
          <linearGradient id="sr-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2d38" />
            <stop offset="1" stopColor="#0e1016" />
          </linearGradient>
          <radialGradient id="sr-floor" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="rgba(126,176,154,0.2)" />
            <stop offset="1" stopColor="rgba(126,176,154,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="340" rx="170" ry="22" fill="url(#sr-floor)" />
        <polygon points="70,310 130,290 270,290 330,310 270,330 130,330" fill="#1e2128" />
        <polygon points="70,310 130,290 130,330 70,330" fill="#0e1016" />
        <polygon points="270,290 330,310 330,330 270,330" fill="#0e1016" />
        <polygon points="100,60 120,50 120,300 100,310" fill="url(#sr-metal)" />
        <polygon points="280,60 300,50 300,300 280,310" fill="url(#sr-metal)" />
        <polygon points="100,60 280,60 300,50 120,50" fill="#2a2d3a" />
        <rect x="100" y="58" width="200" height="3" fill={ACCENT} opacity="0.4" />
        <polygon points="90,130 100,130 100,145 95,145 95,140 90,140" fill="#3a3d48" />
        <polygon points="300,130 310,130 310,140 305,140 305,145 300,145" fill="#3a3d48" />
        <rect x="60" y="135" width="280" height="6" rx="2" fill="#8a9098" />
        <rect x="60" y="135" width="280" height="2" fill="#c8ccd4" />
        <ellipse cx="80" cy="138" rx="9" ry="38" fill="url(#sr-plate)" stroke={ACCENT} strokeWidth="0.6" />
        <ellipse cx="68" cy="138" rx="7" ry="42" fill="url(#sr-plate)" stroke={VIOLET} strokeWidth="0.6" />
        <ellipse cx="320" cy="138" rx="9" ry="38" fill="url(#sr-plate)" stroke={ACCENT} strokeWidth="0.6" />
        <ellipse cx="332" cy="138" rx="7" ry="42" fill="url(#sr-plate)" stroke={VIOLET} strokeWidth="0.6" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={`l-${i}`} x="108" y={80 + i * 22} width="6" height="2" fill={ACCENT} opacity="0.4" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={`r-${i}`} x="286" y={80 + i * 22} width="6" height="2" fill={ACCENT} opacity="0.4" />
        ))}
        <rect x="100" y="60" width="200" height="1" fill="#fff" opacity="0.2" />
      </svg>
    </motion.div>
  );
}
