import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  style = {},
  padding = '20px',
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
          ? 'rgba(255,255,255,0.04)'
          : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'all 0.2s' : undefined,
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
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
  color = 'var(--primary)',
  className = '',
  style = {},
}) => (
  <div
    className={`card ${className}`}
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px',
      ...style,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      {icon && (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          {icon}
        </div>
      )}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
      {value}
    </div>
    {trend !== undefined && (
      <div
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: trendUp ? '#34d399' : '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{trendUp ? '↑' : '↓'}</span>
        <span>{trend}</span>
      </div>
    )}
  </div>
);

export default Card;