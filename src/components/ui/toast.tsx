'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let emitToast: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  if (emitToast) emitToast(message, type);
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-300',
  error:   'border-red-500/30 bg-red-950/80 text-red-300',
  info:    'border-blue-500/30 bg-blue-950/80 text-blue-300',
};

const iconColorMap = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-blue-400',
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    emitToast = addToast;
    return () => { emitToast = null; };
  }, [addToast]);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon = iconMap[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-sm font-medium max-w-xs ${colorMap[t.type]}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColorMap[t.type]}`} />
              <span className="flex-1 text-slate-100">{t.message}</span>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
