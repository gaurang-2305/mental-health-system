import React from 'react';

const Loader = ({
  size = 'md',
  color = '#a07850',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  const sizes = { sm: 20, md: 36, lg: 52 };
  const dim = sizes[size] || sizes.md;

  const spinner = (
    <div className={className} style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '14px',
    }}>
      <div style={{
        width: dim, height: dim,
        border: `${dim > 30 ? 3 : 2}px solid rgba(160,120,80,0.15)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && (
        <span style={{
          color: '#c4a882', fontSize: '13px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.3px',
        }}>
          {text}
        </span>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', zIndex: 9999,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const PageLoader = ({ text = 'Loading…' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '320px', flexDirection: 'column', gap: '16px',
  }}>
    <div style={{
      width: 44, height: 44,
      border: '3px solid rgba(160,120,80,0.15)',
      borderTopColor: '#a07850',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{
      color: '#c4a882', fontSize: '14px',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {text}
    </span>
    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default Loader;