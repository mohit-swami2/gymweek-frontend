import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Lock, Sparkles } from 'lucide-react';
import { Modal } from '../../common/components/Modal.jsx';
import { StreakMedalBadge } from './StreakMedalBadge.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import './streak-award-modal.css';

export function StreakAwardModal({ open, onClose, medal, earned, isCurrent, currentStreak }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (!open) {
      setQuote(null);
      return;
    }
    fitnessApi.getRandomQuote()
      .then((res) => setQuote(res.data?.[0] || res.data || null))
      .catch(() => setQuote(null));
  }, [open, medal?.min]);

  if (!medal) return null;

  const daysLeft = Math.max(0, medal.min - (currentStreak || 0));

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className={`streak-award-modal streak-award-modal--${medal.tier}`}>
        <div className="streak-award-modal__bg" aria-hidden />
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="streak-award-modal__particle"
            style={{ left: `${8 + i * 11}%`, animationDelay: `${i * 0.15}s` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: earned ? [0, 0.8, 0] : 0, y: [0, -60] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        <div className="streak-award-modal__stage">
          <motion.div
            className="streak-award-modal__medal-3d"
            initial={{ rotateY: -30, rotateX: 12, scale: 0.6, opacity: 0 }}
            animate={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          >
            <motion.div
              className="streak-award-modal__medal-inner"
              animate={{
                rotateY: [-12, 12, -12],
                rotateX: [4, -4, 4],
                y: [0, -10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <StreakMedalBadge tier={medal.tier} earned={earned} active size="xl" />
            </motion.div>
            <div className="streak-award-modal__pedestal" />
          </motion.div>
        </div>

        <motion.div
          className="streak-award-modal__info"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="streak-award-modal__tier">{medal.min}+ day streak</span>
          <h2 className="streak-award-modal__name">{medal.name}</h2>
          {medal.description && <p className="streak-award-modal__desc">{medal.description}</p>}

          {earned ? (
            <div className="streak-award-modal__status streak-award-modal__status--earned">
              <Sparkles size={14} />
              {isCurrent ? 'Your current award' : 'Unlocked'}
            </div>
          ) : (
            <div className="streak-award-modal__status streak-award-modal__status--locked">
              <Lock size={14} />
              {daysLeft} more day{daysLeft === 1 ? '' : 's'} to unlock
            </div>
          )}

          {currentStreak != null && (
            <div className="streak-award-modal__streak">
              <Flame size={16} />
              <span>{currentStreak} day streak</span>
            </div>
          )}
        </motion.div>

        {(quote?.text || medal.fallbackQuote) && (
          <motion.blockquote
            className="streak-award-modal__quote"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p>&ldquo;{quote?.text || medal.fallbackQuote}&rdquo;</p>
            {(quote?.author || medal.fallbackAuthor) && (
              <cite>— {quote?.author || medal.fallbackAuthor}</cite>
            )}
          </motion.blockquote>
        )}

        <motion.button
          type="button"
          className="btn-primary streak-award-modal__close"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {earned ? 'Keep Going!' : 'Got It'}
        </motion.button>
      </div>
    </Modal>
  );
}
