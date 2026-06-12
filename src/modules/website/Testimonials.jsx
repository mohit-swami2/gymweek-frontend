import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { GlassCard } from './GlassCard.jsx';

export function Testimonials({ testimonials = [], title }) {
  const [index, setIndex] = useState(0);
  const items = testimonials.length ? testimonials : [{
    quote: 'GymWeek changed the planner game. Cleanest interface, deepest analytics, and the streak tracker keeps me honest every single week.',
    authorName: 'Sarah Chen',
    authorDesignation: 'Powerlifter · 3 Year Member',
    rating: 5,
  }];

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index];

  return (
    <section id="testimonials" className="gw-testimonials">
      <div className="gw-container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {title || 'What Lifters Say'}
        </motion.h2>

        <div className="gw-testimonials__wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id || current.authorName || index}
              initial={{ opacity: 0, y: 50, rotateX: -8, rotateZ: -3 }}
              animate={{ opacity: 1, y: 0, rotateX: 4, rotateZ: -3 }}
              exit={{ opacity: 0, y: -30, rotateX: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: 'min(760px, 100%)' }}
            >
              <GlassCard className="gw-testimonial-card" tilt>
                <div className="gw-testimonial-card__body">
                  <div className="gw-testimonial-card__stars">
                    {Array.from({ length: current.rating || 5 }).map((_, i) => (
                      <Star key={i} size={20} fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px rgba(126,176,154,0.4))' }} />
                    ))}
                  </div>
                  <blockquote className="gw-testimonial-card__quote">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>
                  <div className="gw-testimonial-card__author">{current.authorName}</div>
                  {current.authorDesignation && (
                    <div className="gw-testimonial-card__role">{current.authorDesignation}</div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="gw-testimonials__nav">
            {items.map((t, i) => (
              <button
                key={t._id || t.authorName || i}
                type="button"
                className={`gw-testimonials__dot${i === index ? ' gw-testimonials__dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
