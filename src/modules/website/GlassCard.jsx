import { motion } from 'framer-motion';
import { useMouseTilt } from './hooks/useMouseTilt.js';

export function GlassCard({ children, className = '', tilt = true, style }) {
  const { ref, rotateX, rotateY, onMove, onLeave } = useMouseTilt(10);

  return (
    <motion.div
      ref={ref}
      onMouseMove={tilt ? onMove : undefined}
      onMouseLeave={tilt ? onLeave : undefined}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1200,
        ...style,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`gw-glass-card ${className}`.trim()}
    >
      <div className="gw-glass-card__glow" />
      <div className="gw-glass-card__inner">
        <div className="gw-glass-card__shine" />
        {children}
      </div>
    </motion.div>
  );
}
