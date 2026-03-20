import React from 'react';

const VARIANTS = {
  info: {
    bg:     'rgba(74,122,155,0.08)',
    border: 'rgba(74,122,155,0.28)',
    color:  '#4a7a9b',
    icon:   'ℹ',
  },
  success: {
    bg:     'rgba(90,138,101,0.08)',
    border: 'rgba(90,138,101,0.28)',
    color:  '#5a8a65',
    icon:   '✓',
  },
  warning: {
    bg:     'rgba(184,140,24,0.08)',
    border: 'rgba(184,140,24,0.28)',
    color:  '#b88c18',
    icon:   '!',
  },
  danger: {
    bg:     'rgba(184,74,74,0.08)',
    border: 'rgba(184,74,74,0.28)',
    color:  '#b84a4a',
    icon:   '!',
  },
  error: {
    bg:     'rgba(184,74,74,0.08)',
    border: 'rgba(184,74,74,0.28)',
    color:  '#b84a4a',
    icon:   '!',
  },
};

const Alert = ({
  type = 'info',
  title,
  children,
  message,
  onClose,
  className = '',
  icon: customIcon,
  style = {},
}) => {
  const content = children || message;
  if (!content && !title) return null;

  const variant = VARIANTS[type] || VARIANTS.info;

  return (
    <div
      className={`alert alert-${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '11px',
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1px solid ${variant.border}`,
        background: variant.bg,
        marginBottom: '14px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease',
        ...style,
      }}
      role="alert"
    >
      <span style={{
        fontSize: '14px', flexShrink: 0,
        width: '20px', height: '20px',
        borderRadius: '50%',
        background: `${variant.color}20`,
        border: `1.5px solid ${variant.color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: variant.color, fontWeight: 700,
        marginTop: '1px',
        fontFamily: 'system-ui',
      }}>
        {customIcon || variant.icon}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontWeight: 600, color: variant.color,
            marginBottom: content ? '3px' : 0,
            fontSize: '13.5px',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {title}
          </div>
        )}
        {content && (
          <div style={{
            color: variant.color,
            fontSize: '12.5px',
            lineHeight: 1.55,
            fontFamily: "'Outfit', sans-serif",
          }}>
            {content}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: variant.color,
            opacity: 0.55, fontSize: '17px', padding: '0',
            lineHeight: 1, flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default Alert;