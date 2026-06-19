import { motion } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';
import { Modal } from './Modal.jsx';

export function CelebrationModal({
  open,
  onClose,
  title,
  subtitle,
  quote,
  quoteAuthor,
  streak,
  primaryAction,
  primaryLabel = 'Continue',
  secondaryAction,
  secondaryLabel,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="celebration">
        <motion.div
          className="celebration__glow"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="celebration__icon"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
        >
          <Sparkles size={32} />
        </motion.div>

        <motion.h2
          className="celebration__title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            className="celebration__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {subtitle}
          </motion.p>
        )}

        {streak != null && (
          <motion.div
            className="celebration__streak"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <Flame size={18} />
            <span>{streak} day streak</span>
          </motion.div>
        )}

        {quote && (
          <motion.blockquote
            className="celebration__quote"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p>&ldquo;{quote}&rdquo;</p>
            {quoteAuthor && <cite>— {quoteAuthor}</cite>}
          </motion.blockquote>
        )}

        <motion.div
          className="celebration__actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {secondaryAction && secondaryLabel && (
            <button type="button" className="btn-secondary" onClick={secondaryAction}>
              {secondaryLabel}
            </button>
          )}
          <button type="button" className="btn-primary" onClick={primaryAction || onClose}>
            {primaryLabel}
          </button>
        </motion.div>

        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="celebration__particle"
            style={{ left: `${15 + i * 14}%` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-20, -80] }}
            transition={{ duration: 1.8, delay: 0.2 + i * 0.12, repeat: Infinity, repeatDelay: 1.2 }}
          />
        ))}
      </div>
    </Modal>
  );
}
