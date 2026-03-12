import React, { useState } from 'react';

const CrisisBanner = ({ risk = 'high', onDismiss, onSeekHelp }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const configs = {
    critical: {
      bg: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
      border: '#f87171',
      icon: '🚨',
      title: 'Crisis Alert — Immediate Support Available',
      message:
        'Your responses indicate you may be in crisis. Please reach out immediately. You are not alone.',
    },
    high: {
      bg: 'linear-gradient(135deg, #431407, #7c2d12)',
      border: '#f97316',
      icon: '⚠️',
      title: 'High Stress Detected',
      message:
        "We're concerned about your wellbeing. Please consider speaking with a counselor today.",
    },
  };

  const config = configs[risk] || configs.high;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        animation: 'fadeIn 0.3s ease',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '28px', flexShrink: 0 }}>{config.icon}</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
          {config.title}
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          {config.message}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="tel:9152987821"
            style={{
              background: '#f87171',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📞 iCall: 9152987821
          </a>
          <a
            href="tel:104"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            🏥 NIMHANS: 080-46110007
          </a>
          {onSeekHelp && (
            <button
              onClick={onSeekHelp}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
            >
              💬 Talk to a Counselor
            </button>
          )}
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '18px',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default CrisisBanner;