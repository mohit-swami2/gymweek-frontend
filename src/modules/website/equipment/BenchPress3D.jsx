import { motion } from 'framer-motion';

const ACCENT = '#7eb09a';
const VIOLET = '#9b8ec4';

export function BenchPress3D() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="gw-equipment"
    >
      <svg viewBox="0 0 400 360" aria-hidden="true">
        <defs>
          <linearGradient id="bp-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3d48" />
            <stop offset="0.5" stopColor="#22252e" />
            <stop offset="1" stopColor="#12141a" />
          </linearGradient>
          <linearGradient id="bp-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2d3a" />
            <stop offset="1" stopColor="#161820" />
          </linearGradient>
          <linearGradient id="bp-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2d38" />
            <stop offset="1" stopColor="#0e1016" />
          </linearGradient>
          <radialGradient id="bp-floor" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="rgba(155,142,196,0.25)" />
            <stop offset="1" stopColor="rgba(155,142,196,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="310" rx="170" ry="22" fill="url(#bp-floor)" />
        <polygon points="80,80 100,70 100,210 80,220" fill="url(#bp-metal)" />
        <polygon points="300,80 320,70 320,210 300,220" fill="url(#bp-metal)" />
        <polygon points="100,70 320,70 320,80 100,80" fill="#2a2d3a" />
        <polygon points="130,200 270,200 290,215 110,215" fill="url(#bp-bench)" />
        <polygon points="110,215 290,215 290,230 110,230" fill="#0e1016" />
        <rect x="135" y="195" width="130" height="8" rx="2" fill="#3a3d4a" />
        <rect x="135" y="195" width="130" height="2" fill={ACCENT} opacity="0.35" />
        <polygon points="130,230 145,230 145,290 130,290" fill="url(#bp-metal)" />
        <polygon points="255,230 270,230 270,290 255,290" fill="url(#bp-metal)" />
        <polygon points="195,230 210,230 210,295 195,295" fill="url(#bp-metal)" />
        <rect x="60" y="118" width="280" height="6" rx="2" fill="#8a9098" />
        <rect x="60" y="118" width="280" height="2" fill="#c8ccd4" />
        <ellipse cx="80" cy="121" rx="8" ry="32" fill="url(#bp-plate)" />
        <ellipse cx="72" cy="121" rx="6" ry="36" fill="url(#bp-plate)" stroke={ACCENT} strokeWidth="0.6" opacity="0.85" />
        <ellipse cx="66" cy="121" rx="5" ry="38" fill="url(#bp-plate)" stroke={VIOLET} strokeWidth="0.6" opacity="0.8" />
        <ellipse cx="320" cy="121" rx="8" ry="32" fill="url(#bp-plate)" />
        <ellipse cx="328" cy="121" rx="6" ry="36" fill="url(#bp-plate)" stroke={ACCENT} strokeWidth="0.6" opacity="0.85" />
        <ellipse cx="334" cy="121" rx="5" ry="38" fill="url(#bp-plate)" stroke={VIOLET} strokeWidth="0.6" opacity="0.8" />
        <rect x="135" y="228" width="130" height="1.5" fill={ACCENT} opacity="0.6" />
        <rect x="100" y="70" width="220" height="1" fill={ACCENT} opacity="0.3" />
      </svg>
    </motion.div>
  );
}
