import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';

const ACCENT = '#7eb09a';
const VIOLET = '#9b8ec4';

function getParticleCount() {
  if (typeof window === 'undefined') return 28;
  const narrow = window.innerWidth < 768;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (narrow || coarse) return 18;
  return 28;
}

export function ParticleField({ enabled = true }) {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let raf = 0;
    let visible = !document.hidden;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = Math.floor(canvas.offsetWidth * dpr);
      h = canvas.height = Math.floor(canvas.offsetHeight * dpr);
    };
    resize();

    const count = getParticleCount();
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.2 + 0.35) * dpr,
      vx: (Math.random() - 0.5) * 0.12 * dpr,
      vy: (Math.random() - 0.8) * 0.2 * dpr,
      a: Math.random() * 0.35 + 0.12,
      hue: Math.random() > 0.65 ? ACCENT : VIOLET,
    }));

    const onResize = () => resize();
    const onVisibility = () => { visible = !document.hidden; };

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.hue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, reducedMotion]);

  if (reducedMotion || !enabled) return null;

  return <canvas ref={canvasRef} className="gw-particles" aria-hidden="true" />;
}
