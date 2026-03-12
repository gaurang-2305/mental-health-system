import React from 'react';
import { RISK_COLORS, RISK_LABELS } from '../../utils/constants';

const RiskBadge = ({ risk = 'low', showIcon = true, size = 'sm', pulse = false }) => {
  const color = RISK_COLORS[risk] || RISK_COLORS.low;
  const label = RISK_LABELS[risk] || risk;

  const icons = {
    low: '🟢',
    moderate: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  const sizes = {
    xs: { padding: '2px 7px', fontSize: '10px' },
    sm: { padding: '3px 10px', fontSize: '11px' },
    md: { padding: '5px 14px', fontSize: '13px' },
    lg: { padding: '7px 18px', fontSize: '15px' },
  };

  const s = sizes[size] || sizes.sm;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        ...s,
        borderRadius: '999px',
        background: `${color}22`,
        color,
        fontWeight: 700,
        border: `1px solid ${color}44`,
        whiteSpace: 'nowrap',
        animation: pulse && (risk === 'critical' || risk === 'high') ? 'pulse 2s infinite' : undefined,
      }}
    >
      {showIcon && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
};

export default RiskBadge;