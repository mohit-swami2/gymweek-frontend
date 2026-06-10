import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export function TestimonialsCarousel({ testimonials = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const current = testimonials[index];

  return (
    <section id="testimonials" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, marginBottom: '48px' }}>
          What Lifters Say
        </h2>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '40px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
            {Array.from({ length: current.rating }).map((_, i) => (
              <Star key={i} size={18} fill="var(--color-primary)" color="var(--color-primary)" />
            ))}
          </div>
          <blockquote style={{
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: 'var(--color-text)',
            fontStyle: 'italic',
            marginBottom: '24px',
          }}>
            &ldquo;{current.quote}&rdquo;
          </blockquote>
          <div style={{ fontWeight: 700 }}>{current.authorName}</div>
          {current.authorDesignation && (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {current.authorDesignation}
            </div>
          )}
        </div>
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              style={navBtnStyle}
            >
              <ChevronLeft size={20} />
            </button>
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: i === index ? 'var(--color-primary)' : 'var(--color-border)',
                  cursor: 'pointer',
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              style={navBtnStyle}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const navBtnStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '8px',
  cursor: 'pointer',
  color: 'var(--color-text)',
  display: 'flex',
  alignItems: 'center',
};
