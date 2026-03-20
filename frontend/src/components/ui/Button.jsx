import React from 'react';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #3a2a18, #6b4e30)',
    color: '#f5ede0',
    border: 'none',
    hoverBg: 'linear-gradient(135deg, #2c1f12, #5c4228)',
  },
  secondary: {
    background: 'rgba(255,252,248,0.9)',
    color: '#6b5040',
    border: '1.5px solid rgba(160,120,80,0.28)',
    hoverBg: 'rgba(160,120,80,0.08)',
  },
  danger: {
    background: 'rgba(184,74,74,0.1)',
    color: '#b84a4a',
    border: '1.5px solid rgba(184,74,74,0.28)',
    hoverBg: 'rgba(184,74,74,0.18)',
  },
  success: {
    background: 'rgba(90,138,101,0.1)',
    color: '#5a8a65',
    border: '1.5px solid rgba(90,138,101,0.28)',
    hoverBg: 'rgba(90,138,101,0.18)',
  },
  ghost: {
    background: 'transparent',
    color: '#a8896e',
    border: 'none',
    hoverBg: 'rgba(160,120,80,0.08)',
  },
  warning: {
    background: 'rgba(184,140,24,0.1)',
    color: '#b88c18',
    border: '1.5px solid rgba(184,140,24,0.28)',
    hoverBg: 'rgba(184,140,24,0.18)',
  },
};

const SIZES = {
  xs: { padding: '4px 10px', fontSize: '11px',   borderRadius: '20px' },
  sm: { padding: '6px 14px', fontSize: '12px',   borderRadius: '20px' },
  md: { padding: '10px 22px', fontSize: '13.5px', borderRadius: '24px' },
  lg: { padding: '13px 30px', fontSize: '15px',  borderRadius: '28px' },
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
  const s = SIZES[size]    || SIZES.md;
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
        gap: 7,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        fontWeight: 600,
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.2px',
        boxShadow: variant === 'primary' ? '0 4px 14px rgba(58,42,24,0.22)' : 'none',
        ...s,
        ...style,
      }}
      onMouseEnter={!isDisabled ? e => {
        if (variant === 'primary') {
          e.currentTarget.style.background = v.hoverBg;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(58,42,24,0.3)';
        } else {
          e.currentTarget.style.background = v.hoverBg;
        }
      } : undefined}
      onMouseLeave={!isDisabled ? e => {
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.transform = 'none';
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 4px 14px rgba(58,42,24,0.22)';
      } : undefined}
      onMouseDown={!isDisabled ? e => { e.currentTarget.style.transform = 'scale(0.97)'; } : undefined}
      onMouseUp={!isDisabled ? e => { e.currentTarget.style.transform = 'none'; } : undefined}
      {...rest}
    >
      {loading ? (
        <span style={{
          width: '13px', height: '13px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </button>
  );
};

export default Button;