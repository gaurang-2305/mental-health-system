import React from 'react';

const VARIANTS = {
  info: {
    bg: 'rgba(79,142,247,0.12)',
    border: 'rgba(79,142,247,0.4)',
    color: '#4f8ef7',
    icon: 'ℹ️',
  },
  success: {
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.4)',
    color: '#34d399',
    icon: '✅',
  },
  warning: {
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.4)',
    color: '#fbbf24',
    icon: '⚠️',
  },
  danger: {
    bg: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.4)',
    color: '#f87171',
    icon: '🚨',
  },
};

const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  icon: customIcon,
  style = {},
}) => {
  const variant = VARIANTS[type] || VARIANTS.info;

  return (
    <div
      className={`alert alert-${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${variant.border}`,
        background: variant.bg,
        marginBottom: '12px',
        position: 'relative',
        ...style,
      }}
      role="alert"
    >
      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
        {customIcon || variant.icon}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <div
            style={{
              fontWeight: 600,
              color: variant.color,
              marginBottom: children ? '4px' : 0,
              fontSize: '14px',
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '16px',
            padding: '0',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;