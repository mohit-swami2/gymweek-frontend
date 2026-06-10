import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export function TestimonialsCarousel({ testimonials = [], title }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const current = testimonials[index];

  return (
    <div id="testimonials">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {title || 'What Lifters Say'}
      </motion.h2>
      <div className="testimonial-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id || current.authorName}
            className="gw-glass gw-glass--glow testimonial-card"
            initial={{ opacity: 0, rotate: -8, y: 20 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            exit={{ opacity: 0, rotate: -4, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="testimonial-card__stars">
              {Array.from({ length: current.rating || 5 }).map((_, i) => (
                <Star key={i} size={18} fill="#b6ff3b" color="#b6ff3b" />
              ))}
            </div>
            <blockquote className="testimonial-card__quote">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="testimonial-card__author">{current.authorName}</div>
            {current.authorDesignation && (
              <div className="testimonial-card__role">{current.authorDesignation}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {testimonials.length > 1 && (
        <div className="testimonial-nav">
          <button
            type="button"
            className="testimonial-nav__btn"
            onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`testimonial-nav__dot${i === index ? ' testimonial-nav__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
          <button
            type="button"
            className="testimonial-nav__btn"
            onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
