'use client';

import { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';
import cn from 'classnames';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'p-4 rounded-md shadow-md border transition-all transform translate-y-0 opacity-100',
            {
              'bg-green-50 border-green-200': toast.type === 'success',
              'bg-red-50 border-red-200': toast.type === 'error',
              'bg-blue-50 border-blue-200': toast.type === 'info',
              'bg-yellow-50 border-yellow-200': toast.type === 'warning',
            }
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3
                className={cn('font-medium', {
                  'text-green-800': toast.type === 'success',
                  'text-red-800': toast.type === 'error',
                  'text-blue-800': toast.type === 'info',
                  'text-yellow-800': toast.type === 'warning',
                })}
              >
                {toast.title}
              </h3>
              {toast.description && (
                <p
                  className={cn('text-sm mt-1', {
                    'text-green-700': toast.type === 'success',
                    'text-red-700': toast.type === 'error',
                    'text-blue-700': toast.type === 'info',
                    'text-yellow-700': toast.type === 'warning',
                  })}
                >
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className={cn('p-1 rounded-md', {
                'text-green-700 hover:bg-green-100': toast.type === 'success',
                'text-red-700 hover:bg-red-100': toast.type === 'error',
                'text-blue-700 hover:bg-blue-100': toast.type === 'info',
                'text-yellow-700 hover:bg-yellow-100': toast.type === 'warning',
              })}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 