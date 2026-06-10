import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand
      visibleToasts={4}
      gap={12}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'gymweek-toast',
          title: 'gymweek-toast__title',
          description: 'gymweek-toast__desc',
          success: 'gymweek-toast--success',
          error: 'gymweek-toast--error',
          warning: 'gymweek-toast--warning',
          info: 'gymweek-toast--info',
          actionButton: 'gymweek-toast__action',
          cancelButton: 'gymweek-toast__cancel',
          closeButton: 'gymweek-toast__close',
        },
      }}
    />
  );
}
