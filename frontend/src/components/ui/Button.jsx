import React from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    hover: 'var(--primary-dark)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    hover: 'rgba(255,255,255,0.14)',
  },
  danger: {
    background: 'rgba(248,113,113,0.15)',
    color: '#f87171',
    border: '1px solid rgba(248,113,113,0.3)',
    hover: 'rgba(248,113,113,0.25)',
  },
  success: {
    background: 'rgba(52,211,153,0.15)',
    color: '#34d399',
    border: '1px solid rgba(52,211,153,0.3)',
    hover: 'rgba(52,211,153,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    hover: 'rgba(255,255,255,0.06)',
  },
  warning: {
    background: 'rgba(251,191,36,0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(251,191,36,0.3)',
    hover: 'rgba(251,191,36,0.25)',
  },
};

const SIZES = {
  xs: { padding: '4px 10px', fontSize: '11px', borderRadius: '6px' },
  sm: { padding: '6px 14px', fontSize: '12px', borderRadius: '7px' },
  md: { padding: '9px 20px', fontSize: '14px', borderRadius: '8px' },
  lg: { padding: '12px 28px', fontSize: '15px', borderRadius: '10px' },
};

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...rest
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn btn-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        fontWeight: 600,
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...s,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;