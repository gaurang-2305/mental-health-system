import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let notifId = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++notifId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'danger', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  const TOAST_COLORS = {
    success: { bg: '#34d399', icon: '✅' },
    danger: { bg: '#f87171', icon: '❌' },
    warning: { bg: '#fbbf24', icon: '⚠️' },
    info: { bg: '#4f8ef7', icon: 'ℹ️' },
  };

  return (
    <NotificationContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '360px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const c = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                background: 'var(--surface)',
                border: `1px solid ${c.bg}44`,
                borderLeft: `4px solid ${c.bg}`,
                borderRadius: '10px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.25s ease',
                pointerEvents: 'all',
                cursor: 'pointer',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  padding: 0,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Fallback for components not wrapped in provider
    return {
      success: (msg) => console.log('✅', msg),
      error: (msg) => console.error('❌', msg),
      warning: (msg) => console.warn('⚠️', msg),
      info: (msg) => console.info('ℹ️', msg),
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
};

export default NotificationContext;