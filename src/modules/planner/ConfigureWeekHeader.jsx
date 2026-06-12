import { motion } from 'framer-motion';
import { Target, ListChecks, SlidersHorizontal } from 'lucide-react';

const STEPS = [
  {
    icon: Target,
    title: 'Pick muscles',
    desc: 'Tap each day — we match exercises for you',
    active: true,
  },
  {
    icon: ListChecks,
    title: 'Review exercises',
    desc: 'Auto-filled on the next screen',
    active: false,
  },
  {
    icon: SlidersHorizontal,
    title: 'Set weight & reps',
    desc: 'Fine-tune before you train',
    active: false,
  },
];

export function ConfigureWeekHeader({ splitLabel, weekLabel }) {
  return (
    <div className="configure-header">
      <div className="configure-header__top">
        <div>
          <h2 className="configure-header__title">Build your week</h2>
          <p className="configure-header__sub">
            {weekLabel} · <span>{splitLabel}</span>
          </p>
        </div>
      </div>
      <div className="configure-header__flow">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              className={`configure-header__step${step.active ? ' configure-header__step--active' : ''}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="configure-header__step-icon">
                <Icon size={16} />
              </span>
              <div>
                <strong>{step.title}</strong>
                <span>{step.desc}</span>
              </div>
              {i < STEPS.length - 1 && <span className="configure-header__connector" aria-hidden />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
