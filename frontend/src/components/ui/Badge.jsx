import React from 'react';

const VARIANTS = {
  default: { bg: 'rgba(160,120,80,0.1)',  color: '#7a5c44',  border: 'rgba(160,120,80,0.2)'  },
  primary: { bg: 'rgba(160,120,80,0.12)', color: '#a07850',  border: 'rgba(160,120,80,0.28)' },
  success: { bg: 'rgba(90,138,101,0.12)', color: '#5a8a65',  border: 'rgba(90,138,101,0.28)' },
  warning: { bg: 'rgba(184,140,24,0.12)', color: '#b88c18',  border: 'rgba(184,140,24,0.28)' },
  danger:  { bg: 'rgba(184,74,74,0.12)',  color: '#b84a4a',  border: 'rgba(184,74,74,0.28)'  },
  purple:  { bg: 'rgba(120,80,160,0.12)', color: '#7850a0',  border: 'rgba(120,80,160,0.28)' },
  info:    { bg: 'rgba(74,122,155,0.12)', color: '#4a7a9b',  border: 'rgba(74,122,155,0.28)' },
  low:      { bg: 'rgba(90,138,101,0.12)', color: '#5a8a65', border: 'rgba(90,138,101,0.28)' },
  moderate: { bg: 'rgba(184,140,24,0.12)', color: '#b88c18', border: 'rgba(184,140,24,0.28)' },
  high:     { bg: 'rgba(200,100,30,0.12)', color: '#c06420', border: 'rgba(200,100,30,0.28)' },
  critical: { bg: 'rgba(184,74,74,0.12)',  color: '#b84a4a', border: 'rgba(184,74,74,0.28)'  },
};

const Badge = ({
  variant = 'default',
  children,
  size = 'sm',
  dot = false,
  className = '',
  style = {},
}) => {
  const v = VARIANTS[variant] || VARIANTS.default;
  const padding = size === 'lg' ? '4px 12px' : size === 'sm' ? '2px 9px' : '3px 10px';
  const fontSize = size === 'lg' ? '12.5px' : '11px';

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding,
        borderRadius: '20px',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        letterSpacing: '0.2px',
        fontFamily: "'Outfit', sans-serif",
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: v.color,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
};

export default Badge;