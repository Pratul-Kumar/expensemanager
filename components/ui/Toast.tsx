'use client';

import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { Toast, ToastType } from '@/hooks/useToast';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-green-500 shrink-0" />,
  error: <XCircle size={16} className="text-red-500 shrink-0" />,
  info: <Info size={16} className="text-blue-500 shrink-0" />,
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  return (
    <div
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg max-w-sm w-full animate-toast-in"
      role="alert"
    >
      {icons[toast.type]}
      <span className="text-sm text-gray-800 flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-6 sm:right-4 sm:left-auto sm:translate-x-0 z-[100] flex flex-col gap-2 items-center sm:items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
