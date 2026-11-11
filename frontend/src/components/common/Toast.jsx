import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', durationMs = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 transform translate-y-0 text-xs font-sans select-none',
              t.type === 'success' && 'bg-surface border-status-success/40 text-ink shadow-status-success/5',
              t.type === 'error' && 'bg-surface border-status-error/40 text-ink shadow-status-error/5',
              t.type === 'info' && 'bg-surface border-border text-ink'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-status-success" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-status-error" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-brand" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <p className="leading-relaxed font-medium">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-ink-muted hover:text-ink transition-colors flex-shrink-0 p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return no-op fallback if used outside provider
    return {
      success: (msg) => console.log('[Toast Success]', msg),
      error: (msg) => console.error('[Toast Error]', msg),
      info: (msg) => console.log('[Toast Info]', msg),
    };
  }
  return context;
}
