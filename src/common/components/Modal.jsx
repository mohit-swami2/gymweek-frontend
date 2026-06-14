import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, size = 'md', backdrop = 'dark', scrollBody = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`modal-overlay${backdrop === 'blue' ? ' modal-overlay--blue' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`modal modal--${size}${scrollBody ? ' modal--scroll' : ''}`}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="modal__header">
                {title && <h2 className="modal__title">{title}</h2>}
                {onClose && (
                  <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className={`modal__body${scrollBody ? ' modal__body--scroll' : ''}`}>{children}</div>
            {footer && <div className="modal__footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
