import { motion } from 'framer-motion';
import { Flame, BarChart3, Calendar } from 'lucide-react';
import { PerspectiveGrid } from './PerspectiveGrid.jsx';
import { useMouseParallax } from './hooks/useMouseParallax.js';
import { FEATURE_CARD_IMAGES } from './landingAssets.js';

const ICON_MAP = { flame: Flame, chart: BarChart3, calendar: Calendar };
const CARD_ROTATIONS = [-8, 0, 8];

function FeatureCardImage({ src, index, parallax }) {
  const px = parallax.x * (index === 1 ? 0.35 : 0.7);
  const py = parallax.y * (index === 1 ? 0.35 : 0.7);

  return (
    <motion.div
      className="feature-card-img-wrap"
      style={{ x: px, y: py }}
      initial={{ opacity: 0, y: 50, rotate: CARD_ROTATIONS[index] }}
      whileInView={{ opacity: 1, y: 0, rotate: CARD_ROTATIONS[index] }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        rotate: 0,
        y: -14,
        scale: 1.02,
        transition: { duration: 0.35 },
      }}
    >
      <motion.img
        src={src}
        alt=""
        className="feature-card-img"
        draggable={false}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

function FeatureCardGlass({ card, index, parallax }) {
  const Icon = card.sub ? (ICON_MAP[card.sub.icon] || Flame) : null;
  const px = parallax.x * 0.5;
  const py = parallax.y * 0.5;

  return (
    <motion.div
      style={{ x: px, y: py }}
      initial={{ opacity: 0, y: 50, rotate: CARD_ROTATIONS[index] }}
      whileInView={{ opacity: 1, y: 0, rotate: CARD_ROTATIONS[index] }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0, y: -14, transition: { duration: 0.35 } }}
    >
      <div className="gw-glass gw-glass--glow feature-tilted-card feature-tilted-card--glass">
        <h3 className="feature-tilted-card__heading">{card.heading}</h3>
        <p className="feature-tilted-card__body">{card.body}</p>
        {card.sub && (
          <div className="feature-tilted-card__sub">
            <div className="feature-tilted-card__sub-icon">
              {Icon && <Icon size={20} />}
            </div>
            <div>
              <div className="feature-tilted-card__sub-title">{card.sub.title}</div>
              {card.sub.desc && (
                <div className="feature-tilted-card__sub-desc">{card.sub.desc}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AboutSection({ section, features }) {
  const parallax = useMouseParallax(10);
  const blocks = section?.content?.blocks || [];
  const featureItems = features?.content?.items || [];
  const cards = blocks.map((block, i) => ({
    heading: block.heading,
    body: block.body,
    sub: featureItems[i] || null,
    image: FEATURE_CARD_IMAGES[i] || null,
  }));

  return (
    <section id="about" className="features-section">
      <PerspectiveGrid />
      <div className="features-section__inner">
        <motion.div
          className="features-section__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="features-section__title">
            {section?.title || 'Built for Serious Lifters'}
          </h2>
          {section?.subtitle && (
            <p className="features-section__subtitle">{section.subtitle}</p>
          )}
        </motion.div>

        {cards.length > 0 && (
          <div id="features" className="features-tilted-row">
            {cards.map((card, i) =>
              card.image ? (
                <FeatureCardImage key={card.heading} src={card.image} index={i} parallax={parallax} />
              ) : (
                <FeatureCardGlass key={card.heading} card={card} index={i} parallax={parallax} />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
