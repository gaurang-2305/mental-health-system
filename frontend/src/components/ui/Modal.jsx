import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  className = '',
}) => {
  const widths = { sm: '420px', md: '580px', lg: '740px', xl: '920px', full: '95vw' };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = e => { if (e.key === 'Escape' && closable && onClose) onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closable, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget && closable) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(44,31,18,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
        animation: 'backdropIn 0.18s ease',
      }}
    >
      <div
        className={className}
        style={{
          background: 'rgba(255,252,248,0.97)',
          border: '1px solid rgba(160,120,80,0.2)',
          borderRadius: 20,
          width: widths[size] || widths.md,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(44,31,18,0.22)',
        }}
      >
        {/* Header */}
        {(title || closable) && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 26px 18px',
            borderBottom: '1px solid rgba(160,120,80,0.12)',
            flexShrink: 0,
          }}>
            {title && (
              <h2 style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.3rem',
                fontWeight: 500,
                color: '#2c1f12',
                letterSpacing: '0.01em',
              }}>
                {title}
              </h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(160,120,80,0.08)',
                  border: '1px solid rgba(160,120,80,0.18)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#a8896e',
                  fontSize: 18,
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  marginLeft: 'auto',
                  fontFamily: 'system-ui',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(160,120,80,0.15)'; e.currentTarget.style.color = '#7a5c44'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(160,120,80,0.08)'; e.currentTarget.style.color = '#a8896e'; }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '22px 26px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', gap: 10,
            padding: '16px 26px',
            borderTop: '1px solid rgba(160,120,80,0.12)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.93) translateY(8px) }
          to   { opacity:1; transform:scale(1)    translateY(0)   }
        }
      `}</style>
    </div>
  );
};

export default Modal;