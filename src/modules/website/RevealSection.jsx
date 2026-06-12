import { useInView } from './hooks/useInView.js';

/** Fade/slide in on scroll — content stays mounted (no layout pop-in). */
export function RevealSection({ children, className = '', delay = 0 }) {
  const { ref, inView } = useInView({ rootMargin: '0px 0px -8% 0px', once: true });

  return (
    <div
      ref={ref}
      className={`gw-reveal${inView ? ' gw-reveal--visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
