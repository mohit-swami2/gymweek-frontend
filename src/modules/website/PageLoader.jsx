import { motion } from 'framer-motion';

/** Slim top progress bar — page skeleton remains visible underneath. */
export function PageLoader({ progress = 0, label = 'Loading' }) {
  return (
    <motion.div
      className="gw-page-loader gw-page-loader--slim"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="gw-page-loader__bar-track">
        <motion.div
          className="gw-page-loader__bar-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
      <span className="gw-page-loader__slim-label">{label}</span>
    </motion.div>
  );
}
