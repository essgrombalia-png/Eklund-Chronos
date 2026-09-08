import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      id="toast-notification"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-900 bg-white/95 dark:text-neutral-100 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 max-w-[calc(100vw-2rem)]"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
      </span>
      <span className="truncate">{message}</span>
    </div>
  );
};
