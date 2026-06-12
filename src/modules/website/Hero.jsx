import { motion } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import { BenchPress3D } from './equipment/BenchPress3D.jsx';
import { SquatRack3D } from './equipment/SquatRack3D.jsx';
import { FloatingDashboard } from './FloatingDashboard.jsx';
import { MagneticButton } from './MagneticButton.jsx';
import { useCountUp } from './hooks/useCountUp.js';

function Stat({ value, decimals, suffix, label }) {
  const { ref, display } = useCountUp(value, 2200, decimals);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
        <span ref={ref} className="gw-hero__stat-value">{display}</span>
        {suffix && <span className="gw-hero__stat-suffix">{suffix}</span>}
      </div>
      <div className="gw-hero__stat-label">{label}</div>
    </div>
  );
}

function parseStatValue(raw) {
  const str = String(raw || '');
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  const suffix = str.replace(/[0-9.]/g, '').trim() || '';
  const decimals = str.includes('.') ? 1 : 0;
  return { num: Number.isFinite(num) ? num : 0, suffix, decimals };
}

export function Hero({ section }) {
  const content = section?.content || {};
  const stats = content.stats?.length
    ? content.stats
    : [
      { label: 'Active Users', value: '50K+' },
      { label: 'Exercises in Library', value: '211+' },
      { label: 'Rating', value: '4.9' },
    ];

  return (
    <section className="gw-hero">
      <div className="gw-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div className="gw-hero__badge">
            <span className="gw-hero__badge-dot" />
            <span className="gw-hero__badge-text">
              {content.badge || '#1 FITNESS TRACKING PLATFORM'}
            </span>
          </div>
        </motion.div>

        <div className="gw-hero__grid">
          <div className="gw-hero__side gw-hero__side--left">
            <FloatingDashboard
              variant="line"
              title={content.dashboardLeft?.title || 'Volume'}
              value={content.dashboardLeft?.value || '8,420'}
              delta={content.dashboardLeft?.delta || '+12.4%'}
              delay={0.4}
            />
            <BenchPress3D />
          </div>

          <div className="gw-hero__center">
            <motion.h1
              className="gw-hero__title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              {section?.title || 'GymWeek'}
            </motion.h1>
            <motion.p
              className="gw-hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
            >
              {section?.subtitle || 'Train smarter. Track harder. Crush every rep.'}
            </motion.p>
            <motion.div
              className="gw-hero__cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.5 }}
            >
              <MagneticButton variant="primary" to="/auth/register">
                <Play size={16} fill="currentColor" />
                {content.ctaPrimary || 'Sign Up'}
              </MagneticButton>
              <MagneticButton variant="ghost" to="/auth/login">
                {content.ctaSecondary || 'Login'}
                <ChevronRight size={16} />
              </MagneticButton>
            </motion.div>
          </div>

          <div className="gw-hero__side gw-hero__side--right">
            <FloatingDashboard
              variant="bar"
              title={content.dashboardRight?.title || 'Streak'}
              value={content.dashboardRight?.value || '42 days'}
              delta={content.dashboardRight?.delta || '+5 PRs'}
              delay={0.6}
            />
            <SquatRack3D />
          </div>
        </div>

        <motion.div
          className="gw-hero__stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        >
          {stats.map((s, i) => {
            const { num, suffix, decimals } = parseStatValue(s.value);
            return (
              <div key={s.label} style={{ display: 'contents' }}>
                {i > 0 && <div className="gw-hero__stat-divider" />}
                <Stat value={num} suffix={suffix} decimals={decimals} label={s.label} />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
