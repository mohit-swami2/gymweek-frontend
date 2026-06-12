import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export function getExerciseMediaUrls(exercise) {
  if (!exercise) return [];
  if (exercise.mediaPreviewUrls?.length) return exercise.mediaPreviewUrls;
  if (exercise.mediaPreviewUrl) return [exercise.mediaPreviewUrl];
  if (exercise.mediaUrls?.length) return exercise.mediaUrls;
  if (exercise.gifUrl) return [exercise.gifUrl];
  return [];
}

const FADE = { duration: 0.55, ease: [0.4, 0, 0.2, 1] };
const FRAME_MS = 1500;

export function ExerciseMedia({ exercise, alt, variant = 'card', autoPlay = true }) {
  const urls = getExerciseMediaUrls(exercise);
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFrame(0);
    setReady(false);
  }, [exercise?._id, urls.join('|')]);

  useEffect(() => {
    if (!urls.length) return undefined;
    let cancelled = false;
    Promise.all(
      urls.map((url) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      }))
    ).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [urls]);

  useEffect(() => {
    if (!autoPlay || urls.length <= 1 || !ready) return undefined;
    const id = setInterval(() => setFrame((f) => (f + 1) % urls.length), FRAME_MS);
    return () => clearInterval(id);
  }, [autoPlay, urls.length, ready]);

  if (!urls.length) {
    return (
      <div className={`workout-log__media workout-log__media--${variant} workout-log__media--empty`}>
        <ImageOff size={variant === 'hero' || variant === 'picker-full' ? 28 : 18} />
      </div>
    );
  }

  const go = (dir) => setFrame((f) => (f + dir + urls.length) % urls.length);

  return (
    <div className={`workout-log__media workout-log__media--${variant}`}>
      <div className="workout-log__media-stage">
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={`${urls[frame]}-${frame}`}
            src={urls[frame]}
            alt={alt}
            className="workout-log__media-img"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={FADE}
          />
        </AnimatePresence>
        {!ready && <div className="workout-log__media-shimmer" aria-hidden />}
      </div>
      {urls.length > 1 && (
        <>
          <div className="workout-log__media-dots">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`workout-log__media-dot${i === frame ? ' workout-log__media-dot--active' : ''}`}
                onClick={() => setFrame(i)}
                aria-label={`Frame ${i + 1}`}
              />
            ))}
          </div>
          {(variant === 'hero' || variant === 'picker' || variant === 'picker-full') && (
            <div className="workout-log__media-nav">
              <button type="button" onClick={() => go(-1)} aria-label="Previous frame">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next frame">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
