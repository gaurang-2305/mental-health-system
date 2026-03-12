import React from 'react';

const VARIANTS = {
  default: { bg: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' },
  primary: { bg: 'rgba(79,142,247,0.2)', color: '#4f8ef7' },
  success: { bg: 'rgba(52,211,153,0.2)', color: '#34d399' },
  warning: { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
  danger: { bg: 'rgba(248,113,113,0.2)', color: '#f87171' },
  purple: { bg: 'rgba(167,139,250,0.2)', color: '#a78bfa' },
  info: { bg: 'rgba(34,211,238,0.2)', color: '#22d3ee' },
  low: { bg: 'rgba(52,211,153,0.2)', color: '#34d399' },
  moderate: { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
  high: { bg: 'rgba(249,115,22,0.2)', color: '#f97316' },
  critical: { bg: 'rgba(248,113,113,0.2)', color: '#f87171' },
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
  const padding = size === 'lg' ? '4px 12px' : size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'lg' ? '13px' : '11px';

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '999px',
        background: v.bg,
        color: v.color,
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: v.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;