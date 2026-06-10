import { motion } from 'framer-motion';

export function FloatingAsset({
  src,
  alt = '',
  className = '',
  delay = 0,
  parallax = { x: 0, y: 0 },
  duration = 5,
}) {
  return (
    <motion.div
      className={`floating-asset-wrap ${className}`}
      style={{ x: parallax.x, y: parallax.y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="floating-asset"
        draggable={false}
        loading="eager"
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
        whileHover={{ scale: 1.04 }}
      />
    </motion.div>
  );
}
