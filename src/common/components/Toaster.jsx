import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-family)',
        },
        classNames: {
          success: 'toast-success',
          error: 'toast-error',
        },
      }}
      richColors
    />
  );
}
