import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export function MagneticButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  to,
  type = 'button',
  size = 'md',
  disabled = false,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el || disabled) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const classes = `gw-btn gw-btn--${variant}${size === 'sm' ? ' gw-btn--sm' : ''} ${className}`.trim();

  const shared = {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    style: { x: sx, y: sy },
    whileHover: disabled ? {} : { scale: 1.04 },
    whileTap: disabled ? {} : { scale: 0.97 },
    className: classes,
  };

  if (to) {
    return (
      <motion.div {...shared} style={{ ...shared.style, display: 'inline-block' }}>
        <Link to={to} className={classes} onClick={onClick} style={{ display: 'inline-flex', textDecoration: 'none' }}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...shared}>
      {children}
    </motion.button>
  );
}
