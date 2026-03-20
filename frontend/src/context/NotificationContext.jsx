import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);
let notifId = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++notifId;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const success  = useCallback((msg, d) => addToast(msg, 'success', d), [addToast]);
  const error    = useCallback((msg, d) => addToast(msg, 'danger', d), [addToast]);
  const warning  = useCallback((msg, d) => addToast(msg, 'warning', d), [addToast]);
  const info     = useCallback((msg, d) => addToast(msg, 'info', d), [addToast]);

  const TOAST_STYLES = {
    success: { accent: '#34d399', icon: '✓', iconBg: 'rgba(52,211,153,0.15)' },
    danger:  { accent: '#fb7185', icon: '✕', iconBg: 'rgba(251,113,133,0.15)' },
    warning: { accent: '#fbbf24', icon: '⚠', iconBg: 'rgba(251,191,36,0.15)' },
    info:    { accent: '#2dd4bf', icon: 'ℹ', iconBg: 'rgba(45,212,191,0.15)' },
  };

  return (
    <NotificationContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        gap: '10px', maxWidth: '380px', pointerEvents: 'none',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}>
        {toasts.map(toast => {
          const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div key={toast.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '13px 16px',
              background: 'linear-gradient(145deg, #132240, #0d1a30)',
              border: `1px solid ${s.accent}30`,
              borderLeft: `3px solid ${s.accent}`,
              borderRadius: '14px',
              boxShadow: `0 8px 30px rgba(0,8,20,0.5), 0 0 20px ${s.accent}10`,
              animation: 'slideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
              pointerEvents: 'all',
              cursor: 'pointer',
            }} onClick={() => removeToast(toast.id)}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.iconBg, border: `1px solid ${s.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: s.accent, fontWeight: 700, flexShrink: 0,
              }}>{s.icon}</div>
              <span style={{ fontSize: '13px', color: '#dce8f5', flex: 1, lineHeight: 1.55 }}>
                {toast.message}
              </span>
              <button onClick={() => removeToast(toast.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '16px', padding: 0, lineHeight: 1, flexShrink: 0,
              }}>×</button>
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
    return {
      success: (msg) => console.log('✓', msg),
      error: (msg) => console.error('✕', msg),
      warning: (msg) => console.warn('⚠', msg),
      info: (msg) => console.info('ℹ', msg),
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
};

export default NotificationContext;