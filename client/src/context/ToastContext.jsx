import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      success: (message, duration) => showToast(message, "success", duration),
      error: (message, duration) => showToast(message, "danger", duration),
      info: (message, duration) => showToast(message, "info", duration),
      warning: (message, duration) => showToast(message, "warning", duration)
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "72px",
          right: "16px",
          zIndex: 2000,
          width: "min(360px, calc(100vw - 32px))"
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className={`alert alert-${toast.type} shadow-sm py-2 px-3 mb-2`} role="alert">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <span>{toast.message}</span>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
