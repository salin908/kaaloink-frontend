import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type !== 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full">
      <div
        className={`border backdrop-blur-md p-4 rounded-sm shadow-2xl flex items-center justify-between gap-3 text-white font-nav text-xs tracking-[1px] ${
          isSuccess
            ? 'bg-zinc-950/90 border-emerald-500/60 text-emerald-200'
            : 'bg-zinc-950/90 border-red-500/60 text-red-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <p className="leading-snug">{toast.message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition p-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
