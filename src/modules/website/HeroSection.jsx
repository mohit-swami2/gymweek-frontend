import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { LANDING_ASSETS } from './landingAssets.js';
import { FloatingAsset } from './FloatingAsset.jsx';
import { useMouseParallax } from './hooks/useMouseParallax.js';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroSection({ section }) {
  const content = section?.content || {};
  const stats = content.stats || [];
  const parallax = useMouseParallax(14);

  return (
    <section className="hero-section">
      <div className="hero-section__assets" aria-hidden="true">
        <FloatingAsset
          src={LANDING_ASSETS.monitor}
          className="hero-asset hero-asset--monitor"
          delay={0}
          parallax={{ x: parallax.x * 0.6, y: parallax.y * 0.4 }}
          duration={5.5}
        />
        <FloatingAsset
          src={LANDING_ASSETS.floatingTech}
          className="hero-asset hero-asset--tech-tr"
          delay={0.2}
          parallax={{ x: parallax.x * -0.5, y: parallax.y * 0.5 }}
          duration={6}
        />
        <FloatingAsset
          src={LANDING_ASSETS.bench}
          className="hero-asset hero-asset--bench"
          delay={0.35}
          parallax={{ x: parallax.x * 0.45, y: parallax.y * -0.35 }}
          duration={5.2}
        />
        <FloatingAsset
          src={LANDING_ASSETS.floatingTech}
          className="hero-asset hero-asset--tech-br"
          delay={0.5}
          parallax={{ x: parallax.x * -0.4, y: parallax.y * -0.4 }}
          duration={6.5}
        />
      </div>

      <div className="hero-section__center">
        <motion.div
          className="hero-section__badge"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          {content.badge || '#1 Fitness Training Platform'}
        </motion.div>

        <motion.div
          className="hero-section__title-wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <img
            src={LANDING_ASSETS.scriptTitle}
            alt={section?.title || 'GymWeek'}
            className="hero-section__title-img"
            draggable={false}
          />
        </motion.div>

        <motion.p
          className="hero-section__subtitle"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          {section?.subtitle || 'Train smarter. Track harder. Crush every rep.'}
        </motion.p>

        <motion.div
          className="hero-section__actions"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link to="/auth/register" className="hero-section__btn-primary">
              {content.ctaPrimary || 'Sign Up'}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link to="/auth/login" className="hero-section__btn-secondary">
              {content.ctaSecondary || 'Login'}
            </Link>
          </motion.div>
        </motion.div>

        {stats.length > 0 && (
          <motion.div
            className="hero-section__stats"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            {stats.map((stat) => {
              const isRating = /rating/i.test(stat.label);
              return (
                <div key={stat.label} className="hero-section__stat">
                  <div className="hero-section__stat-value">
                    {stat.value}
                    {isRating && <Star size={22} fill="#b6ff3b" color="#b6ff3b" />}
                  </div>
                  <div className="hero-section__stat-label">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
