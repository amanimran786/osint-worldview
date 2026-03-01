import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const colorMap = {
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  success: 'border-green-500/40 bg-green-500/10 text-green-400',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
};

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl animate-slide-in',
        colorMap[type],
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Container for floating toasts, renders in bottom-right corner.
 */
export function ToastContainer({ toasts, onDismiss }: {
  toasts: Array<{ id: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
}
