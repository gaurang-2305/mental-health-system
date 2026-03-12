import React from 'react';

const Loader = ({
  size = 'md',
  color = 'var(--primary)',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  const sizes = { sm: 20, md: 36, lg: 52 };
  const dim = sizes[size] || sizes.md;

  const spinner = (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          border: `${dim > 30 ? 3 : 2}px solid rgba(255,255,255,0.1)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && (
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const PageLoader = ({ text = 'Loading...' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{text}</span>
  </div>
);

export default Loader;