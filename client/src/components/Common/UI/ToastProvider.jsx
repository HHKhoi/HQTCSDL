import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

import { ToastContext } from './ToastContext';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
              toast.type === 'success' 
                ? 'bg-white border-emerald-100 text-emerald-800' 
                : 'bg-white border-red-100 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="text-emerald-500" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
            <p className="text-sm font-bold">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-slate-300 hover:text-slate-500 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
