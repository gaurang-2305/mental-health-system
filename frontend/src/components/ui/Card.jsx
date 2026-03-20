import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  style = {},
  padding = '22px 24px',
  hover = false,
  onClick,
  glass = false,
}) => {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        background: glass
          ? 'rgba(255,252,248,0.6)'
          : 'rgba(255,252,248,0.92)',
        border: '1px solid rgba(160,120,80,0.15)',
        borderRadius: 16,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 12px rgba(80,50,20,0.07)',
        transition: hover ? 'box-shadow 0.2s, transform 0.2s' : undefined,
        backdropFilter: glass ? 'blur(12px)' : undefined,
        ...style,
      }}
      onMouseEnter={hover && onClick ? e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(80,50,20,0.13)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      } : undefined}
      onMouseLeave={hover && onClick ? e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(80,50,20,0.07)';
        e.currentTarget.style.transform = 'none';
      } : undefined}
    >
      {(title || action) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18,
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid rgba(160,120,80,0.1)',
        }}>
          <div>
            {title && (
              <h3 style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.15rem',
                fontWeight: 500,
                color: '#2c1f12',
                letterSpacing: '0.01em',
              }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{
                margin: '3px 0 0',
                fontSize: 11.5,
                color: '#c4a882',
                fontFamily: "'Outfit', sans-serif",
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendUp,
  sub,
  color = '#a07850',
  className = '',
  style = {},
}) => (
  <div
    className={`card ${className}`}
    style={{
      background: 'rgba(255,252,248,0.92)',
      border: '1px solid rgba(160,120,80,0.15)',
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: '0 2px 12px rgba(80,50,20,0.07)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 22px rgba(80,50,20,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(80,50,20,0.07)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{
        fontSize: 10.5,
        color: '#a8896e',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {label}
      </span>
      {icon && (
        <div style={{
          width: 34, height: 34,
          borderRadius: 9,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color,
          border: `1px solid ${color}25`,
        }}>
          {icon}
        </div>
      )}
    </div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '2rem',
      fontWeight: 600,
      color,
      lineHeight: 1,
      marginBottom: 5,
    }}>
      {value}
    </div>
    {(trend !== undefined || sub) && (
      <div style={{
        fontSize: 11.5,
        color: trend !== undefined
          ? (trendUp ? '#5a8a65' : '#b84a4a')
          : '#c4a882',
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: "'Outfit', sans-serif",
      }}>
        {trend !== undefined && <span>{trendUp ? '↑' : '↓'}</span>}
        <span>{sub || trend}</span>
      </div>
    )}
  </div>
);

export default Card;